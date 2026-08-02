import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

import { getApps } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (!getApps().length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account.');
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin features like backend enquiries will fail.');
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin:', e);
}

const DEFAULT_ADMIN_EMAILS = [
  "tenantownerofficial@gmail.com",
  "t21shar@gmail.com",
  "t21shar9891851774@gmail.com"
];

const adminEmailsList = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...(process.env.ADMIN_EMAILS || "").split(",")
  ].map(email => email.trim().toLowerCase()).filter(Boolean))
);

function isAdminEmail(email?: string | null) {
  return Boolean(email) &&
    adminEmailsList.includes(email!.trim().toLowerCase());
}

// In-memory rate limiting structures
const ipRateLimits = new Map<string, { count: number, resetAt: number }>();
const uidBurstLimits = new Map<string, { attempts: number, resetAt: number, lastAttempt: number }>();

function checkBurstLimits(ip: string, uid: string) {
    const now = Date.now();
    // IP limit: 20 req / minute
    let ipData = ipRateLimits.get(ip);
    if (!ipData || now > ipData.resetAt) {
        ipData = { count: 0, resetAt: now + 60000 };
    }
    ipData.count++;
    ipRateLimits.set(ip, ipData);
    if (ipData.count > 20) {
        return { limited: true, reason: 'ip' };
    }

    // UID burst limit: 1 request every 10 seconds, 10 per 10 minutes
    let uidData = uidBurstLimits.get(uid);
    if (!uidData || now > uidData.resetAt) {
        uidData = { attempts: 0, resetAt: now + 600000, lastAttempt: 0 };
    }
    if (now - uidData.lastAttempt < 10000) {
        return { limited: true, reason: 'fast' };
    }
    uidData.attempts++;
    uidData.lastAttempt = now;
    uidBurstLimits.set(uid, uidData);
    if (uidData.attempts > 10) {
        return { limited: true, reason: 'burst' };
    }
    return { limited: false };
}


// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 3000;

app.use(express.json());

// Create uploads directory if it doesn't exist (used for temp storage)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

  // Multer config for temporary file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images and web-friendly videos are allowed.'));
      }
    }
  });

  // API endpoint for file uploads using Cloudinary
  app.post("/api/upload", (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req, res) => {
    const uploadedFile = req.file?.path;
    const cleanup = () => {
      try {
        if (uploadedFile && fs.existsSync(uploadedFile)) {
           fs.unlinkSync(uploadedFile);
        }
      } catch (err) {
        console.error("Cleanup failed:", err);
      }
    };

    try {
      if (!getApps().length) {
        cleanup();
        return res.status(503).json({ error: "Service Unavailable: Firebase Admin not configured." });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        cleanup();
        return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      }
      
      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
        cleanup();
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
         
      if (!isAdminEmail(decodedToken.email)) {
         cleanup();
         return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      if (!req.file) {
        cleanup();
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
         cleanup();
         return res.status(503).json({ error: "Cloudinary credentials not configured" });
      }

      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tenantowner_properties", // Optional: organize in a folder
      });
      
      cleanup();
      return res.status(200).json({ 
        success: true, 
        url: result.secure_url 
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      cleanup();
      return res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // API endpoint for BHK Classification
  app.post("/api/classify-bhk", async (req, res) => {
    try {
      if (!getApps().length) {
        return res.status(503).json({ error: "Service Unavailable: Firebase Admin not configured." });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      }
      
      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
         
      if (!isAdminEmail(decodedToken.email)) {
         return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { description } = req.body;
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: "Description must be a valid string" });
      }
      const trimmedDesc = description.trim();
      if (trimmedDesc.length === 0 || trimmedDesc.length > 5000) {
        return res.status(400).json({ error: "Description must be between 1 and 5000 characters" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert real estate data classifier. Your job is to analyze raw property descriptions, titles, or details, and classify them into one of our standard "BHK Type" filter categories.

You must ONLY choose from these exact categories:
- 1 BHK
- 2 BHK
- 2 BHK + Study
- 3 BHK + 2T
- 3 BHK + 3T
- 3 BHK + 3T + Servant

Rules:
1. If a property has 3 bedrooms and 2 toilets, classify it exactly as "3 BHK + 2T".
2. If a property has 3 bedrooms and 3 toilets, classify it as "3 BHK + 3T". If it also mentions a servant room, use "3 BHK + 3T + Servant".
3. If the text mentions an extra study room or kids' room with a 2 BHK, use "2 BHK + Study".
4. If the data doesn't match any, return "Other".
5. Always respond in a structured JSON format with a single key "category".

Data to classify:
${description}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              category: {
                type: "STRING",
                enum: [
                  "1 BHK",
                  "2 BHK",
                  "2 BHK + Study",
                  "3 BHK + 2T",
                  "3 BHK + 3T",
                  "3 BHK + 3T + Servant",
                  "Other"
                ]
              }
            },
            required: ["category"]
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const result = JSON.parse(text);
        return res.json(result);
      } else {
        return res.status(500).json({ error: "No response from AI" });
      }
    } catch (error) {
      console.error("AI Classification Error:", error);
      res.status(500).json({ error: "Failed to classify property" });
    }
  });


  // Secure API endpoint for property enquiries
  app.post("/api/enquiries", async (req, res) => {
    try {
      if (!getApps().length) {
        return res.status(500).json({ error: "Backend not fully configured. Missing Firebase Admin." });
      }

      // 1. App Check verification
      const appCheckToken = req.headers['x-firebase-appcheck'];
      if (!appCheckToken || typeof appCheckToken !== 'string') {
          return res.status(403).json({ error: 'This request could not be verified. Refresh the page and try again.' });
      }
      try {
          await admin.appCheck().verifyToken(appCheckToken);
      } catch (err) {
          return res.status(403).json({ error: 'This request could not be verified. Refresh the page and try again.' });
      }

      // 2. Auth verification
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Please sign in to submit an enquiry." });
      }
      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
          decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
          return res.status(401).json({ error: "Please sign in to submit an enquiry." });
      }
      
      const uid = decodedToken.uid;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';

      // 3. Burst Rate Limiting
      const burstCheck = checkBurstLimits(ip, uid);
      if (burstCheck.limited) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
      }

      // 4. Input Validation
      const { propertyId, propertyTitle, propertyLink, userName, userEmail, userPhone, source, message, visitDate, listingType } = req.body;
      if (!propertyId || typeof propertyId !== 'string' || propertyId.length > 100) return res.status(400).json({ error: 'Invalid property ID' });
      if (userName && typeof userName !== 'string') return res.status(400).json({ error: 'Invalid name format' });
      if (userPhone && typeof userPhone !== 'string') return res.status(400).json({ error: 'Invalid phone format' });
      
      // 5. Firestore Transaction (Daily Limit + Atomicity)
      const db = admin.firestore();
      
      // Format current date in Asia/Kolkata timezone
      const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
      const dateParts = formatter.formatToParts(new Date());
      let dateKey = '';
      let y='', m='', d='';
      for (const p of dateParts) { if (p.type==='year') y=p.value; if(p.type==='month') m=p.value; if(p.type==='day') d=p.value; }
      dateKey = `${y}-${m}-${d}`;
      
      const limitRefId = `${uid}_${dateKey}`;
      const dailyLimitRef = db.collection('enquiryRateLimits').doc(limitRefId);
      const idempotencyKey = `${propertyId}_${uid}`;
      const lockRef = db.collection('enquiry_locks').doc(idempotencyKey);
      const propertyRef = db.collection('properties').doc(propertyId);
      
      await db.runTransaction(async (t) => {
          const limitDoc = await t.get(dailyLimitRef);
          const limitData = limitDoc.data();
          const count = limitData?.count || 0;
          if (count >= 5) {
              throw new Error('DAILY_LIMIT_REACHED');
          }
          
          const lockDoc = await t.get(lockRef);
          if (lockDoc.exists) {
              throw new Error('ALREADY_ENQUIRED');
          }
          
          const propDoc = await t.get(propertyRef);
          if (!propDoc.exists) {
              throw new Error('PROPERTY_NOT_FOUND');
          }
          
          const propData = propDoc.data();
          if (propData?.listingType === 'rent' && propData?.availabilityStatus === 'rented_out') {
              throw new Error('PROPERTY_RENTED_OUT');
          }
          
          // Create lead
          const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;
          const leadRef = db.collection('leads').doc(leadId);
          t.set(leadRef, {
              propertyId, propertyTitle, propertyLink,
              userId: uid, userName: userName || '', userEmail: userEmail || '', userPhone: userPhone || '',
              message: message || '', visitDate: visitDate || '', listingType: listingType || '',
              source: source || 'Platform',
              status: 'New',
              createdAt: new Date().toISOString(),
              timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Set lock
          t.set(lockRef, { propertyId, userId: uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
          
          // Update daily rate limit
          if (limitDoc.exists) {
              t.update(dailyLimitRef, { count: count + 1, lastRequestAt: admin.firestore.FieldValue.serverTimestamp() });
          } else {
              t.set(dailyLimitRef, { userId: uid, dateKey, count: 1, firstRequestAt: admin.firestore.FieldValue.serverTimestamp(), lastRequestAt: admin.firestore.FieldValue.serverTimestamp() });
          }
          
          // Increment property enquiryCount
          t.update(propertyRef, { enquiryCount: admin.firestore.FieldValue.increment(1) });
      });
      
      return res.status(200).json({ success: true, message: 'Enquiry submitted successfully' });

    } catch (error: any) {
        if (error.message === 'DAILY_LIMIT_REACHED') {
            return res.status(429).json({ error: "You have reached today's limit of 5 property enquiries. You can submit more enquiries after 12:00 AM." });
        }
        if (error.message === 'ALREADY_ENQUIRED') {
            return res.status(200).json({ success: true, message: 'Already enquired about this property.' }); 
        }
        if (error.message === 'PROPERTY_NOT_FOUND') {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (error.message === 'PROPERTY_RENTED_OUT') {
            return res.status(409).json({ error: 'This property has already been rented out. Please view similar available flats.' });
        }
        console.error("Enquiry API Error:", error);
        res.status(500).json({ error: "Unable to submit your enquiry. Check your connection and try again." });
    }
  });


  // Secure API endpoint for WhatsApp tracking
  app.post("/api/track-whatsapp", async (req, res) => {
    try {
      if (!getApps().length) return res.status(503).json({ error: "Backend not configured." });
      
      const appCheckToken = req.headers['x-firebase-appcheck'];
      if (!appCheckToken || typeof appCheckToken !== 'string') {
          return res.status(401).json({ error: 'Unauthorized: Missing App Check token' });
      }
      try {
          await admin.appCheck().verifyToken(appCheckToken);
      } catch (err) {
          return res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
      }

      let userId = 'anonymous';
      let userEmail = '';
      let userName = 'Anonymous Visitor';
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
              const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
              userId = decodedToken.uid;
              userEmail = decodedToken.email || '';
              userName = decodedToken.name || 'Visitor';
          } catch (e) {
              // ignore invalid token for whatsapp tracking as it's allowed for guests
          }
      }

      const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
      const limitResult = checkBurstLimits(clientIp, userId);
      if (limitResult.limited) {
          res.setHeader('Retry-After', '60');
          return res.status(429).json({ error: "Too many attempts." });
      }
      
      const { propertyId, userPhone } = req.body;
      if (!propertyId || typeof propertyId !== 'string' || propertyId.length > 100) return res.status(400).json({ error: 'Invalid property ID' });
      
      const db = admin.firestore();
      const propertyRef = db.collection('properties').doc(propertyId);
      const propDoc = await propertyRef.get();
      if (!propDoc.exists) {
          return res.status(404).json({ error: 'Property not found' });
      }
      const propData = propDoc.data() || {};
      
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;
      const leadRef = db.collection('leads').doc(leadId);
      await leadRef.set({
          propertyId, 
          propertyTitle: propData.title || 'Unknown Property', 
          propertyLink: `/property/${propertyId}`,
          userId, 
          userName, 
          userEmail, 
          userPhone: (userPhone || '').toString().substring(0, 20),
          source: 'WhatsApp',
          status: 'New',
          createdAt: new Date().toISOString(),
          timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      await propertyRef.update({ whatsappContacts: admin.firestore.FieldValue.increment(1) });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("WhatsApp Tracking Error:", error);
      res.status(500).json({ error: "Failed to track." });
    }
  });

  app.get("/api/enquiries/limit", async (req, res) => {
    try {
      if (!getApps().length) return res.json({ count: 0, limit: 5 });
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
      const dateParts = formatter.formatToParts(new Date());
      let y='', m='', d='';
      for (const p of dateParts) { if (p.type==='year') y=p.value; if(p.type==='month') m=p.value; if(p.type==='day') d=p.value; }
      const dateKey = `${y}-${m}-${d}`;
      
      const db = admin.firestore();
      const limitRefId = `${uid}_${dateKey}`;
      const doc = await db.collection('enquiryRateLimits').doc(limitRefId).get();
      const count = doc.exists ? (doc.data()?.count || 0) : 0;
      return res.json({ count, limit: 5 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get limit" });
    }
  });

  // Serve the uploads directory statically
  app.use("/uploads", express.static(uploadsDir));

  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
      });
    } else {
      // Serve static files in production
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      // SPA Fallback: Serve index.html for unknown routes
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  }

export default app;
