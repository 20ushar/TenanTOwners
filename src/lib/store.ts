import { validateProperty, validateApplication, validateInquiry, validateLead } from './validation';
import { auth } from './firebase';
import { supabase } from './supabase';
import { Property, Application, Inquiry, Lead, PropertyEnquiry } from '../types';

const PROPERTY_SELECT = `
  *,
  property_media(id, media_type, url, sort_order, is_primary),
  property_amenities(amenity),
  property_allowed_tenants(tenant_type)
`;

const propertyListCache = new Map<string, { expiresAt: number; promise: Promise<Property[]> }>();
const PROPERTY_CACHE_MS = 30_000;

const clearPropertyCache = () => propertyListCache.clear();

const compact = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;

const toIso = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof (value as any).toDate === 'function') return (value as any).toDate().toISOString();
  return new Date(value as any).toISOString();
};

const propertyFromRow = (row: any): Property => {
  const media = [...(row.property_media || [])].sort((a, b) => a.sort_order - b.sort_order);
  const images = media.filter((item) => item.media_type === 'image');
  const primary = images.find((item) => item.is_primary) || images[0];
  const video = media.find((item) => item.media_type === 'video');

  return {
    id: row.id,
    propertyId: row.property_code || undefined,
    title: row.title,
    description: row.description || '',
    price: Number(row.price),
    location: row.location,
    society: row.society || undefined,
    tower: row.tower || undefined,
    flatNumber: row.flat_number || undefined,
    unitNumber: row.unit_number || undefined,
    propertyType: row.property_type || undefined,
    bhkType: row.bhk_type || undefined,
    floor: row.floor || undefined,
    bedrooms: row.bedrooms,
    bathrooms: Number(row.bathrooms),
    sqft: row.sqft,
    imageUrl: primary?.url || '',
    imageUrls: images.map((item) => item.url),
    videoUrl: video?.url,
    googleMapsUrl: row.google_maps_url || undefined,
    amenities: (row.property_amenities || []).map((item: any) => item.amenity),
    status: row.status,
    listingType: row.listing_type,
    contactPhone: row.contact_phone || '',
    userId: row.created_by || undefined,
    ownerName: row.owner_name || undefined,
    ownerContact: row.owner_contact || undefined,
    tenantName: row.tenant_name || undefined,
    tenantContact: row.tenant_contact || undefined,
    furnishingStatus: row.furnishing_status || undefined,
    allowedTenants: (row.property_allowed_tenants || []).map((item: any) => item.tenant_type),
    available_from: row.available_from || undefined,
    tenant_preference: row.tenant_preference || undefined,
    maintenance_amount: Number(row.maintenance_amount || 0),
    maintenance_type: row.maintenance_type || undefined,
    isRegistered: row.is_registered ?? undefined,
    priceNegotiable: row.price_negotiable ?? undefined,
    superArea: row.super_area ?? undefined,
    carpetArea: row.carpet_area ?? undefined,
    facing: row.facing || undefined,
    constructionStatus: row.construction_status || undefined,
    constructionQuality: row.construction_quality || undefined,
    locationAdvantage: row.location_advantage || undefined,
    parking: row.parking || undefined,
    balcony: row.balcony ?? undefined,
    views: row.views,
    shares: row.shares,
    favorites: row.favorites,
    whatsappContacts: row.whatsapp_contacts,
    enquiryCount: row.enquiry_count,
    availabilityStatus: row.availability_status,
    statusUpdatedAt: toIso(row.status_updated_at),
    statusUpdatedBy: row.status_updated_by || undefined,
    rentedOutAt: toIso(row.rented_out_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
};

const propertyToRow = (property: Property) => compact({
  id: property.id,
  property_code: property.propertyId,
  created_by: property.userId,
  title: property.title,
  description: property.description,
  listing_type: property.listingType || 'rent',
  status: property.status,
  price: property.price,
  location: property.location,
  society: property.society,
  tower: property.tower,
  flat_number: property.flatNumber,
  unit_number: property.unitNumber,
  property_type: property.propertyType,
  bhk_type: property.bhkType,
  floor: property.floor,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  sqft: property.sqft,
  google_maps_url: property.googleMapsUrl,
  contact_phone: property.contactPhone,
  owner_name: property.ownerName,
  owner_contact: property.ownerContact,
  tenant_name: property.tenantName,
  tenant_contact: property.tenantContact,
  furnishing_status: property.furnishingStatus,
  available_from: property.available_from,
  tenant_preference: property.tenant_preference,
  maintenance_amount: property.maintenance_amount || 0,
  maintenance_type: property.maintenance_type,
  is_registered: property.isRegistered,
  price_negotiable: property.priceNegotiable,
  super_area: property.superArea,
  carpet_area: property.carpetArea,
  facing: property.facing,
  construction_status: property.constructionStatus,
  construction_quality: property.constructionQuality,
  location_advantage: property.locationAdvantage,
  parking: property.parking,
  balcony: property.balcony,
  views: property.views || 0,
  shares: property.shares || 0,
  favorites: property.favorites || 0,
  whatsapp_contacts: property.whatsappContacts || 0,
  enquiry_count: property.enquiryCount || 0,
  availability_status: property.availabilityStatus || 'available',
  status_updated_at: property.statusUpdatedAt,
  status_updated_by: property.statusUpdatedBy,
  rented_out_at: property.rentedOutAt,
  created_at: property.createdAt,
  updated_at: property.updatedAt || new Date().toISOString(),
});

async function replacePropertyRelations(property: Property) {
  const tables = ['property_media', 'property_amenities', 'property_allowed_tenants'] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('property_id', property.id);
    if (error) throw error;
  }

  const uniqueImages = [...new Set([property.imageUrl, ...(property.imageUrls || [])].filter(Boolean))];
  const media = uniqueImages.map((url, index) => ({
    property_id: property.id,
    media_type: 'image',
    url,
    sort_order: index,
    is_primary: index === 0,
  }));
  if (property.videoUrl) {
    media.push({ property_id: property.id, media_type: 'video', url: property.videoUrl, sort_order: media.length, is_primary: false });
  }
  if (media.length) {
    const { error } = await supabase.from('property_media').insert(media);
    if (error) throw error;
  }

  const amenities = [...new Set(property.amenities || [])].map((amenity) => ({ property_id: property.id, amenity }));
  if (amenities.length) {
    const { error } = await supabase.from('property_amenities').insert(amenities);
    if (error) throw error;
  }

  const tenants = [...new Set(property.allowedTenants || [])].map((tenant_type) => ({ property_id: property.id, tenant_type }));
  if (tenants.length) {
    const { error } = await supabase.from('property_allowed_tenants').insert(tenants);
    if (error) throw error;
  }
}

export const generateSocietyCode = (societyName?: string): string => {
  if (!societyName) return 'PRP';
  const code = societyName.trim().split(' ').filter(Boolean).map((word) =>
    Number.isNaN(Number(word)) ? word[0].toUpperCase() : word,
  ).join('');
  return code.slice(0, 5) || 'PRP';
};

export const generatePropertyId = async (societyName?: string): Promise<string> => {
  const code = generateSocietyCode(societyName);
  const { data, error } = await supabase.from('properties').select('property_code').ilike('property_code', `${code}-%`);
  if (error) throw error;
  const max = (data || []).reduce((value, row) => {
    const number = Number.parseInt((row.property_code || '').split('-')[1], 10);
    return Number.isNaN(number) ? value : Math.max(value, number);
  }, 0);
  return `${code}-${String(max + 1).padStart(4, '0')}`;
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  const { data, error } = await supabase.from('properties').select(PROPERTY_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? propertyFromRow(data) : null;
};

export const getProperties = async (filters?: { listingType?: string; status?: string }): Promise<Property[]> => {
  const cacheKey = JSON.stringify(filters || {});
  const cached = propertyListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = (async () => {
    let request = supabase.from('properties').select(PROPERTY_SELECT);
    if (filters?.listingType) {
      request = request
        .eq('listing_type', filters.listingType)
        .eq('property_media.is_primary', true);
    }
    if (filters?.status) request = request.eq('status', filters.status);
    const { data, error } = await request.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(propertyFromRow);
  })();

  propertyListCache.set(cacheKey, { expiresAt: Date.now() + PROPERTY_CACHE_MS, promise });
  promise.catch(() => propertyListCache.delete(cacheKey));
  return promise;
};

export const addProperty = async (input: Property) => {
  const property = validateProperty({ ...input }) as Property;
  property.userId ||= auth.currentUser?.uid;
  property.propertyId ||= await generatePropertyId(property.society || property.location);
  property.createdAt ||= new Date().toISOString();
  property.updatedAt = property.createdAt;
  const { error } = await supabase.from('properties').insert(propertyToRow(property));
  if (error) throw error;
  await replacePropertyRelations(property);
  clearPropertyCache();
};

export const updateProperty = async (input: Property) => {
  const property = validateProperty({ ...input }) as Property;
  property.updatedAt = new Date().toISOString();
  const { error } = await supabase.from('properties').update(propertyToRow(property)).eq('id', property.id);
  if (error) throw error;
  await replacePropertyRelations(property);
  clearPropertyCache();
};

export const deleteProperty = async (propertyId: string) => {
  const { error } = await supabase.from('properties').delete().eq('id', propertyId);
  if (error) throw error;
  clearPropertyCache();
};

const applicationFromRow = (row: any): Application => ({
  id: row.id,
  propertyId: row.property_id,
  tenantName: row.tenant_name,
  tenantPhone: row.tenant_phone,
  status: row.status,
  dateApplied: row.applied_at,
  userId: row.user_id,
} as Application);

export const getApplications = async (): Promise<Application[]> => {
  if (!auth.currentUser) return [];
  const { data, error } = await supabase.from('applications').select('*').eq('user_id', auth.currentUser.uid).order('applied_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(applicationFromRow);
};

export const getAllApplicationsAdmin = async (): Promise<Application[]> => {
  const { data, error } = await supabase.from('applications').select('*').order('applied_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(applicationFromRow);
};

export const addApplication = async (input: Application) => {
  if (!auth.currentUser) throw new Error('Please sign in to apply.');
  const application = validateApplication({ ...input }) as Application;
  const { error } = await supabase.from('applications').insert({
    id: application.id,
    property_id: application.propertyId,
    user_id: auth.currentUser.uid,
    tenant_name: application.tenantName,
    tenant_phone: application.tenantPhone,
    status: application.status,
    applied_at: application.dateApplied,
  });
  if (error) throw error;
};

export const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected' | 'reviewing') => {
  const { error } = await supabase.from('applications').update({ status }).eq('id', id);
  if (error) throw error;
};

export const deleteApplication = async (id: string) => {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
};

const inquiryFromRow = (row: any): Inquiry => ({
  id: row.id,
  userId: row.user_id,
  propertyId: row.property_id || undefined,
  name: row.name,
  email: row.email,
  phone: row.phone,
  requirements: row.requirements,
  budget: row.budget,
  location: row.location || undefined,
  bhk: row.bhk || undefined,
  tenantPreference: row.tenant_preference || undefined,
  furnishingStatus: row.furnishing_status || undefined,
  shiftingDate: row.shifting_date || undefined,
  status: row.status,
  dateSubmitted: row.submitted_at,
});

export const getInquiries = async (): Promise<Inquiry[]> => {
  const { data, error } = await supabase.from('inquiries').select('*').order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(inquiryFromRow);
};

export const getMyInquiries = async (): Promise<Inquiry[]> => {
  if (!auth.currentUser) return [];
  const { data, error } = await supabase.from('inquiries').select('*').eq('user_id', auth.currentUser.uid).order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(inquiryFromRow);
};

export const addInquiry = async (input: Inquiry) => {
  if (!auth.currentUser) throw new Error('Please sign in to submit a request.');
  const inquiry = validateInquiry({ ...input }) as Inquiry;
  const { error } = await supabase.from('inquiries').insert({
    id: inquiry.id,
    user_id: auth.currentUser.uid,
    property_id: inquiry.propertyId || null,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    requirements: inquiry.requirements,
    budget: inquiry.budget,
    location: inquiry.location || null,
    bhk: inquiry.bhk || null,
    tenant_preference: inquiry.tenantPreference || null,
    furnishing_status: inquiry.furnishingStatus || null,
    shifting_date: inquiry.shiftingDate || null,
    status: inquiry.status || 'pending',
    submitted_at: inquiry.dateSubmitted,
  });
  if (error) throw error;
};

export const updateInquiryStatus = async (id: string, status: 'confirmed' | 'rejected') => {
  const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
  if (error) throw error;
};

export const deleteInquiry = async (id: string) => {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
};

export const getMyPropertyEnquiries = async (): Promise<PropertyEnquiry[]> => {
  if (!auth.currentUser) return [];
  const { data, error } = await supabase
    .from('property_enquiries')
    .select('property_id, created_at, properties(id, property_code, title, location, listing_type)')
    .eq('user_id', auth.currentUser.uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => {
    const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    return {
      propertyId: row.property_id,
      createdAt: row.created_at,
      property: property ? {
        id: property.id,
        propertyId: property.property_code || undefined,
        title: property.title,
        location: property.location,
        listingType: property.listing_type || undefined,
      } : undefined,
    };
  });
};

export const getWishlist = async (): Promise<string[]> => {
  if (!auth.currentUser) return [];
  const { data, error } = await supabase.from('wishlists').select('property_id').eq('user_id', auth.currentUser.uid);
  if (error) throw error;
  return (data || []).map((row) => row.property_id);
};

export const toggleWishlist = async (propertyId: string) => {
  if (!auth.currentUser) throw new Error('Please sign in to use your wishlist.');
  const userId = auth.currentUser.uid;
  const { data, error } = await supabase.from('wishlists').select('property_id').eq('user_id', userId).eq('property_id', propertyId).maybeSingle();
  if (error) throw error;
  const result = data
    ? await supabase.from('wishlists').delete().eq('user_id', userId).eq('property_id', propertyId)
    : await supabase.from('wishlists').insert({ user_id: userId, property_id: propertyId });
  if (result.error) throw result.error;
};

export const isInWishlist = async (propertyId: string) => (await getWishlist()).includes(propertyId);

export const recordPropertyView = async (_propertyId: string, _userId: string, _userEmail?: string | null) => {};
export const incrementPropertyMetric = async (
  _propertyId: string,
  _metric: 'shares' | 'favorites' | 'whatsappContacts' | 'enquiryCount',
) => {};
export const recordUniqueEnquiry = async (
  _propertyId: string,
  _userId: string | null | undefined,
  _phone: string,
  _email: string,
) => true;

const leadFromRow = (row: any): Lead => ({
  id: row.id,
  propertyId: row.property_id,
  propertyTitle: row.properties?.title || 'Unknown Property',
  propertyLink: `/property/${row.property_id}`,
  userId: row.user_id || undefined,
  userName: row.user_name || undefined,
  userEmail: row.user_email || undefined,
  userPhone: row.user_phone || undefined,
  source: row.source,
  status: row.status,
  createdAt: row.created_at,
  message: row.message || undefined,
  visitDate: row.visit_date || undefined,
  listingType: row.listing_type || undefined,
} as Lead);

export const addLead = async (input: Lead) => {
  const lead = validateLead({ ...input }) as Lead;
  const { error } = await supabase.from('leads').insert({
    id: lead.id,
    property_id: lead.propertyId,
    user_id: lead.userId || null,
    user_name: lead.userName || null,
    user_email: lead.userEmail || null,
    user_phone: lead.userPhone || null,
    source: lead.source,
    status: lead.status,
    created_at: lead.createdAt,
  });
  if (error) throw error;
};

export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase.from('leads').select('*, properties(title)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(leadFromRow);
};

export const updateLeadStatus = async (id: string, status: string) => {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) throw error;
};

export const deleteLead = async (id: string) => {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
};

export const updateRentPropertyAvailability = async (id: string, availabilityStatus: 'available' | 'rented_out', adminId: string) => {
  const now = new Date().toISOString();
  const { error } = await supabase.from('properties').update({
    availability_status: availabilityStatus,
    status_updated_at: now,
    status_updated_by: adminId,
    rented_out_at: availabilityStatus === 'rented_out' ? now : null,
    updated_at: now,
  }).eq('id', id);
  if (error) throw error;
};
