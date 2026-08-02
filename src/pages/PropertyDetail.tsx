import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY_NUMBER } from '../lib/constants';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById, addApplication, isInWishlist, toggleWishlist, recordPropertyView, addLead, incrementPropertyMetric, recordUniqueEnquiry, getProperties } from '../lib/store';
import { Property } from '../types';
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, ArrowLeft, CheckCircle2, Heart, Share2, Link as LinkIcon, Facebook, Info, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { submitPropertyEnquiry, getEnquiryLimit } from '../lib/api';
import { optimizeCloudinaryUrl, formatPrice } from '../lib/utils';

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState('');
  
  // Application Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [applied, setApplied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Enquiry State
  const [enquiryLimit, setEnquiryLimit] = useState<{count: number, limit: number} | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryEmail, setEnquiryEmail] = useState(user?.email || '');
  const [enquired, setEnquired] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      setActiveImageIndex((prev) => (prev + 1) % (allMedia.length || 1));
    } else if (isRightSwipe) {
      setActiveImageIndex((prev) => (prev - 1 + (allMedia.length || 1)) % (allMedia.length || 1));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const [found, isLiked] = await Promise.all([
            getPropertyById(id),
            isInWishlist(id)
          ]);
          setProperty(found);
          setErrorMSG('');
          if (found) {
            // Fetch similar properties
            if (found.listingType === 'rent' && found.availabilityStatus === 'rented_out') {
              try {
                const allRent = await getProperties({ listingType: 'rent' });
                let similar = allRent.filter(p => p.id !== found.id && p.availabilityStatus !== 'rented_out');
                
                // Sort by similarity: society > location > bhk > price
                similar.sort((a, b) => {
                  let scoreA = 0;
                  let scoreB = 0;
                  if (a.society === found.society) scoreA += 10;
                  if (b.society === found.society) scoreB += 10;
                  if (a.location === found.location) scoreA += 5;
                  if (b.location === found.location) scoreB += 5;
                  if (a.bedrooms === found.bedrooms) scoreA += 3;
                  if (b.bedrooms === found.bedrooms) scoreB += 3;
                  
                  return scoreB - scoreA;
                });
                
                setSimilarProperties(similar.slice(0, 3));
              } catch (e) {}
            }

            setLiked(isLiked);
            setActiveImageIndex(0);
            
            // Record view if user is logged in
            if (user && user.uid) {
              await recordPropertyView(found.id, user.uid, user.email);
            }
          }
        } catch (error) {
          console.error("Failed to fetch property details", error);
          setErrorMSG('Failed to load property details. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id, user]);

  const allMedia: { type: 'image' | 'video', url: string }[] = [];
  if (property?.imageUrls && property.imageUrls.length > 0) {
    allMedia.push(...property.imageUrls.map(url => ({ type: 'image' as const, url })));
  } else if (property?.imageUrl) {
    allMedia.push({ type: 'image', url: property.imageUrl });
  }
  if (property?.videoUrl) {
    allMedia.push({ type: 'video', url: property.videoUrl });
  }

  const activeMedia = allMedia[activeImageIndex] || allMedia[0];

  useEffect(() => {
    if (allMedia.length <= 1) return;
    if (activeMedia?.type === 'video') return; // Don't auto-slide away from a playing video automatically, unless we want to based on video length. Usually better to let user pause/slide manually from video.

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allMedia.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeImageIndex, allMedia.length, activeMedia?.type]);

useEffect(() => {
    if (user && showEnquiryModal) {
      getEnquiryLimit().then(setEnquiryLimit);
    }
  }, [user, showEnquiryModal]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="h-[400px] md:h-[500px] bg-slate-200 dark:bg-slate-700 w-full"></div>
        <div className="p-8 md:p-12">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (errorMSG) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 font-bold text-6xl mb-4 opacity-50">!</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{errorMSG}</p>
        <Link to="/listings" className="inline-block bg-[#4aa4f0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
          Browse Listings
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <div className="text-[#4aa4f0] font-bold text-6xl mb-4 opacity-50">?</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Property not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The property you're looking for might have been removed or the link is invalid.</p>
        <Link to="/listings" className="inline-block bg-[#4aa4f0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
          Browse Listings
        </Link>
      </div>
    );
  }



  const handleEnquire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !name || !phone) return;
    try {
      setIsSubmitting(true);
      setFormError('');
      
      const response = await submitPropertyEnquiry({
        propertyId: property.id,
        propertyTitle: property.propertyId ? `[${property.propertyId}] ${property.title}` : property.title,
        propertyLink: window.location.href,
        userName: name,
        userEmail: enquiryEmail,
        userPhone: phone,
        source: 'Platform',
      });
      
      if (response.success) {
        if (!response.message.includes('Already enquired')) {
            setProperty(prev => prev ? { ...prev, enquiryCount: (prev.enquiryCount || 0) + 1 } : prev);
        }
      }
      
      // Update limit
      getEnquiryLimit().then(setEnquiryLimit);
      
      setEnquired(true);
      setTimeout(() => {
        setShowEnquiryModal(false);
        setEnquired(false);
      }, 2000);
    } catch (error: any) {
      console.error("Enquiry failed:", error);
      setFormError(error.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to apply for this property.");
      navigate('/login');
      return;
    }
    if (!name || !phone) return;

    try {
      setIsSubmitting(true);
      setFormError('');
      await addApplication({
        id: `app_${Date.now()}`,
        propertyId: property.id,
        tenantName: name,
        tenantPhone: phone,
        status: 'pending',
        dateApplied: new Date().toISOString()
      });
      
      setApplied(true);
      setTimeout(() => {
        setShowModal(false);
        setApplied(false);
      }, 2000);
    } catch (error: any) {
      console.error("Application failed:", error);
      setFormError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to save properties to your wishlist.");
      navigate('/login');
      return;
    }
    await toggleWishlist(property.id);
    setLiked(!liked);
    if (!liked && property.id) {
       await incrementPropertyMetric(property.id, 'favorites');
    }
  };

  const handleWhatsAppClick = async () => {
    if (!property) return;
    
    // Store Lead in DB
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) {
         const token = await user.getIdToken();
         headers['Authorization'] = `Bearer ${token}`;
      }
      
      const { appCheck } = await import('../lib/firebase');
      if (appCheck) {
         const { getToken } = await import('firebase/app-check');
         try {
             const appCheckTokenResponse = await getToken(appCheck, false);
             if (appCheckTokenResponse.token) {
                headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
             }
         } catch (e) {
             console.warn("Could not get App Check token");
         }
      }

      await fetch('/api/track-whatsapp', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.propertyId ? `[${property.propertyId}] ${property.title}` : property.title,
          propertyLink: window.location.href,
          userId: user?.uid,
          userName: user?.displayName || user?.email || 'Anonymous Visitor',
          userEmail: user?.email || '',
          userPhone: phone
        })
      });
    } catch (error) {
      console.error("Failed to track WhatsApp lead:", error);
    }
    
    // Redirect to Admin WhatsApp
    const message = `Hello, I am interested in this property.

Property ID: ${property.propertyId || property.id}
Property: ${property.bhkType || `${property.bedrooms} BHK`} in ${property.location}
Property Link: ${window.location.href}

Please share more details.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const handleShare = async (platform: string) => {
    if (!property) return;
    const url = window.location.href;
    const text = `Check out this ${property.bhkType || `${property.bedrooms} BHK`} property in ${property.location} on TenantOwners!`;
    
    await incrementPropertyMetric(property.id, 'shares');
    setShowShareMenu(false);
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const isRentedOut = property?.listingType === 'rent' && property?.availabilityStatus === 'rented_out';
  
  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden dark:bg-slate-900 dark:border-slate-800 relative">
      {isRentedOut && (
        <div className="bg-red-600 dark:bg-red-900/80 text-white p-4 text-center">
          <h2 className="text-xl font-bold mb-1">This property has been rented out</h2>
          <p className="text-sm opacity-90">This listing is no longer available, but we may have similar flats in the same society, location or budget.</p>
        </div>
      )}

      {/* Header Image */}
      <div 
        className="relative"
        onTouchStart={allMedia.length > 1 ? onTouchStart : undefined}
        onTouchMove={allMedia.length > 1 ? onTouchMove : undefined}
        onTouchEnd={allMedia.length > 1 ? onTouchEndEvent : undefined}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative h-[400px] md:h-[500px]">
          {allMedia.map((media, index) => {
            if (media.type === 'video') {
              return (
                <div 
                  key={index}
                  className={`absolute inset-0 w-full h-full bg-black flex items-center justify-center group transition-opacity duration-500 ${activeImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                  {activeImageIndex === index && (
                    <video 
                      src={media.url || undefined} 
                      controls
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              );
            }
            return (
              <img 
                key={index}
                src={media.url ? optimizeCloudinaryUrl(media.url, 1200) : undefined} 
                alt={`${property.title} - ${index + 1}`} 
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-contain bg-slate-100 dark:bg-slate-800 transition-opacity duration-500 ${activeImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              />
            );
          })}
          
          <Link to="/listings" className="absolute top-6 left-6 bg-white dark:bg-slate-800/90 backdrop-blur p-2 rounded-full hover:bg-white dark:bg-slate-800 transition-colors shadow z-10">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </Link>
          <button 
            onClick={handleLike}
            className="absolute top-6 right-6 bg-white dark:bg-slate-800/90 backdrop-blur p-3 rounded-full hover:bg-white dark:bg-slate-800 transition-colors shadow flex items-center justify-center z-10"
          >
            <Heart className={`w-6 h-6 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-slate-400 dark:text-slate-500 hover:text-red-500"}`} />
          </button>

          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 hover:bg-white dark:bg-slate-800/90 backdrop-blur p-2 rounded-full shadow-md transition-colors z-10 hidden md:block"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-100" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % allMedia.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 hover:bg-white dark:bg-slate-800/90 backdrop-blur p-2 rounded-full shadow-md transition-colors z-10 hidden md:block"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-slate-800 dark:text-slate-100" />
              </button>
            </>
          )}
        </div>
        
        {allMedia.length > 1 && (
           <div className="flex gap-2 p-4 overflow-x-auto bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
             {allMedia.map((media, index) => (
               <button
                 key={index}
                 onClick={() => setActiveImageIndex(index)}
                 className={`relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                   activeImageIndex === index ? 'border-[#4aa4f0] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                 }`}
               >
                 {media.type === 'video' ? (
                   <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                     <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Video</span>
                   </div>
                 ) : (
                   <img src={media.url ? optimizeCloudinaryUrl(media.url, 200) : undefined} alt={`${property.title} - ${index + 1}`} loading="lazy" className="w-full h-full object-contain bg-slate-100 dark:bg-slate-800" />
                 )}
               </button>
             ))}
           </div>
        )}
      </div>

      <div className="p-8 md:p-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          
          {/* Main Info */}
          <div className="flex-1">
             {property.propertyId && (
               <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl w-fit">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Property ID:</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tracking-wider font-mono">{property.propertyId}</div>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(property.propertyId || '');
                        alert("Property ID Copied Successfully");
                    }}
                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#4aa4f0] rounded hover:border-[#4aa4f0] transition"
                    title="Copy Property ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
               </div>
             )}
             
             {property.listingType === 'buy' ? (
               <div className="inline-block bg-[#4aa4f0]/10 text-[#4aa4f0] px-3 py-1 rounded-full text-sm font-bold mb-4 border border-[#4aa4f0]/20">
                 {formatPrice(property.price)} {property.priceNegotiable && <span className="opacity-80 font-medium">(Negotiable)</span>}
               </div>
             ) : (
               <div className="inline-block bg-[#4aa4f0]/10 text-[#4aa4f0] px-3 py-1 rounded-full text-sm font-bold mb-4 border border-[#4aa4f0]/20">
                 ₹{property.price} / month {(!property.maintenance_type || property.maintenance_type === 'Included in Rent') ? '(Maintenance Included)' : '(Excluding Maintenance)'}
               </div>
             )}
             <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">{property.title}</h1>
             <div className="flex items-center text-slate-600 dark:text-slate-300 mb-8 text-lg gap-2">
                <MapPin className="w-5 h-5 text-[#8cc63f]" />
                {property.location}
             </div>

             <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2"><div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full"><Bed className="w-5 h-5 text-slate-700 dark:text-slate-200" /></div><span className="font-medium text-lg">{property.bhkType || property.bedrooms}</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{property.bhkType ? '' : 'Beds'}</span></div>
                <div className="flex items-center gap-2"><div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full"><Bath className="w-5 h-5 text-slate-700 dark:text-slate-200" /></div><span className="font-medium text-lg">{property.bathrooms}</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Baths</span></div>
                <div className="flex items-center gap-2"><div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full"><Square className="w-5 h-5 text-slate-700 dark:text-slate-200" /></div><span className="font-medium text-lg">{property.sqft}</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Sq. Ft.</span></div>
             </div>

             <div className="mt-8">
               <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">About this property</h2>
               <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-light">{property.description}</p>
             </div>             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {property.listingType === 'buy' ? (
                 <>
                   {property.isRegistered !== undefined && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Registered</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.isRegistered ? 'Yes' : 'No'}</div>
                     </div>
                   )}
                   {property.superArea && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Super Area</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.superArea} sqft</div>
                     </div>
                   )}
                   {property.carpetArea && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Carpet Area</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.carpetArea} sqft</div>
                     </div>
                   )}
                   {property.facing && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Facing</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.facing}</div>
                     </div>
                   )}
                   {property.constructionStatus && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Construction Status</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.constructionStatus}</div>
                     </div>
                   )}
                   {property.constructionQuality && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Construction Quality</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.constructionQuality}</div>
                     </div>
                   )}
                   {property.parking && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Parking</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.parking}</div>
                     </div>
                   )}
                   {property.balcony !== undefined && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Balcony</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.balcony}</div>
                     </div>
                   )}
                   {property.locationAdvantage && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl sm:col-span-2">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Location Advantage</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.locationAdvantage}</div>
                     </div>
                   )}
                 </>
               ) : (
                 <>
                   {property.furnishingStatus && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Furnishing</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.furnishingStatus}</div>
                     </div>
                   )}
                   {(property.tenant_preference || (property.allowedTenants && property.allowedTenants.length > 0)) && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Allowed Tenants</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.tenant_preference || property.allowedTenants?.join(', ') || 'All'}</div>
                     </div>
                   )}
                   {property.available_from && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Available From</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{property.available_from}</div>
                     </div>
                   )}
                   {property.maintenance_type && (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                       <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Maintenance Status</h3>
                       <div className="font-bold text-slate-900 dark:text-white">{(!property.maintenance_type || property.maintenance_type === 'Included in Rent') ? 'Rent includes maintenance (all inclusive)' : 'Excluding Maintenance'}</div>
                     </div>
                   )}
                 </>
               )}
             </div>

             <div className="mt-10">
               <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Amenities</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {property.amenities.map(amenity => (
                   <div key={amenity} className="flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-xl font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#4aa4f0]"></div>
                      {amenity}
                   </div>
                 ))}
               </div>
             </div>

             {property.googleMapsUrl && (
               <div className="mt-10">
                 <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Property Location</h2>
                 <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400 mt-1 shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">See Exact Location</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
                          Check directions, commute times, and nearby places like schools, hospitals, malls, and metro stations on Google Maps.
                        </p>
                      </div>
                    </div>
                    <a
                      href={property.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#4aa4f0] text-white font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-colors shadow-sm"
                    >
                      Open in Google Maps
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                 </div>
               </div>
             )}
          </div>

          {/* Action Card */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col justify-center gap-3 shadow-sm lg:sticky lg:top-28 shrink-0">
             <div className="text-center mb-2">
               <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                 {(() => {
                   const c = property.enquiryCount || 0;
                   if (c === 0) return "Be the first to enquire about this property";
                   if (c === 1) return "1 person enquired about this property";
                   return `${c} people enquired about this property`;
                 })()}
               </p>
             </div>
             <button
               onClick={() => setShowEnquiryModal(true)}
               className="w-full bg-[#4aa4f0] text-white font-bold flex items-center justify-center py-3 rounded-xl hover:bg-opacity-90 transition-colors shadow"
             >
               Enquire Now
             </button>
             
             <button
               onClick={() => setShowModal(true)}
               className="w-full bg-slate-800 text-white font-bold flex items-center justify-center py-3 rounded-xl hover:bg-slate-700 transition-colors shadow"
             >
               Apply for Property
             </button>

             <button
               onClick={handleWhatsAppClick}
               className="w-full bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-opacity-90 transition-colors mb-2 shadow"
             >
               <MessageCircle className="w-5 h-5" /> Contact on WhatsApp
             </button>

                              <a
                   href={`tel:${WHATSAPP_DISPLAY_NUMBER}`}
                   className="w-full bg-slate-800 text-white font-bold flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-slate-700 transition-colors shadow"
                 >
                   <Phone className="w-4 h-4" /> Call Now
                 </a>

             <div className="relative">
               <button
                 onClick={() => setShowShareMenu(!showShareMenu)}
                 className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
               >
                 <Share2 className="w-4 h-4" /> Share Property
               </button>
               {showShareMenu && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-10 overflow-hidden flex flex-col">
                    <button onClick={() => handleShare('copy')} className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-50"><LinkIcon className="w-4 h-4" /> Copy Link</button>
                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold text-[#25D366] border-b border-slate-50"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
                    <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold text-[#1877F2]"><Facebook className="w-4 h-4" /> Facebook</button>
                 </div>
               )}
             </div>
             
             <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center mb-1 mt-2">Owner managed via TenantOwners</p>
          </div>

        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
            {enquired ? (
               <div className="text-center py-8">
                 <CheckCircle2 className="w-16 h-16 text-[#8cc63f] mx-auto mb-4" />
                 <h2 className="text-2xl font-bold mb-2">Enquiry Submitted!</h2>
                 <p className="text-slate-500 dark:text-slate-400">The owner will contact you soon.</p>
               </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Enquire about {property.title}</h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleEnquire} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none"
                      value={name} onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                    <input
                      type="email" required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none"
                      value={enquiryEmail} onChange={e => setEnquiryEmail(e.target.value)}
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
                    <input
                      type="tel" required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none"
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowEnquiryModal(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="flex-1 flex justify-center items-center py-3 bg-[#4aa4f0] text-white font-bold rounded-xl hover:bg-opacity-90 shadow border border-transparent transition disabled:opacity-75 disabled:cursor-not-allowed">
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'Submit Enquiry'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
            {applied ? (
               <div className="text-center py-8">
                 <CheckCircle2 className="w-16 h-16 text-[#8cc63f] mx-auto mb-4" />
                 <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                 <p className="text-slate-500 dark:text-slate-400">The owner will contact you soon.</p>
               </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Apply for {property.title}</h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none"
                      value={name} onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
                    <input
                      type="tel" required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none"
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="flex-1 flex justify-center items-center py-3 bg-[#4aa4f0] text-white font-bold rounded-xl hover:bg-opacity-90 shadow border border-transparent transition disabled:opacity-75 disabled:cursor-not-allowed">
                      {isSubmitting ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                           Submitting...
                         </>
                       ) : (
                         'Submit'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}


      {isRentedOut && similarProperties.length > 0 && (
        <div id="similar-flats" className="p-8 md:p-12 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Similar Available Flats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map(p => (
              <Link key={p.id} to={`/property/${p.id}`} className="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition">
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 relative">
                  <img src={p.imageUrls?.[0] || p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-[#4aa4f0]">
                    ₹{p.price}/mo
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{p.society || p.location}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2">{p.bedrooms} BHK • {p.furnishingStatus || 'Furnished'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
