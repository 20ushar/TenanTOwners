import { WHATSAPP_NUMBER } from '../lib/constants';
import React, { useState, useEffect, useMemo } from 'react';
import { getAllApplicationsAdmin, getProperties, getInquiries, addProperty, deleteProperty, updateProperty, deleteInquiry, updateInquiryStatus, updateApplicationStatus, deleteApplication, getLeads, updateLeadStatus, deleteLead, updateRentPropertyAvailability } from '../lib/store';
import { Application, Property, Inquiry, Lead } from '../types';
import { Users, FileText, Home, Plus, Trash2, Eye, Edit2, CheckCircle2, XCircle, X, MessageCircle, Search, Filter, Copy, Link as LinkIcon, BarChart2, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { isAdminEmail } from '../lib/admin';
import { Link, Navigate } from 'react-router-dom';
import { formatPrice } from '../lib/utils';

export function AdminDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & { property: Property | undefined })[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Enquiry Modal state
  const [showEnquiriesModal, setShowEnquiriesModal] = useState(false);
  
  // Availability Modal state
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityTarget, setAvailabilityTarget] = useState<{ property: any, newStatus: 'available' | 'rented_out' } | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const [selectedPropertyForEnquiries, setSelectedPropertyForEnquiries] = useState<Property | null>(null);

  // Add Inventory State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
     title: '', description: '', price: 0, location: '', bedrooms: 1, bathrooms: 1, sqft: 0, imageUrl: '', googleMapsUrl: '', status: 'available', listingType: 'rent', contactPhone: '', amenities: ['Gym', 'Club House', 'Swimming Pool', 'Indoor Games', 'Park'], available_from: 'Immediate', tenant_preference: 'All', maintenance_amount: 0, maintenance_type: 'Included in Rent'
  });
  const [amenitiesInput, setAmenitiesInput] = useState('Gym, Club House, Swimming Pool, Indoor Games, Park');
  const [buyPriceAmount, setBuyPriceAmount] = useState<number | ''>('');
  const [buyPriceUnit, setBuyPriceUnit] = useState<'Lakh' | 'Crore'>('Lakh');
  const [isUploading, setIsUploading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSociety, setFilterSociety] = useState('');
  const [filterTower, setFilterTower] = useState('');
  const [filterBHK, setFilterBHK] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterPropType, setFilterPropType] = useState('');
  const [filterRentMin, setFilterRentMin] = useState('');
  const [filterRentMax, setFilterRentMax] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [filterFloorRange, setFilterFloorRange] = useState('');
  // For Leads/Inquiries property ID search
  const [leadPropertyFilter, setLeadPropertyFilter] = useState('');
  const [inquiryPropertyFilter, setInquiryPropertyFilter] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  // Analytics
  const topViewed = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const topInquired = [...properties].sort((a, b) => (b.whatsappContacts || 0) - (a.whatsappContacts || 0)).slice(0, 3);
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const rentedProperties = properties.filter(p => p.status === 'rented').length;

  const filteredProperties = useMemo(() => properties.filter(p => {
    let matchSearch = true;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      matchSearch = (
        (p.propertyId && p.propertyId.toLowerCase().includes(sq)) ||
        (p.society && p.society.toLowerCase().includes(sq)) ||
        (p.title && p.title.toLowerCase().includes(sq)) ||
        (p.location && p.location.toLowerCase().includes(sq)) ||
        (p.status && p.status.toLowerCase().includes(sq)) ||
        (p.bedrooms && p.bedrooms.toString().toLowerCase().includes(sq)) ||
        (p.price && p.price.toString().toLowerCase().includes(sq))
      );
    }
    const matchSociety = filterSociety ? (p.society || p.location) === filterSociety : true;
    const matchTower = filterTower ? p.tower === filterTower : true;
    const matchBeds = filterBHK 
      ? (p.bhkType ? p.bhkType.includes(filterBHK) : p.bedrooms.toString() === filterBHK)
      : true;
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    const matchAvailability = filterAvailability !== 'All' ? (p.listingType === 'rent' ? (filterAvailability === 'Available' ? (p.availabilityStatus !== 'rented_out') : (p.availabilityStatus === 'rented_out')) : true) : true;
    const matchFurnish = filterFurnishing ? p.furnishingStatus === filterFurnishing : true;
    const matchPropType = filterPropType ? p.propertyType === filterPropType : true;
    
    let matchRent = true;
    if (filterRentMin) matchRent = matchRent && p.price >= Number(filterRentMin);
    if (filterRentMax) matchRent = matchRent && p.price <= Number(filterRentMax);
    
    let matchFloor = true;
    if (filterFloorRange && p.floor) {
      const floorNum = parseInt(p.floor);
      if (!isNaN(floorNum)) {
        if (filterFloorRange === '0-5') matchFloor = floorNum >= 0 && floorNum <= 5;
        else if (filterFloorRange === '6-10') matchFloor = floorNum >= 6 && floorNum <= 10;
        else if (filterFloorRange === '11-15') matchFloor = floorNum >= 11 && floorNum <= 15;
        else if (filterFloorRange === '16+') matchFloor = floorNum >= 16;
      }
    }
    
    return matchSearch && matchSociety && matchTower && matchBeds && matchStatus && matchFurnish && matchPropType && matchRent && matchFloor && matchAvailability;
  }), [properties, searchQuery, filterSociety, filterTower, filterBHK, filterStatus, filterFurnishing, filterPropType, filterRentMin, filterRentMax, filterFloorRange, filterAvailability]);

  const uniqueSocieties = Array.from(new Set(properties.map(p => p.society || p.location).filter(Boolean)));
  const uniqueTowers = Array.from(new Set(properties.map(p => p.tower).filter(Boolean)));
  const uniquePropTypes = Array.from(new Set(properties.map(p => p.propertyType).filter(Boolean)));

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, props, inqs, fetchedLeads] = await Promise.all([
        getAllApplicationsAdmin(),
        getProperties(),
        getInquiries(),
        getLeads()
      ]);
      
      setProperties(props);
      setApplications(apps.map(app => ({
        ...app,
        property: props.find(p => p.id === app.propertyId)
      })));
      setInquiries(inqs);
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAutoClassify = async () => {
    if (!newProperty.description) {
      alert("Please provide a description first to auto-classify.");
      return;
    }
    
    setIsClassifying(true);
    try {
      const response = await fetch('/api/classify-bhk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ description: newProperty.description })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
      
      if (response.ok && data.category) {
        setNewProperty(prev => ({ ...prev, bhkType: data.category }));
      } else {
        alert(data.error || "Failed to classify BHK Type");
      }
    } catch (error) {
      console.error(error);
      alert("Network error while classifying.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const token = await user?.getIdToken();
        const processedMedia = await Promise.all(files.map(async file => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData,
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed (${response.status}): ${errorText.substring(0, 100)}`);
          }
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
          }
          return { type: 'image', dataUrl: data.url };
        }));
        
        const newImages = processedMedia.map(m => m.dataUrl);
        
        setNewProperty(prev => {
          const updated = { ...prev };
          if (newImages.length > 0) {
            updated.imageUrls = [...(prev.imageUrls || []), ...newImages];
            if (!updated.imageUrl) updated.imageUrl = newImages[0];
          }
          return updated;
        });
      } catch (err) {
        console.error("Media processing error:", err);
        alert("Failed to process media. It might be due to size limits or storage permissions. Please try using URLs instead.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.googleMapsUrl) {
      alert("Please provide a Google Maps Location Link.");
      return;
    }
    try {
      const url = new URL(newProperty.googleMapsUrl);
      if (!url.hostname.includes('google.com') && !url.hostname.includes('goo.gl')) {
        alert("Please provide a valid Google Maps link (e.g., maps.google.com or goo.gl).");
        return;
      }
    } catch {
      alert("Please provide a valid Google Maps link.");
      return;
    }

    const isUpdating = !!newProperty.id;
    const prop: Property = {
      ...(newProperty as Property),
      id: newProperty.id || `prop_${Date.now()}`,
      amenities: amenitiesInput.split(',').map(s => s.trim()).filter(Boolean),
      tenant_preference: newProperty.tenant_preference || 'All',
      available_from: newProperty.available_from || 'Immediate',
      maintenance_amount: newProperty.maintenance_amount || 0,
      maintenance_type: newProperty.maintenance_type || 'Included in Rent'
    };

    if (prop.listingType === 'buy') {
      delete prop.furnishingStatus;
    }
    
    try {
      if (isUpdating) {
        await updateProperty(prop);
      } else {
        await addProperty(prop);
      }
      setShowAddForm(false);
      setNewProperty({title: '', description: '', price: 0, location: '', bedrooms: 1, bathrooms: 1, sqft: 0, imageUrl: '', imageUrls: [], videoUrl: '', googleMapsUrl: '', status: 'available', listingType: 'rent', contactPhone: '', amenities: ['Gym', 'Club House', 'Swimming Pool', 'Indoor Games', 'Park'], available_from: 'Immediate', tenant_preference: 'All', maintenance_amount: 0, maintenance_type: 'Included in Rent'});
      setAmenitiesInput('Gym, Club House, Swimming Pool, Indoor Games, Park');
      setBuyPriceAmount('');
      setBuyPriceUnit('Lakh');
      loadData(); // refresh
    } catch (error: any) {
      console.error("Failed to add/update property", error);
      alert("Failed to save property. Please check your connection and try again.");
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deleteProperty(propertyId);
      loadData();
    } catch (error) {
      console.error("Failed to delete property:", error);
      // In-app error handling would be better here, but for now we log it.
    }
  };

  const handleEditProperty = (property: Property) => {
    setNewProperty(property);
    setAmenitiesInput(property.amenities?.join(', ') || '');
    if (property.listingType === 'buy' && property.price) {
      if (property.price >= 10000000) {
        setBuyPriceAmount(property.price / 10000000);
        setBuyPriceUnit('Crore');
      } else {
        setBuyPriceAmount(property.price / 100000);
        setBuyPriceUnit('Lakh');
      }
    } else {
      setBuyPriceAmount('');
      setBuyPriceUnit('Lakh');
    }
    setShowAddForm(true);
  };

  const handleUpdateApplication = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await updateApplicationStatus(appId, status);
      loadData();
    } catch (error) {
      console.error("Failed to update application", error);
    }
  };
  
  const handleDeleteApp = async (appId: string) => {
    try {
      await deleteApplication(appId);
      loadData();
    } catch (error) {
      console.error("Failed to delete application", error);
    }
  };

  const handleUpdateInquiry = async (inqId: string, status: 'confirmed' | 'rejected') => {
    try {
      await updateInquiryStatus(inqId, status);
      loadData();
    } catch (error) {
      console.error("Failed to update inquiry", error);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      await updateLeadStatus(leadId, status);
      loadData();
    } catch (error) {
      console.error("Failed to update lead status", error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      loadData();
    } catch (error) {
      console.error("Failed to delete lead", error);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      await deleteInquiry(inquiryId);
      loadData();
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Owner Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage applications and view requirement requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
             onClick={() => {
               if (!showAddForm) {
                 setNewProperty({title: '', description: '', price: 0, location: '', bedrooms: 1, bathrooms: 1, sqft: 0, imageUrl: '', googleMapsUrl: '', status: 'available', listingType: 'rent', contactPhone: '', amenities: ['Gym', 'Club House', 'Swimming Pool', 'Indoor Games', 'Park'], available_from: 'Immediate', tenant_preference: 'All', maintenance_amount: 0, maintenance_type: 'Included in Rent'});
                 setAmenitiesInput('Gym, Club House, Swimming Pool, Indoor Games, Park');
                 setBuyPriceAmount('');
                 setBuyPriceUnit('Lakh');
               }
               setShowAddForm(!showAddForm)
             }}
             className="w-full sm:w-auto inline-flex items-center gap-2 bg-[#4aa4f0] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition shadow whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Inventory
          </button>
        </div>
      </div>

        {showAddForm && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
           <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Add New Property</h2>
           <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Title</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.title} onChange={e => setNewProperty({...newProperty, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Listing Type</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all" value={newProperty.listingType || ''} onChange={e => setNewProperty({...newProperty, listingType: e.target.value})}>
                    <option value="" disabled>Select listing type</option>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>
                {newProperty.listingType === 'buy' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Property Type</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.propertyType || ''} onChange={e => setNewProperty({...newProperty, propertyType: e.target.value})}>
                        <option value="">Select Property Type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Builder Floor">Builder Floor</option>
                        <option value="Independent House">Independent House</option>
                        <option value="Villa">Villa</option>
                        <option value="Plot / Land">Plot / Land</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location</label>
                      <input required type="text" placeholder="e.g. Noida Extension" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.location || ''} onChange={e => setNewProperty({...newProperty, location: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Society</label>
                      <input required type="text" placeholder="e.g. Gaur City 1" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.society || ''} onChange={e => setNewProperty({...newProperty, society: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location / Society</label>
                    <input required type="text" placeholder="e.g. Gaur City 1" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.society || newProperty.location} onChange={e => setNewProperty({...newProperty, society: e.target.value, location: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Google Maps Location Link</label>
                  <input required type="url" placeholder="https://maps.app.goo.gl/..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.googleMapsUrl || ''} onChange={e => setNewProperty({...newProperty, googleMapsUrl: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Floor</label>
                    <input type="text" placeholder="e.g. 5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.floor || ''} onChange={e => setNewProperty({...newProperty, floor: e.target.value})} />
                  </div>
                  {newProperty.listingType === 'buy' ? (
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Sale Price</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                          <input required type="number" step="any" placeholder="Amount (e.g. 1.25)" className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={buyPriceAmount} onChange={e => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setBuyPriceAmount(val);
                            if (val !== '') {
                              setNewProperty({...newProperty, price: val * (buyPriceUnit === 'Crore' ? 10000000 : 100000)});
                            } else {
                              setNewProperty({...newProperty, price: 0});
                            }
                          }} />
                          <select required className="w-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={buyPriceUnit} onChange={e => {
                            const unit = e.target.value as 'Lakh' | 'Crore';
                            setBuyPriceUnit(unit);
                            if (buyPriceAmount !== '') {
                              setNewProperty({...newProperty, price: Number(buyPriceAmount) * (unit === 'Crore' ? 10000000 : 100000)});
                            }
                          }}>
                            <option value="Lakh">Lakh</option>
                            <option value="Crore">Crore</option>
                          </select>
                        </div>
                        {newProperty.price ? (
                          <div className="flex flex-col justify-center text-sm">
                            <div className="text-slate-500 dark:text-slate-400">Display Price: <strong className="text-[#4aa4f0]">{formatPrice(newProperty.price)}</strong></div>
                            <div className="text-slate-500 dark:text-slate-400">Exact Price: <strong className="text-slate-700 dark:text-slate-200">₹{newProperty.price.toLocaleString('en-IN')}</strong></div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Monthly Rent</label>
                      <input required type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.price || ''} onChange={e => setNewProperty({...newProperty, price: Number(e.target.value)})} />
                    </div>
                  )}
                  {newProperty.listingType === 'buy' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Price Negotiable</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.priceNegotiable ? 'Yes' : 'No'} onChange={e => setNewProperty({...newProperty, priceNegotiable: e.target.value === 'Yes'})}>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Maintenance Type</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.maintenance_type || 'Included in Rent'} onChange={e => setNewProperty({...newProperty, maintenance_type: e.target.value as any})}>
                        <option value="Included in Rent">Included in Rent</option>
                        <option value="Extra / Separate">Excluding Maintenance</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-base font-bold text-slate-900 dark:text-white mb-4">Property Media</label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Upload Files (Images)</label>
                      <input disabled={isUploading} type="file" accept="image/*" multiple className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#4aa4f0] file:text-white hover:file:bg-opacity-90 file:cursor-pointer cursor-pointer text-sm text-slate-500 dark:text-slate-400 disabled:opacity-50" onChange={handleMediaUpload} />
                      {isUploading && (
                        <div className="mt-3 text-sm font-semibold text-[#4aa4f0] animate-pulse">
                          Uploading media, please wait...
                        </div>
                      )}
                      {((newProperty.imageUrls && newProperty.imageUrls.length > 0) || newProperty.imageUrl) && !isUploading && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-green-600 font-semibold bg-green-50 inline-block px-3 py-1.5 rounded-lg border border-green-200">
                            ✓ {newProperty.imageUrls ? newProperty.imageUrls.length : (newProperty.imageUrl ? 1 : 0)} image(s) processed
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setNewProperty({...newProperty, imageUrl: '', imageUrls: [], videoUrl: ''})} 
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                          >
                            Clear Media
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                       <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Or Provide Media URLs</label>
                       <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                         <input 
                           type="url" 
                           placeholder="External Image URL (https://...)" 
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm"
                           value={newProperty.imageUrl || ''} 
                           onChange={e => setNewProperty({...newProperty, imageUrl: e.target.value, imageUrls: newProperty.imageUrls ? [...newProperty.imageUrls, e.target.value] : [e.target.value]})} 
                         />
                       </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Precise BHK Type</label>
                     {newProperty.listingType === 'buy' ? (
                       <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.bhkType || ''} onChange={e => setNewProperty({...newProperty, bhkType: e.target.value})}>
                         <option value="">Select BHK</option>
                         <option value="1 RK">1 RK</option>
                         <option value="1 BHK">1 BHK</option>
                         <option value="2 BHK">2 BHK</option>
                         <option value="2 BHK + Study">2 BHK + Study</option>
                         <option value="3 BHK">3 BHK</option>
                         <option value="3 BHK + Study">3 BHK + Study</option>
                         <option value="4 BHK">4 BHK</option>
                         <option value="4 BHK + Study">4 BHK + Study</option>
                         <option value="5 BHK+">5 BHK+</option>
                       </select>
                     ) : (
                       <input type="text" placeholder="e.g. 2 BHK + Study" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.bhkType || ''} onChange={e => setNewProperty({...newProperty, bhkType: e.target.value})} />
                     )}
                   </div>
                   <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Beds</label><input required type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.bedrooms || ''} onChange={e => setNewProperty({...newProperty, bedrooms: Number(e.target.value)})} /></div>
                   <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Baths</label><input required type="number" step="0.5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.bathrooms || ''} onChange={e => setNewProperty({...newProperty, bathrooms: Number(e.target.value)})} /></div>
                   <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Sqft</label><input required type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.sqft || ''} onChange={e => setNewProperty({...newProperty, sqft: Number(e.target.value)})} /></div>
                </div>

                
                {newProperty.listingType === 'buy' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Registered Property</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.isRegistered ? 'Yes' : 'No'} onChange={e => setNewProperty({...newProperty, isRegistered: e.target.value === 'Yes'})}>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Super Area (sqft)</label>
                      <input type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.superArea || ''} onChange={e => setNewProperty({...newProperty, superArea: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Carpet Area (sqft)</label>
                      <input type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.carpetArea || ''} onChange={e => setNewProperty({...newProperty, carpetArea: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Facing</label>
                      <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.facing || ''} onChange={e => setNewProperty({...newProperty, facing: e.target.value})}>
                        <option value="">Select Facing</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North-East">North-East</option>
                        <option value="North-West">North-West</option>
                        <option value="South-East">South-East</option>
                        <option value="South-West">South-West</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Construction Status</label>
                      <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.constructionStatus || ''} onChange={e => setNewProperty({...newProperty, constructionStatus: e.target.value})}>
                        <option value="">Select Status</option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="New Launch">New Launch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Construction Quality</label>
                      <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.constructionQuality || ''} onChange={e => setNewProperty({...newProperty, constructionQuality: e.target.value})}>
                        <option value="">Select Quality</option>
                        <option value="Mivan">Mivan</option>
                        <option value="Brick">Brick</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Parking</label>
                      <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.parking || ''} onChange={e => setNewProperty({...newProperty, parking: e.target.value})}>
                        <option value="">Select Parking</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Balcony</label>
                      <input type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.balcony || ''} onChange={e => setNewProperty({...newProperty, balcony: Number(e.target.value)})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location Advantage</label>
                      <input type="text" placeholder="e.g. Near Metro, School nearby" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.locationAdvantage || ''} onChange={e => setNewProperty({...newProperty, locationAdvantage: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Available From</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.available_from && !['Immediate', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days'].includes(newProperty.available_from) ? 'Specific Date' : (newProperty.available_from || 'Immediate')} onChange={e => setNewProperty({...newProperty, available_from: e.target.value === 'Specific Date' ? '' : e.target.value})}>
                        <option value="Immediate">Immediate</option>
                        <option value="Within 7 Days">Within 7 Days</option>
                        <option value="Within 15 Days">Within 15 Days</option>
                        <option value="Within 30 Days">Within 30 Days</option>
                        <option value="Specific Date">Specific Date</option>
                      </select>
                      {newProperty.available_from && !['Immediate', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days'].includes(newProperty.available_from) && newProperty.available_from !== undefined || (newProperty.available_from === '' && !['Immediate', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days'].includes(newProperty.available_from!)) ? (
                        <input type="date" required className="w-full mt-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.available_from} onChange={e => setNewProperty({...newProperty, available_from: e.target.value})} />
                      ) : null}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Allowed Tenants</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.tenant_preference || 'All'} onChange={e => {
                        setNewProperty({...newProperty, tenant_preference: e.target.value});
                      }}>
                        <option value="All">All</option>
                        <option value="Family">Family</option>
                        <option value="Male Bachelor">Male Bachelor</option>
                        <option value="Female Bachelor">Female Bachelor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Furnishing Status</label>
                      <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.furnishingStatus || ''} onChange={e => setNewProperty({...newProperty, furnishingStatus: e.target.value})}>
                        <option value="">Select Status</option>
                        <option value="Furnished">Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Raw-Flat">Raw-Flat</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Description</label>
                  <button type="button" onClick={handleAutoClassify} disabled={isClassifying} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded font-bold hover:bg-purple-200 transition disabled:opacity-50 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {isClassifying ? 'Classifying...' : 'Auto-Classify BHK'}</button>
                </div>
                <textarea required rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={newProperty.description} onChange={e => setNewProperty({...newProperty, description: e.target.value})}></textarea>
              </div>
               <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Amenities (comma separated)</label>
                <input required type="text" placeholder="Pool, Gym, Parking" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none" value={amenitiesInput} onChange={e => setAmenitiesInput(e.target.value)} />
              </div>
              <div className="flex gap-4">
                 <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow">Save Property</button>
                 <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {/* Analytics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Properties</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalProperties}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Available</div>
          <div className="text-3xl font-bold text-[#4aa4f0]">{availableProperties}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Rented</div>
          <div className="text-3xl font-bold text-[#f08c4a]">{rentedProperties}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Societies</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{uniqueSocieties.length}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Most Viewed Properties</div>
          <div className="space-y-3">
            {topViewed.filter(p => p.views).length > 0 ? topViewed.filter(p => p.views).map(p => (
              <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate mr-4">{p.propertyId || ''} {p.title}</div>
                <div className="bg-[#4aa4f0]/10 text-[#4aa4f0] px-2 py-1 rounded text-xs font-bold shrink-0">{p.views} views</div>
              </div>
            )) : <div className="text-sm text-slate-500 dark:text-slate-400">No views yet</div>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#25D366]" /> Most Inquired Properties</div>
          <div className="space-y-3">
            {topInquired.filter(p => p.whatsappContacts).length > 0 ? topInquired.filter(p => p.whatsappContacts).map(p => (
              <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate mr-4">{p.propertyId || ''} {p.title}</div>
                <div className="bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded text-xs font-bold shrink-0">{p.whatsappContacts} inquiries</div>
              </div>
            )) : <div className="text-sm text-slate-500 dark:text-slate-400">No inquiries yet</div>}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#f08c4a]" />
            <h2 className="text-xl font-bold">Inventory Management</h2>
          </div>
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
             <input type="text" placeholder="Search ID, Society, Location, Owner, Tenant..." className="w-full bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-[#4aa4f0] focus:ring-1 focus:ring-[#4aa4f0] rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-3">
             <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterSociety} onChange={e => setFilterSociety(e.target.value)}>
                <option value="">All Societies</option>
                {uniqueSocieties.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterBHK} onChange={e => setFilterBHK(e.target.value)}>
                <option value="">All BHK</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="2 BHK + Study">2 BHK + Study</option>
                <option value="3 BHK + 2T">3 BHK + 2T</option>
                <option value="3 BHK + 3T">3 BHK + 3T</option>
                <option value="3 BHK + 3T + Servant">3 BHK + 3T + Servant</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5+ BHK">5+ BHK</option>
             </select>
             <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
             </select>
             <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterFurnishing} onChange={e => setFilterFurnishing(e.target.value)}>
                <option value="">All Furnishing</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Raw-Flat">Raw-Flat</option>
             </select>
             <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterFloorRange} onChange={e => setFilterFloorRange(e.target.value)}>
                <option value="">All Floors</option>
                <option value="0-5">Floor 0 - 5</option>
                <option value="6-10">Floor 6 - 10</option>
                <option value="11-15">Floor 11 - 15</option>
                <option value="16+">Floor 16+</option>
             </select>
             <button onClick={() => {setFilterSociety('');setFilterTower('');setFilterBHK('');setFilterStatus('');setFilterFurnishing('');setFilterPropType('');setSearchQuery('');setFilterRentMin('');setFilterRentMax('');setFilterFloorRange('');}} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition">
               Clear Filters
             </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-1/3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">Rent Range:</span>
            <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterRentMin} onChange={e => setFilterRentMin(e.target.value)} />
            <span className="text-slate-400 dark:text-slate-500">-</span>
            <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#4aa4f0] outline-none" value={filterRentMax} onChange={e => setFilterRentMax(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-bold">Property ID</th>
                <th className="p-4 font-bold">Location Details</th>
                <th className="p-4 font-bold">Property Info</th>
                <th className="p-4 font-bold">Pricing</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                     <div className="animate-pulse space-y-4">
                       <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
                       <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                     </div>
                   </td>
                 </tr>
               ) : filteredProperties.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">No properties found matching your criteria.</td>
                 </tr>
               ) : (
                 filteredProperties.map(property => (
                   <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                     <td className="p-4 align-top">
                       <div className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded inline-block">
                         {property.propertyId || 'Loading...'}
                       </div>
                       <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Added: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}</div>
                     </td>
                     <td className="p-4 align-top">
                       <div className="font-semibold text-slate-900 dark:text-white">{property.society || property.location}</div>
                       
                       <div className="text-slate-500 dark:text-slate-400 text-xs">Floor: {property.floor || 'N/A'}</div>
                     </td>
                     <td className="p-4 align-top">
                       <div className="font-semibold text-slate-900 dark:text-white">{property.bhkType || `${property.bedrooms} BHK`}</div>
                       <div className="text-slate-600 dark:text-slate-300 text-xs mt-1">{property.sqft} sq.ft</div>
                       {property.listingType === 'rent' && property.furnishingStatus && (
                         <div className="text-slate-500 dark:text-slate-400 text-xs">{property.furnishingStatus}</div>
                       )}
                     </td>
                     <td className="p-4 align-top">
                       <div className="font-bold text-slate-900 dark:text-white">{property.listingType === 'buy' ? formatPrice(property.price) : `₹${property.price}/mo`}</div>
                       {property.listingType === 'buy' ? (
                         <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{property.priceNegotiable ? 'Negotiable' : 'Fixed'}</div>
                       ) : (
                         <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{property.maintenance_type === 'Included in Rent' ? 'Maint. Incl.' : 'Excluding Maintenance'}</div>
                       )}
                     </td>
                     <td className="p-4 align-top">
                       <div className="mb-2 flex items-center gap-2">
                         {property.listingType === 'rent' ? (
                           <span className={`px-2 py-0.5 rounded text-xs font-bold ${property.availabilityStatus === 'rented_out' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                             {property.availabilityStatus === 'rented_out' ? 'Rented Out' : 'Available'}
                           </span>
                         ) : (
                           <span className={`px-2 py-0.5 rounded text-xs font-bold ${property.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                             {property.status === 'available' ? 'Available' : 'Sold'}
                           </span>
                         )}
                         <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#4aa4f0]/10 text-[#4aa4f0] uppercase">
                           {property.listingType || 'Rent'}
                         </span>
                       </div>
                       <div className="text-xs font-bold text-[#4aa4f0] mt-2">
                         {property.enquiryCount || 0} {(property.enquiryCount === 1) ? "Enquiry" : "Enquiries"}
                       </div>
                     </td>
                     <td className="p-4 align-top text-right">
                       <div className="flex items-center justify-end flex-wrap gap-2">
                         <button onClick={() => {
                            navigator.clipboard.writeText(property.propertyId || property.id);
                            alert("Property ID copied: " + (property.propertyId || property.id));
                         }} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition" title="Copy ID">
                           <Copy className="w-4 h-4" />
                         </button>
                         <button onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
                            alert("Property Link copied successfully");
                         }} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition" title="Copy Link">
                           <LinkIcon className="w-4 h-4" />
                         </button>
                         <Link to={`/property/${property.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded transition" title="View Public Page">
                           <Eye className="w-4 h-4" />
                         </Link>
                         <button onClick={() => {
                            setSelectedPropertyForEnquiries(property);
                            setShowEnquiriesModal(true);
                         }} className="p-2 text-green-600 hover:bg-green-50 rounded transition" title="View Enquiries">
                           <Users className="w-4 h-4" />
                         </button>
                         {property.listingType === 'rent' && (
                           <button onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             setAvailabilityTarget({
                               property,
                               newStatus: property.availabilityStatus === 'rented_out' ? 'available' : 'rented_out'
                             });
                             setShowAvailabilityModal(true);
                           }} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition" title={property.availabilityStatus === 'rented_out' ? "Mark as Available" : "Mark as Rented Out"}>
                             <span className="text-xs font-semibold">{property.availabilityStatus === 'rented_out' ? "Mark Available" : "Mark Rented"}</span>
                           </button>
                         )}
                          <button onClick={() => {
                             setInquiryPropertyFilter(property.propertyId || property.id);
                          }} className="p-2 text-[#8cc63f] hover:bg-[#8cc63f]/10 rounded transition" title="Open Inquiries">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            const text = `Check out this property: ${window.location.origin}/property/${property.id}`;
                            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
                          }} className="p-2 text-white hover:bg-green-600 rounded transition bg-[#25D366]" title="Share on WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleEditProperty(property)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition" title="Edit Property">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           type="button"
                           onClick={(e) => { 
                             e.preventDefault(); 
                             e.stopPropagation(); 
                             setDeleteTarget(property); 
                             setDeleteConfirmationText(''); 
                           }} 
                           className="p-2 text-red-500 hover:bg-red-50 rounded transition" 
                           title="Delete Property"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        
        {/* Applications Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4aa4f0]" />
              <h2 className="text-xl font-bold">Recent Applications</h2>
            </div>
            <div className="relative w-full md:w-64">
               <input type="text" placeholder="Filter by Property ID..." className="w-full bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-[#4aa4f0] rounded-xl px-3 py-1.5 outline-none text-sm" value={leadPropertyFilter} onChange={e => setLeadPropertyFilter(e.target.value)} />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
             {loading ? (
               <div className="p-6 space-y-6">
                 {[1, 2].map(i => (
                   <div key={i} className="animate-pulse flex gap-4">
                     <div className="flex-1 space-y-3">
                       <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                       <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                       <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full mt-2"></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : applications.filter(a => leadPropertyFilter ? (a.property?.propertyId?.toLowerCase().includes(leadPropertyFilter.toLowerCase()) || a.propertyId.includes(leadPropertyFilter)) : true).length === 0 ? (
               <div className="p-8 text-center text-slate-500 dark:text-slate-400">No applications yet.</div>
             ) : (
               applications.filter(a => leadPropertyFilter ? (a.property?.propertyId?.toLowerCase().includes(leadPropertyFilter.toLowerCase()) || a.propertyId.includes(leadPropertyFilter)) : true).map(app => (
                 <div key={app.id} className="p-6">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <div className="font-bold text-slate-900 dark:text-white">{app.tenantName}</div>
                       <div className="text-sm text-slate-500 dark:text-slate-400">{app.tenantPhone}</div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : 
                          app.status === 'reviewing' ? 'bg-[#4aa4f0]/20 text-[#4aa4f0]' :
                          app.status === 'approved' ? 'bg-[#8cc63f]/20 text-[#8cc63f]' : 'bg-red-500/20 text-red-600'
                       }`}>
                         {app.status}
                       </span>
                       <div className="flex items-center gap-1">
                         {app.status !== 'approved' && (
                           <button 
                             onClick={() => handleUpdateApplication(app.id, 'approved')}
                             className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition"
                             title="Approve"
                           >
                             <CheckCircle2 className="w-4 h-4" />
                           </button>
                         )}
                         {app.status !== 'rejected' && (
                           <button 
                             onClick={() => handleUpdateApplication(app.id, 'rejected')}
                             className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                             title="Reject"
                           >
                             <XCircle className="w-4 h-4" />
                           </button>
                         )}
                         <button 
                           onClick={() => handleDeleteApp(app.id)}
                           className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                           title="Delete"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                   <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-medium">
                      <Home className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{app.property?.title}</span>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Inquiries Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8cc63f]" />
              <h2 className="text-xl font-bold">Requirement Requests</h2>
            </div>
             <div className="relative w-full md:w-64">
                <input type="text" placeholder="Filter by Loc/Keywords..." className="w-full bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-[#4aa4f0] rounded-xl px-3 py-1.5 outline-none text-sm" value={inquiryPropertyFilter} onChange={e => setInquiryPropertyFilter(e.target.value)} />
             </div>
          </div>
           <div className="divide-y divide-slate-100">
             {loading ? (
               <div className="p-6 space-y-6">
                 {[1, 2].map(i => (
                   <div key={i} className="animate-pulse space-y-3">
                     <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                     <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                     <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div>
                   </div>
                 ))}
               </div>
             ) : inquiries.filter(inq => inquiryPropertyFilter ? (inq.propertyId?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase()) || inq.location?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase()) || inq.requirements?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase())) : true).length === 0 ? (
               <div className="p-8 text-center text-slate-500 dark:text-slate-400">No requirement requests.</div>
             ) : (
               inquiries.filter(inq => inquiryPropertyFilter ? (inq.propertyId?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase()) || inq.location?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase()) || inq.requirements?.toLowerCase().includes(inquiryPropertyFilter.toLowerCase())) : true).map(inquiry => (
                 <div key={inquiry.id} className="p-6">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="font-bold text-slate-900 dark:text-white">{inquiry.name}</div>
                       <div className="text-sm text-slate-500 dark:text-slate-400">{inquiry.email} • {inquiry.phone}</div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                          {new Date(inquiry.dateSubmitted).toLocaleDateString()}
                       </span>
                       {inquiry.status && (
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inquiry.status === 'confirmed' ? 'bg-[#8cc63f]/20 text-[#8cc63f]' : 
                            inquiry.status === 'rejected' ? 'bg-red-500/20 text-red-600' : 'bg-yellow-500/20 text-yellow-600'
                         }`}>
                           {inquiry.status}
                         </span>
                       )}
                     </div>
                   </div>
                   <div className="space-y-3 mt-4">
                     <div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Target Property</div>
                            <div className="text-sm text-[#4aa4f0] font-bold">{inquiry.propertyId || 'Any'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Configuration</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.bhk ? `${inquiry.bhk} BHK` : 'Any BHK'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tenant Type</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.tenantPreference || 'N/A'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Furnishing</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.furnishingStatus || 'Any'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Location Pref.</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.location || 'Any'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Shifting Date</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.shiftingDate ? new Date(inquiry.shiftingDate).toLocaleDateString() : 'Flexible'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Budget</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{inquiry.budget ? `₹${inquiry.budget}` : 'N/A'}</div>
                         </div>
                       </div>
                       
                       {inquiry.requirements && (
                         <div className="mt-4">
                           <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Specific Requirements</div>
                           <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 italic leading-relaxed">{inquiry.requirements}</div>
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="mt-4 flex justify-end gap-2">
                     {(!inquiry.status || inquiry.status === 'pending') && (
                       <>
                         <button
                           onClick={() => handleUpdateInquiry(inquiry.id, 'confirmed')}
                           className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition text-sm font-bold flex items-center gap-1 border border-transparent hover:border-green-200"
                         >
                           <CheckCircle2 className="w-4 h-4" /> Confirm
                         </button>
                         <button
                           onClick={() => handleUpdateInquiry(inquiry.id, 'rejected')}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-bold flex items-center gap-1 border border-transparent hover:border-red-100"
                         >
                           <XCircle className="w-4 h-4" /> Reject
                         </button>
                       </>
                     )}
                     <button
                       onClick={() => handleDeleteInquiry(inquiry.id)}
                       className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-sm font-bold flex items-center gap-1 border border-transparent hover:border-slate-200 dark:border-slate-700"
                     >
                       <Trash2 className="w-4 h-4" /> Delete
                     </button>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>

      {/* WhatsApp Leads Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#25D366] text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-xl font-bold">WhatsApp Leads</h2>
          </div>
          <div className="relative w-full md:w-64">
             <input type="text" placeholder="Filter by Property ID/Loc..." className="w-full bg-[#1da851] text-white placeholder-white/70 border border-[#168a41] focus:border-white rounded-xl px-3 py-1.5 outline-none text-sm placeholder:text-white/60" value={leadPropertyFilter} onChange={e => setLeadPropertyFilter(e.target.value)} />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
           {loading ? (
             <div className="p-6 space-y-6">
               {[1, 2].map(i => (
                 <div key={i} className="animate-pulse space-y-3">
                   <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                   <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                   <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div>
                 </div>
               ))}
             </div>
           ) : leads.filter(l => leadPropertyFilter ? (l.propertyTitle?.toLowerCase().includes(leadPropertyFilter.toLowerCase()) || l.propertyId.toLowerCase().includes(leadPropertyFilter.toLowerCase())) : true).length === 0 ? (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400">No WhatsApp leads yet.</div>
           ) : (
             leads.filter(l => leadPropertyFilter ? (l.propertyTitle?.toLowerCase().includes(leadPropertyFilter.toLowerCase()) || l.propertyId.toLowerCase().includes(leadPropertyFilter.toLowerCase())) : true).map(lead => (
               <div key={lead.id} className="p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
                 <div className="flex-1 space-y-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <div className="font-bold text-slate-900 dark:text-white text-lg">{lead.userName}</div>
                       <div className="text-sm text-slate-500 dark:text-slate-400">{lead.userEmail || 'No Email'} • {lead.userPhone || 'No Phone Number Collected'}</div>
                     </div>
                     <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        lead.status === 'New' ? 'bg-[#25D366]/20 text-[#25D366]' : 
                        lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-600' :
                        lead.status === 'Follow Up' ? 'bg-[#4aa4f0]/20 text-[#4aa4f0]' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                     }`}>
                       {lead.status}
                     </span>
                   </div>
                   
                   <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Home className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{lead.propertyTitle}</div>
                        <a href={lead.propertyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4aa4f0] hover:underline truncate inline-block max-w-[200px] sm:max-w-md">{lead.propertyLink}</a>
                      </div>
                   </div>
                   
                   <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Lead Generated: {new Date(lead.createdAt).toLocaleString()}
                   </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 shrink-0 w-full md:w-40">
                   <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mt-1">Change Status</div>
                   <select 
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
                     value={lead.status}
                     onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                   >
                     <option value="New">New</option>
                     <option value="Contacted">Contacted</option>
                     <option value="Follow Up">Follow Up</option>
                     <option value="Closed">Closed</option>
                   </select>
                   <button 
                     onClick={() => handleDeleteLead(lead.id)}
                     className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                     Delete Lead
                   </button>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>

      {showEnquiriesModal && selectedPropertyForEnquiries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enquiries for {selectedPropertyForEnquiries.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Property ID: {selectedPropertyForEnquiries.propertyId || selectedPropertyForEnquiries.id}</p>
              </div>
              <button onClick={() => setShowEnquiriesModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const propLeads = leads.filter(l => l.propertyId === selectedPropertyForEnquiries.id);
                if (propLeads.length === 0) {
                  return <div className="text-center py-12 text-slate-500 dark:text-slate-400">No enquiries found for this property yet.</div>;
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propLeads.map(lead => (
                      <div key={lead.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{lead.userName || 'Unknown'}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lead.userEmail}</div>
                            <div className="text-xs font-semibold text-[#4aa4f0] mt-1">{lead.userPhone}</div>
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                             {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              lead.status === 'New' ? 'bg-[#4aa4f0]/20 text-[#4aa4f0]' : 
                              lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-600' :
                              lead.status === 'Closed' ? 'bg-slate-500/20 text-slate-600' : 'bg-[#8cc63f]/20 text-[#8cc63f]'
                           }`}>
                             {lead.status}
                           </span>
                           <span className="text-xs font-semibold text-slate-500">Source: {lead.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && availabilityTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {availabilityTarget.newStatus === 'rented_out' ? 'Mark this flat as rented out?' : 'Make this flat available again?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {availabilityTarget.newStatus === 'rented_out' 
                ? 'Users will see that this property is no longer available. Normal enquiry and visit actions will be disabled.'
                : 'Users will once again be able to enquire about this property and schedule a visit.'}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowAvailabilityModal(false); }}
                disabled={updatingAvailability}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  setUpdatingAvailability(true);
                  try {
                    await updateRentPropertyAvailability(availabilityTarget.property.id, availabilityTarget.newStatus, user!.uid);
                    setProperties(prev => prev.map(p => 
                      p.id === availabilityTarget.property.id 
                        ? { ...p, availabilityStatus: availabilityTarget.newStatus, rentedOutAt: availabilityTarget.newStatus === 'rented_out' ? new Date().toISOString() : null }
                        : p
                    ));
                    setShowAvailabilityModal(false);
                    alert(availabilityTarget.newStatus === 'rented_out' ? "Property marked as rented out." : "Property is available again.");
                  } catch (err) {
                    console.error(err);
                    alert("Unable to update the property status. Please try again.");
                  } finally {
                    setUpdatingAvailability(false);
                  }
                }}
                disabled={updatingAvailability}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors disabled:opacity-50 ${availabilityTarget.newStatus === 'rented_out' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {updatingAvailability ? 'Updating...' : (availabilityTarget.newStatus === 'rented_out' ? 'Mark as Rented Out' : 'Mark as Available')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => { if(!isDeletingProperty) setDeleteTarget(null); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              disabled={isDeletingProperty}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Delete this property?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                This action will permanently delete this property from your inventory. This cannot be undone.
              </p>
              
              <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-left border border-slate-100 dark:border-slate-700/50 mt-4 space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{deleteTarget.title}</p>
                <div className="text-sm text-slate-500 flex flex-col gap-1">
                  <span>ID: {deleteTarget.propertyId || deleteTarget.id}</span>
                  <span className="capitalize">Type: {deleteTarget.listingType}</span>
                  <span>Location: {deleteTarget.society || deleteTarget.location}</span>
                </div>
              </div>

              <div className="w-full mt-4 text-left">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  disabled={isDeletingProperty}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 w-full mt-6">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(null); }}
                  disabled={isDeletingProperty}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsDeletingProperty(true);
                    try {
                      await deleteProperty(deleteTarget.id);
                      setProperties(prev => prev.filter(p => p.id !== deleteTarget.id));
                      setDeleteTarget(null);
                      alert("Property deleted successfully.");
                    } catch (err) {
                      console.error("Failed to delete property:", err);
                      alert("Unable to delete the property. Please try again.");
                    } finally {
                      setIsDeletingProperty(false);
                    }
                  }}
                  disabled={isDeletingProperty || deleteConfirmationText.trim().toLowerCase() !== 'delete'}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeletingProperty ? 'Deleting...' : 'Delete Property'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
