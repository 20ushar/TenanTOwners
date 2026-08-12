import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { createWhatsAppWebhookRouter } from "./src/server/whatsapp/webhook";

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
    ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
    : process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    || (process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
      : undefined);
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account.');
    }
  } else {
    console.warn('Firebase service account is not set. Admin features like backend enquiries will fail.');
  }
} catch (e) {
  const message = e instanceof Error ? e.message : 'Unknown initialization error';
  console.error('Failed to initialize Firebase Admin:', message);
}

const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

if (!supabaseAdmin) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Database-backed API routes will fail.');
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
const PORT = Number(process.env.PORT) || 3000;

// Meta signs the exact request bytes. Mount this raw parser before the general
// JSON parser so the webhook can authenticate bytes before parsing JSON.
app.use(
  "/api/whatsapp/webhook",
  express.raw({ type: "application/json", limit: "256kb" }),
  createWhatsAppWebhookRouter({
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
    recordMessage: async (message) => {
      if (!supabaseAdmin) {
        throw new Error("Webhook deduplication storage is not configured");
      }

      const { error } = await supabaseAdmin
        .from("whatsapp_webhook_messages")
        .insert({
          provider_message_id: message.messageId,
          sender_id: message.senderId,
          provider_timestamp: message.timestamp,
          message_type: message.messageType,
          has_text: message.text !== null,
        });

      if (error?.code === "23505") return false;
      if (error) throw error;
      return true;
    },
  }),
);

app.use(express.json({ limit: "256kb" }));

// Use the operating system's writable temporary directory. Serverless platforms
// such as Vercel expose a read-only application directory but provide a writable
// temp directory for files that are immediately forwarded to Cloudinary.
const uploadsDir = path.join(os.tmpdir(), "tenantowners-uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
        decodedToken = await getAuth().verifyIdToken(token);
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
        decodedToken = await getAuth().verifyIdToken(token);
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
          await getAppCheck().verifyToken(appCheckToken);
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
          decodedToken = await getAuth().verifyIdToken(token);
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
      
      // 5. Supabase transaction via a restricted Postgres function.
      if (!supabaseAdmin) {
        return res.status(503).json({ error: 'Database is not configured.' });
      }
      const { data: enquiryResult, error: enquiryError } = await supabaseAdmin.rpc('submit_property_enquiry', {
        p_user_id: uid,
        p_property_id: propertyId,
        p_user_name: userName || '',
        p_user_email: userEmail || '',
        p_user_phone: userPhone || '',
        p_message: message || '',
        p_visit_date: visitDate || '',
        p_listing_type: listingType || '',
      });
      if (enquiryError) throw enquiryError;
      const resultStatus = enquiryResult?.status;
      if (resultStatus && resultStatus !== 'OK') throw new Error(resultStatus);
      
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
          await getAppCheck().verifyToken(appCheckToken);
      } catch (err) {
          return res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
      }

      let userId = 'anonymous';
      let userEmail = '';
      let userName = 'Anonymous Visitor';
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
              const decodedToken = await getAuth().verifyIdToken(authHeader.split('Bearer ')[1]);
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
      
      if (!supabaseAdmin) return res.status(503).json({ error: 'Database is not configured.' });
      const { data: trackingResult, error: trackingError } = await supabaseAdmin.rpc('record_whatsapp_lead', {
        p_property_id: propertyId,
        p_user_id: userId,
        p_user_name: userName,
        p_user_email: userEmail,
        p_user_phone: (userPhone || '').toString().substring(0, 20),
      });
      if (trackingError) throw trackingError;
      if (trackingResult?.status === 'PROPERTY_NOT_FOUND') {
        return res.status(404).json({ error: 'Property not found' });
      }
      
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
      const decodedToken = await getAuth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
      const dateParts = formatter.formatToParts(new Date());
      let y='', m='', d='';
      for (const p of dateParts) { if (p.type==='year') y=p.value; if(p.type==='month') m=p.value; if(p.type==='day') d=p.value; }
      const dateKey = `${y}-${m}-${d}`;
      
      if (!supabaseAdmin) return res.status(503).json({ error: 'Database is not configured.' });
      const { data, error } = await supabaseAdmin
        .from('enquiry_daily_limits')
        .select('enquiry_count')
        .eq('user_id', uid)
        .eq('date_key', dateKey)
        .maybeSingle();
      if (error) throw error;
      const count = data?.enquiry_count || 0;
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
