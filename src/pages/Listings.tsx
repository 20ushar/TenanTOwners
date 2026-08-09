import { WHATSAPP_NUMBER } from '../lib/constants';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, ArrowRight, Home as HomeIcon } from 'lucide-react';
import { getProperties, addLead, incrementPropertyMetric } from '../lib/store';
import { Property } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { usePreference } from '../lib/PreferenceContext';
import { ImageSlider } from '../components/ImageSlider';

export function Listings() {
  const { user } = useAuth();
  const { preference, setPreference } = usePreference();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterBHK, setFilterBHK] = useState('');
  const [filterTenant, setFilterTenant] = useState('All');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterMaintenance, setFilterMaintenance] = useState('Any');
  
  // Buy-specific Filters
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterPropertyType, setFilterPropertyType] = useState('All');
  const [filterConstructionQuality, setFilterConstructionQuality] = useState('All');
  const [filterRegistered, setFilterRegistered] = useState('All');
  const [filterFacing, setFilterFacing] = useState('All');
  const [filterSocietyBuy, setFilterSocietyBuy] = useState('');
  const [searchQueryBuy, setSearchQueryBuy] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [rentSortOrder, setRentSortOrder] = useState('Newest First');
  
  const [loading, setLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const props = await getProperties({ listingType: preference || 'rent' });
        setProperties(props);
        setErrorMSG('');
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setErrorMSG('Failed to load listings. Please check your connection or try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, [preference]);

  const filteredProperties = useMemo(() => {
    let result = properties.filter(p => {
      if (preference === 'buy') {
        const matchSearch = searchQueryBuy ? (
          p.title?.toLowerCase().includes(searchQueryBuy.toLowerCase()) ||
          p.society?.toLowerCase().includes(searchQueryBuy.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchQueryBuy.toLowerCase()) ||
          p.propertyType?.toLowerCase().includes(searchQueryBuy.toLowerCase())
        ) : true;
        const matchMinPrice = filterMinPrice ? p.price >= parseInt(filterMinPrice) : true;
        const matchMaxPrice = filterMaxPrice ? p.price <= parseInt(filterMaxPrice) : true;
        const matchPropType = filterPropertyType !== 'All' ? p.propertyType === filterPropertyType : true;
        const matchBeds = filterBHK !== 'All' && filterBHK !== '' ? (p.bhkType ? p.bhkType.includes(filterBHK) : p.bedrooms === parseInt(filterBHK)) : true;
        const matchQuality = filterConstructionQuality !== 'All' ? p.constructionQuality === filterConstructionQuality : true;
        const matchRegistered = filterRegistered !== 'All' ? (filterRegistered === 'Yes' ? p.isRegistered : !p.isRegistered) : true;
        const matchFacing = filterFacing !== 'All' ? p.facing === filterFacing : true;
        const matchLocation = filterLocation ? p.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
        const matchSociety = filterSocietyBuy ? p.society?.toLowerCase().includes(filterSocietyBuy.toLowerCase()) : true;
        
        return matchSearch && matchMinPrice && matchMaxPrice && matchPropType && matchBeds && matchQuality && matchRegistered && matchFacing && matchLocation && matchSociety;
      } else {
        const matchLocation = filterLocation ? p.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
        const matchBeds = filterBHK ? (p.bhkType ? p.bhkType.includes(filterBHK) : p.bedrooms === parseInt(filterBHK)) : true;
        const matchBudget = filterBudget ? p.price <= parseInt(filterBudget) : true;
        
        // Improved tenant filter logic
        let matchTenant = true;
        if (filterTenant !== 'All') {
          matchTenant = !p.tenant_preference || p.tenant_preference === 'All' || p.tenant_preference === filterTenant;
        }

        const matchFurnishing = filterFurnishing ? p.furnishingStatus === filterFurnishing : true;
        
        // Maintenance filter
        let matchMaintenance = true;
        if (filterMaintenance === 'Included in Rent') {
          matchMaintenance = !p.maintenance_type || p.maintenance_type === 'Included in Rent';
        } else if (filterMaintenance === 'Extra / Separate') {
          matchMaintenance = !!p.maintenance_type && p.maintenance_type !== 'Included in Rent';
        }
        
        return matchLocation && matchBeds && matchBudget && matchTenant && matchFurnishing && matchMaintenance;
      }
    });

    if (preference === 'buy') {
      if (sortOrder === 'Price Low → High') {
        result = result.sort((a, b) => a.price - b.price);
      } else if (sortOrder === 'Price High → Low') {
        result = result.sort((a, b) => b.price - a.price);
      } else {
        // Newest First
        result = result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      }
    }

    return result;
  }, [properties, preference, filterLocation, filterBHK, filterTenant, filterBudget, filterFurnishing, filterMaintenance, filterMinPrice, filterMaxPrice, filterPropertyType, filterConstructionQuality, filterRegistered, filterFacing, filterSocietyBuy, searchQueryBuy, sortOrder, rentSortOrder]);

  const handleWhatsAppClick = async (property: Property) => {
    try {
      await fetch('/api/track-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyLink: `${window.location.origin}/property/${property.id}`,
          userId: user?.uid,
          userName: user?.displayName || user?.email || 'Anonymous Visitor',
          userEmail: user?.email || '',
          userPhone: ''
        })
      });
    } catch (error) {
      console.error("Failed to track WhatsApp lead:", error);
    }
    
    // Redirect to Admin WhatsApp
    const message = `Hello, I am interested in this property.\n\nProperty ID: ${property.id.slice(-6).toUpperCase()}\nProperty: ${property.bedrooms} BHK in ${property.location}\nProperty Link: ${window.location.origin}/property/${property.id}\n\nPlease share more details.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filter */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              {isFiltersOpen ? 'Minimize' : 'Expand'}
            </button>
          </div>
          
          {isFiltersOpen && (
            <div className="space-y-6 mt-6 max-h-[calc(100vh-150px)] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Looking For</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                  value={preference || 'rent'}
                  onChange={(e) => setPreference(e.target.value)}
                >
                  <option value="rent">Rent</option>
                  <option value="buy">Buy</option>
                </select>
              </div>

              {preference === 'buy' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Title, Location, Society..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                      value={searchQueryBuy}
                      onChange={(e) => setSearchQueryBuy(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Sort By</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="Newest First">Newest First</option>
                      <option value="Price Low → High">Price Low → High</option>
                      <option value="Price High → Low">Price High → Low</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Min Price</label>
                      <input
                        type="number"
                        placeholder="₹"
                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                        value={filterMinPrice}
                        onChange={(e) => setFilterMinPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Max Price</label>
                      <input
                        type="number"
                        placeholder="₹"
                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Property Type</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterPropertyType}
                      onChange={(e) => setFilterPropertyType(e.target.value)}
                    >
                      <option value="All">All Types</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Builder Floor">Builder Floor</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot / Land">Plot / Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">BHK Type</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterBHK}
                      onChange={(e) => setFilterBHK(e.target.value)}
                    >
                      <option value="All">All BHKs</option>
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
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Construction Quality</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterConstructionQuality}
                      onChange={(e) => setFilterConstructionQuality(e.target.value)}
                    >
                      <option value="All">All Qualities</option>
                      <option value="Mivan">Mivan</option>
                      <option value="Brick">Brick</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Registered Property</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterRegistered}
                      onChange={(e) => setFilterRegistered(e.target.value)}
                    >
                      <option value="All">Any Status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Facing</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterFacing}
                      onChange={(e) => setFilterFacing(e.target.value)}
                    >
                      <option value="All">Any Facing</option>
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
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Noida Extension"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Society</label>
                    <input
                      type="text"
                      placeholder="e.g. Gaur City 1"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                      value={filterSocietyBuy}
                      onChange={(e) => setFilterSocietyBuy(e.target.value)}
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSearchQueryBuy('');
                        setFilterMinPrice('');
                        setFilterMaxPrice('');
                        setFilterPropertyType('All');
                        setFilterBHK('All');
                        setFilterConstructionQuality('All');
                        setFilterRegistered('All');
                        setFilterFacing('All');
                        setFilterLocation('');
                        setFilterSocietyBuy('');
                        setSortOrder('Newest First');
                      }}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    >
                      <option value="">Any Location</option>
                      <option value="Gaur City 1">Gaur City 1</option>
                      <option value="Gaur City 2">Gaur City 2</option>
                      <option value="Techzone 4">Techzone 4</option>
                      <option value="Noida Extension">Noida Extension</option>
                      <option value="Central Noida">Central Noida</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">BHK Type</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterBHK}
                      onChange={(e) => setFilterBHK(e.target.value)}
                    >
                      <option value="">Any BHK</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="2 BHK + Study">2 BHK + Study</option>
                      <option value="3 BHK + 2T">3 BHK + 2T</option>
                      <option value="3 BHK + 3T">3 BHK + 3T</option>
                      <option value="3 BHK + 3T + Servant">3 BHK + 3T + Servant</option>
                      <option value="4 BHK">4 BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tenant Profile</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterTenant}
                      onChange={(e) => setFilterTenant(e.target.value)}
                    >
                      <option value="All">All / Any</option>
                      <option value="Family">Family</option>
                      <option value="Male Bachelor">Male Bachelor</option>
                      <option value="Female Bachelor">Female Bachelor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Max Rent Range (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-all text-sm"
                      value={filterBudget}
                      onChange={(e) => setFilterBudget(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Maintenance</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterMaintenance}
                      onChange={(e) => setFilterMaintenance(e.target.value)}
                    >
                      <option value="Any">any Maintenance mode (All Flats)</option>
                      <option value="Included in Rent">Including Maintenance</option>
                      <option value="Extra / Separate">Excluding Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Furnishing</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none text-sm transition-all"
                      value={filterFurnishing}
                      onChange={(e) => setFilterFurnishing(e.target.value)}
                    >
                      <option value="">Any Status</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Raw-Flat">Raw-Flat</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setFilterLocation('');
                        setFilterBHK('');
                        setFilterTenant('All');
                        setFilterBudget('');
                        setFilterFurnishing('');
                        setFilterMaintenance('Any');
                      }}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Discover Properties</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-semibold tracking-wide">Showing {filteredProperties.length} available listings</p>
           </div>
           
           <div className="flex gap-2">
             {/* decorative spacer mimicking bento header */}
             <div className="hidden sm:block h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div className="hidden sm:block h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col animate-pulse">
                <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mt-2"></div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : errorMSG ? (
          <div className="bg-red-50 text-red-500 border border-red-200 rounded-2xl p-6 text-center mt-4">
            <p className="font-semibold">{errorMSG}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                const allMedia: { type: 'image' | 'video', url: string }[] = [];
                if (property.imageUrls && property.imageUrls.length > 0) {
                  allMedia.push(...property.imageUrls.map(url => ({ type: 'image' as const, url })));
                } else if (property.imageUrl) {
                  allMedia.push({ type: 'image', url: property.imageUrl });
                }
                if (property.videoUrl) {
                  allMedia.push({ type: 'video', url: property.videoUrl });
                }

                return (
                  <div key={property.id} className="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col">
                    <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                       <ImageSlider media={allMedia} className="absolute inset-0 w-full h-full" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                       {property.availabilityStatus === 'rented_out' && (
                         <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                           <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg rotate-[-12deg] border-2 border-white dark:border-slate-800">RENTED OUT</span>
                         </div>
                       )}
                       <div className="absolute top-4 right-4 bg-white dark:bg-slate-800/90 backdrop-blur rounded-lg px-2 py-1 text-xs font-bold text-[#4aa4f0] z-10 pointer-events-none">
                          {property.listingType === 'buy' ? formatPrice(property.price) : `₹${property.price}/mo`}
                       </div>
                       <h3 className="absolute bottom-4 left-4 right-4 z-10 text-white font-bold text-lg leading-tight pointer-events-none">{property.title}</h3>
                    </Link>
                    <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-800">
                    <div className="flex items-center text-slate-500 dark:text-slate-400 mb-3 text-xs gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#8cc63f]" />
                      {property.location}
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold"><Bed className="w-4 h-4" /> {property.bhkType || `${property.bedrooms} BHK`}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold"><Square className="w-4 h-4" /> {property.sqft} Sq.Ft</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                       {property.listingType === 'buy' ? (
                         <>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Facing</span> {property.facing || 'Any'}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Status</span> {property.constructionStatus || 'Any'}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Registered</span> {property.isRegistered ? 'Yes' : 'No'}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Super Area</span> {property.superArea ? `${property.superArea} sqft` : 'N/A'}</p>
                         </>
                       ) : (
                         <>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Property Type</span> {property.furnishingStatus || 'Any'}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Available From</span> {property.available_from || 'Immediate'}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Tenants</span> {property.tenant_preference || (property.allowedTenants?.length ? property.allowedTenants.join(', ') : 'All')}</p>
                           <p className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Maintenance</span> {(!property.maintenance_type || property.maintenance_type === 'Included in Rent') ? 'Included' : 'Excluded'}</p>
                         </>
                       )}
                    </div>
                    
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block mb-1">Amenities</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{property.amenities.join(' • ')}</p>
                      </div>
                    )}
                    
                    <div className="mb-4 text-center bg-slate-50 dark:bg-slate-900 rounded-xl py-2 px-3 border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {(() => {
                          const c = property.enquiryCount || 0;
                          if (c === 0) return "Be the first to enquire about this property";
                          if (c === 1) return "1 person enquired about this property";
                          return `${c} people enquired about this property`;
                        })()}
                      </p>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                       <Link to={`/property/${property.id}`} className="w-full flex items-center justify-center py-2.5 bg-[#4aa4f0] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-colors">
                          View Details
                       </Link>
                       <button
                         onClick={() => handleWhatsAppClick(property)}
                         className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-colors"
                       >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
                       </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
            
            {filteredProperties.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                   {preference === 'buy' ? 'No properties for sale are available at the moment.' : 'No rental properties are available at the moment.'}
                 </h3>
                 <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Try adjusting your filters or checking back later.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
