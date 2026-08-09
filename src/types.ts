export interface Property {
  id: string;
  propertyId?: string;
  title: string;
  description: string;
  price: number; // This is Monthly Rent
  location: string;
  society?: string;
  tower?: string;
  flatNumber?: string;
  unitNumber?: string;
  propertyType?: string;
  bhkType?: string;  // New field for precise BHK type classifier
  floor?: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
  googleMapsUrl?: string;
  amenities: string[];
  status: 'available' | 'rented';
  listingType?: 'rent' | 'buy' | string;
  contactPhone: string;
  userId?: string; // ID of the user who owns/created this property
  ownerName?: string;
  ownerContact?: string;
  tenantName?: string;
  tenantContact?: string;
  furnishingStatus?: 'Furnished' | 'Semi-Furnished' | 'Raw-Flat' | string;
  allowedTenants?: string[]; // we might keep this for backward compatibility
  views?: number;
  viewedBy?: string[];
  viewedByEmails?: string[];
  
  // New fields
  available_from?: string;
  tenant_preference?: string;
  maintenance_amount?: number;
  maintenance_type?: 'Included in Rent' | 'Extra / Separate' | 'extra' | 'Not Included' | string;
  isRegistered?: boolean;
  priceNegotiable?: boolean;
  superArea?: number;
  carpetArea?: number;
  facing?: string;
  constructionStatus?: string;
  constructionQuality?: string;
  locationAdvantage?: string;
  parking?: string;
  balcony?: number;

  // Metrics
  shares?: number;
  favorites?: number;
  whatsappContacts?: number;
  enquiryCount?: number;
  availabilityStatus?: 'available' | 'rented_out';
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  rentedOutAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLink: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  source: 'WhatsApp' | 'Platform' | string;
  status: 'New' | 'Contacted' | 'Follow Up' | 'Closed' | string;
  createdAt: string;
  message?: string;
  visitDate?: string;
  listingType?: string;
}

export interface Application {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  dateApplied: string;
  userId?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  requirements: string;
  budget: string;
  dateSubmitted: string;
  userId?: string;
  status?: 'pending' | 'confirmed' | 'rejected';
  location?: string;
  bhk?: string;
  tenantPreference?: string;
  furnishingStatus?: string;
  shiftingDate?: string;
  propertyId?: string;
}
