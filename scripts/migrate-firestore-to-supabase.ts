import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

type FirestoreRecord = { id: string; [key: string]: any };

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountValue && !serviceAccountPath) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH');
}
const serviceAccount = JSON.parse(
  serviceAccountValue || readFileSync(serviceAccountPath!, 'utf8'),
);
initializeApp({ credential: cert(serviceAccount) });
const firestore = getFirestore();
const supabase = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const readCollection = async (name: string): Promise<FirestoreRecord[]> => {
  const snapshot = await firestore.collection(name).get();
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
};

const iso = (value: any, fallback?: string): string | null => {
  if (!value) return fallback || null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
};

const chunks = <T>(rows: T[], size = 250): T[][] => {
  const result: T[][] = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
};

async function upsertRows(client: SupabaseClient, table: string, rows: any[], onConflict?: string) {
  for (const group of chunks(rows)) {
    if (!group.length) continue;
    const { error } = await client.from(table).upsert(group, onConflict ? { onConflict } : undefined);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table} verification: ${error.message}`);
  return count || 0;
}

async function main() {
  console.log('Reading all Firestore collections...');
  const [users, properties, applications, inquiries, leads, locks, limits] = await Promise.all([
    readCollection('users'),
    readCollection('properties'),
    readCollection('applications'),
    readCollection('inquiries'),
    readCollection('leads'),
    readCollection('enquiry_locks'),
    readCollection('enquiryRateLimits'),
  ]);

  const propertyIds = new Set(properties.map((row) => row.id));
  const referencedPropertyIds = new Set<string>();
  for (const row of [...applications, ...leads, ...locks]) if (row.propertyId) referencedPropertyIds.add(row.propertyId);
  for (const row of inquiries) if (row.propertyId) referencedPropertyIds.add(row.propertyId);
  for (const user of users) for (const propertyId of user.wishlist || []) referencedPropertyIds.add(propertyId);
  const missingProperties = [...referencedPropertyIds].filter((id) => !propertyIds.has(id));
  if (missingProperties.length) {
    throw new Error(`Migration stopped: ${missingProperties.length} referenced properties do not exist: ${missingProperties.join(', ')}`);
  }

  const userIds = new Set(users.map((row) => row.id));
  for (const row of [...properties, ...applications, ...inquiries, ...leads, ...locks, ...limits]) {
    for (const candidate of [row.userId, row.statusUpdatedBy]) {
      if (candidate && candidate !== 'anonymous') userIds.add(candidate);
    }
  }

  const usersById = new Map(users.map((row) => [row.id, row]));
  const profiles = [...userIds].map((firebaseUid) => {
    const row: FirestoreRecord | Partial<FirestoreRecord> = usersById.get(firebaseUid) || {};
    return {
      firebase_uid: firebaseUid,
      email: row.email || null,
      display_name: row.displayName || null,
      created_at: iso(row.createdAt, new Date().toISOString()),
      updated_at: new Date().toISOString(),
    };
  });
  await upsertRows(supabase, 'user_profiles', profiles, 'firebase_uid');

  const propertyRows = properties.map((row) => ({
    id: row.id,
    property_code: row.propertyId || null,
    created_by: row.userId || null,
    title: row.title,
    description: row.description || '',
    listing_type: row.listingType || 'rent',
    status: row.status || 'available',
    price: Number(row.price),
    location: row.location,
    society: row.society || null,
    tower: row.tower || null,
    flat_number: row.flatNumber || null,
    unit_number: row.unitNumber || null,
    property_type: row.propertyType || null,
    bhk_type: row.bhkType || null,
    floor: row.floor || null,
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    sqft: Number(row.sqft || 0),
    google_maps_url: row.googleMapsUrl || null,
    contact_phone: row.contactPhone || null,
    owner_name: row.ownerName || null,
    owner_contact: row.ownerContact || null,
    tenant_name: row.tenantName || null,
    tenant_contact: row.tenantContact || null,
    furnishing_status: row.furnishingStatus || null,
    available_from: row.available_from || null,
    tenant_preference: row.tenant_preference || null,
    maintenance_amount: Number(row.maintenance_amount || 0),
    maintenance_type: row.maintenance_type || null,
    is_registered: row.isRegistered ?? null,
    price_negotiable: row.priceNegotiable ?? null,
    super_area: row.superArea ?? null,
    carpet_area: row.carpetArea ?? null,
    facing: row.facing || null,
    construction_status: row.constructionStatus || null,
    construction_quality: row.constructionQuality || null,
    location_advantage: row.locationAdvantage || null,
    parking: row.parking || null,
    balcony: row.balcony ?? null,
    availability_status: row.availabilityStatus || 'available',
    status_updated_at: iso(row.statusUpdatedAt),
    status_updated_by: row.statusUpdatedBy || null,
    rented_out_at: iso(row.rentedOutAt),
    views: Number(row.views || 0),
    shares: Number(row.shares || 0),
    favorites: Number(row.favorites || 0),
    whatsapp_contacts: Number(row.whatsappContacts || 0),
    enquiry_count: Number(row.enquiryCount || 0),
    created_at: iso(row.createdAt, new Date().toISOString()),
    updated_at: iso(row.updatedAt, iso(row.createdAt, new Date().toISOString()) || undefined),
  }));
  await upsertRows(supabase, 'properties', propertyRows, 'id');

  const media: any[] = [];
  const amenities: any[] = [];
  const allowedTenants: any[] = [];
  for (const row of properties) {
    const images = [...new Set([row.imageUrl, ...(row.imageUrls || [])].filter(Boolean))];
    images.forEach((url, index) => media.push({ property_id: row.id, media_type: 'image', url, sort_order: index, is_primary: index === 0 }));
    if (row.videoUrl) media.push({ property_id: row.id, media_type: 'video', url: row.videoUrl, sort_order: images.length, is_primary: false });
    for (const amenity of new Set<string>(row.amenities || [])) amenities.push({ property_id: row.id, amenity });
    for (const tenantType of new Set<string>(row.allowedTenants || [])) allowedTenants.push({ property_id: row.id, tenant_type: tenantType });
  }
  await upsertRows(supabase, 'property_media', media, 'property_id,url_hash');
  await upsertRows(supabase, 'property_amenities', amenities, 'property_id,amenity');
  await upsertRows(supabase, 'property_allowed_tenants', allowedTenants, 'property_id,tenant_type');

  const wishlists = users.flatMap((row) => (row.wishlist || []).map((propertyId: string) => ({
    user_id: row.id,
    property_id: propertyId,
    created_at: iso(row.createdAt, new Date().toISOString()),
  })));
  await upsertRows(supabase, 'wishlists', wishlists, 'user_id,property_id');

  await upsertRows(supabase, 'applications', applications.map((row) => ({
    id: row.id,
    property_id: row.propertyId,
    user_id: row.userId,
    tenant_name: row.tenantName,
    tenant_phone: row.tenantPhone,
    status: row.status || 'pending',
    applied_at: iso(row.dateApplied, new Date().toISOString()),
  })), 'id');

  await upsertRows(supabase, 'inquiries', inquiries.map((row) => ({
    id: row.id,
    user_id: row.userId,
    property_id: row.propertyId || null,
    name: row.name,
    email: row.email,
    phone: row.phone,
    requirements: row.requirements || '',
    budget: row.budget || '',
    location: row.location || null,
    bhk: row.bhk || null,
    tenant_preference: row.tenantPreference || null,
    furnishing_status: row.furnishingStatus || null,
    shifting_date: row.shiftingDate || null,
    status: row.status || 'pending',
    submitted_at: iso(row.dateSubmitted, new Date().toISOString()),
  })), 'id');

  await upsertRows(supabase, 'leads', leads.map((row) => ({
    id: row.id,
    property_id: row.propertyId,
    user_id: row.userId && row.userId !== 'anonymous' ? row.userId : null,
    user_name: row.userName || null,
    user_email: row.userEmail || null,
    user_phone: row.userPhone || null,
    source: row.source || 'Platform',
    status: row.status || 'New',
    message: row.message || null,
    visit_date: row.visitDate || null,
    listing_type: row.listingType || null,
    created_at: iso(row.createdAt || row.timestamp, new Date().toISOString()),
  })), 'id');

  await upsertRows(supabase, 'property_enquiries', locks.map((row) => ({
    property_id: row.propertyId,
    user_id: row.userId,
    lead_id: null,
    created_at: iso(row.createdAt, new Date().toISOString()),
  })), 'property_id,user_id');

  await upsertRows(supabase, 'enquiry_daily_limits', limits.map((row) => ({
    user_id: row.userId,
    date_key: row.dateKey,
    enquiry_count: Number(row.count || 0),
    first_request_at: iso(row.firstRequestAt),
    last_request_at: iso(row.lastRequestAt),
  })), 'user_id,date_key');

  const checks: Array<[string, number]> = [
    ['properties', properties.length],
    ['applications', applications.length],
    ['inquiries', inquiries.length],
    ['leads', leads.length],
    ['property_enquiries', locks.length],
    ['enquiry_daily_limits', limits.length],
  ];
  console.log('\nVerification:');
  let failed = false;
  for (const [table, expected] of checks) {
    const actual = await countRows(table);
    const ok = actual >= expected;
    failed ||= !ok;
    console.log(`${ok ? 'OK' : 'FAIL'} ${table}: Firestore ${expected}, Supabase ${actual}`);
  }
  if (failed) throw new Error('Verification failed. Firestore was not modified; inspect the counts above.');
  console.log('\nMigration completed successfully. Firestore source data was not changed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
