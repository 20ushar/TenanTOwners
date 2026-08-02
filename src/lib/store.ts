import { validateProperty, validateApplication, validateInquiry, validateLead } from "./validation";
import { db, auth } from './firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { Property, Application, Inquiry, Lead } from '../types';

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Modern Apartment in Supertech',
    description: 'Beautiful 2-bedroom apartment with city views, updated kitchen, and in-unit laundry.',
    price: 25000,
    location: 'Noida Extension',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gym', 'Pool', 'Security', 'Parking', 'Power Backup'],
    status: 'available',
    listingType: 'rent',
    contactPhone: '9711479170',
    furnishingStatus: 'Semi-Furnished',
    allowedTenants: ['Family', 'Male Bachelor'],
    views: 0,
    shares: 0,
    favorites: 0,
    whatsappContacts: 0
  },
  {
    id: 'p2',
    title: 'Cozy House in Sector 50',
    description: 'Spacious 3-bedroom family home with a large balcony and garage.',
    price: 32000,
    location: 'Central Noida',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: ['Balcony', 'Parking', 'Security', 'Power Backup'],
    status: 'available',
    listingType: 'rent',
    contactPhone: '9711479170',
    furnishingStatus: 'Raw-Flat',
    allowedTenants: ['Family'],
    views: 0,
    shares: 0,
    favorites: 0,
    whatsappContacts: 0
  },
  {
    id: 'p3',
    title: 'Luxury Studio Apartment',
    description: 'High-end loft with floor-to-ceiling windows, smart home features.',
    price: 18000,
    location: 'Central Noida',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gym', 'Pool', 'Security', 'Elevator'],
    status: 'available',
    listingType: 'rent',
    contactPhone: '9711479170',
    furnishingStatus: 'Furnished',
    allowedTenants: ['Male Bachelor', 'Female Bachelor'],
    views: 0,
    shares: 0,
    favorites: 0,
    whatsappContacts: 0
  }
];

export const generateSocietyCode = (societyName?: string): string => {
  if (!societyName) return 'PRP';
  const words = societyName.trim().split(' ').filter(w => w.length > 0);
  let code = '';
  words.forEach(w => {
    const isNum = !isNaN(Number(w));
    if (isNum) {
      code += w;
    } else {
      code += w[0].toUpperCase();
    }
  });
  return code.slice(0, 5) || 'PRP';
};

export const generatePropertyId = async (societyName?: string): Promise<string> => {
  const code = generateSocietyCode(societyName);
  const propertiesRef = collection(db, 'properties');
  const q = query(propertiesRef, where('propertyId', '>=', code + '-'), where('propertyId', '<=', code + '-\uf8ff'));
  const qSnap = await getDocs(q);
  let max = 0;
  qSnap.docs.forEach(d => {
    const pId = d.data()?.propertyId || '';
    if (pId.startsWith(code + '-')) {
      const numPart = pId.split('-')[1];
      if (numPart) {
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > max) max = num;
      }
    }
  });
  const nextNum = max + 1;
  return `${code}-${nextNum.toString().padStart(4, '0')}`;
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const docRef = doc(db, 'properties', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Property;
    }
    return null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
};

export const getProperties = async (filters?: { listingType?: string, status?: string }): Promise<Property[]> => {
  try {
    let q = query(collection(db, 'properties'));
    if (filters?.listingType) {
      q = query(q, where('listingType', '==', filters.listingType));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        listingType: data.listingType || 'rent',
      } as Property;
    });
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching properties:', error);
    }
    return [];
  }
};

const cleanUndefined = (obj: any): any => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      if (Array.isArray(newObj[key])) {
        // We aren't doing deep clean of arrays to avoid complexity, usually basic props
      } else {
        newObj[key] = cleanUndefined(newObj[key]);
      }
    }
  });
  return newObj;
};

export const addProperty = async (property: Property) => {
  try {
    property = validateProperty(property);
    if (!property.userId && auth.currentUser) {
       property.userId = auth.currentUser.uid;
    }
    if (!property.propertyId) {
       property.propertyId = await generatePropertyId(property.society || property.location);
    }
    if (!property.createdAt) {
       property.createdAt = new Date().toISOString();
       property.updatedAt = property.createdAt;
    }
    await setDoc(doc(db, 'properties', property.id), cleanUndefined(property));
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

export const updateProperty = async (property: Property) => {
  try {
    property = validateProperty(property);
    if (!property.updatedAt) {
      property.updatedAt = new Date().toISOString();
    }
    const propertyRef = doc(db, 'properties', property.id);
    await updateDoc(propertyRef, cleanUndefined({ ...property }));
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId: string) => {
  try {
    await deleteDoc(doc(db, 'properties', propertyId));
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

export const getApplications = async (): Promise<Application[]> => {
  if (!auth.currentUser) return [];
  try {
    const q = query(collection(db, 'applications'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Application);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

export const getAllApplicationsAdmin = async (): Promise<Application[]> => {
  try {
    const q = query(collection(db, 'applications'), orderBy('dateApplied', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Application);
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching admin applications:', error);
    }
    return [];
  }
};

export const addApplication = async (application: Application) => {
  if (!auth.currentUser) return;
  try {
    application = validateApplication(application);
    const newApp = { ...application, userId: auth.currentUser.uid };
    await setDoc(doc(db, 'applications', newApp.id), cleanUndefined(newApp));
  } catch (error) {
    console.error('Error adding application:', error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected' | 'reviewing') => {
  try {
    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, { status });
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

export const deleteApplication = async (applicationId: string) => {
  try {
    await deleteDoc(doc(db, 'applications', applicationId));
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  try {
    const q = query(collection(db, 'inquiries'), orderBy('dateSubmitted', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Inquiry);
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching inquiries:', error);
    }
    return [];
  }
};

export const getMyInquiries = async (): Promise<Inquiry[]> => {
  if (!auth.currentUser) return [];
  try {
    const q = query(collection(db, 'inquiries'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Inquiry);
  } catch (error) {
    console.error('Error fetching my inquiries:', error);
    return [];
  }
};

export const addInquiry = async (inquiry: Inquiry) => {
  if (!auth.currentUser) return;
  try {
    inquiry = validateInquiry(inquiry);
    const newInq = { ...inquiry, userId: auth.currentUser.uid };
    await setDoc(doc(db, 'inquiries', newInq.id), cleanUndefined(newInq));
  } catch (error) {
    console.error('Error adding inquiry:', error);
    throw error;
  }
};

export const updateInquiryStatus = async (inquiryId: string, status: 'confirmed' | 'rejected') => {
  try {
    const inqRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inqRef, { status });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};

export const deleteInquiry = async (inquiryId: string) => {
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
};

export const getWishlist = async (): Promise<string[]> => {
  if (!auth.currentUser) return [];
  try {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data()?.wishlist || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

export const toggleWishlist = async (propertyId: string) => {
  if (!auth.currentUser) return;
  try {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, { wishlist: [propertyId] });
      return;
    }
    
    const currentWishlist = userDoc.data()?.wishlist || [];
    if (currentWishlist.includes(propertyId)) {
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(propertyId)
      });
    } else {
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(propertyId)
      });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

export const isInWishlist = async (propertyId: string): Promise<boolean> => {
  try {
    const wishlist = await getWishlist();
    return wishlist.includes(propertyId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

export const recordPropertyView = async (propertyId: string, userId: string, userEmail?: string | null) => {
  // Views are no longer tracked via client-side direct writes to protect property documents.
  // Requires a secure backend implementation to prevent abuse and adhere to new Firestore rules.
};

export const incrementPropertyMetric = async (propertyId: string, metric: 'shares' | 'favorites' | 'whatsappContacts' | 'enquiryCount') => {
  // Direct client metric increments are disabled to protect property documents.
  // Use secure backend endpoints (e.g., /api/enquiries, /api/track-whatsapp).
};

export const recordUniqueEnquiry = async (propertyId: string, userId: string | null | undefined, phone: string, email: string) => {
  // Unique enquiry checking is now handled securely on the backend (e.g., via /api/enquiries).
  return true;
};

export const addLead = async (lead: Lead) => {
  try {
    lead = validateLead(lead);
    const data = cleanUndefined({ ...lead });
    await setDoc(doc(db, 'leads', lead.id), data);
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Lead);
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching leads:', error);
    }
    return [];
  }
};

export const updateLeadStatus = async (leadId: string, status: string) => {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, { status });
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

export const deleteLead = async (leadId: string) => {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await deleteDoc(leadRef);
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};


export const updateRentPropertyAvailability = async (propertyId: string, availabilityStatus: 'available' | 'rented_out', adminId: string) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const updateData: any = {
      availabilityStatus,
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId,
    };
    if (availabilityStatus === 'rented_out') {
      updateData.rentedOutAt = serverTimestamp();
    } else {
      updateData.rentedOutAt = null;
    }
    await updateDoc(propertyRef, updateData);
  } catch (error) {
    console.error('Error updating availability status:', error);
    throw error;
  }
};
