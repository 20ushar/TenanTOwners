import React, { useState, useEffect } from 'react';
import { getWishlist, getProperties, toggleWishlist } from '../lib/store';
import { Property } from '../types';
import { Heart, MapPin, Bed, Bath, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageSlider } from '../components/ImageSlider';
import { usePreference } from '../lib/PreferenceContext';
import { formatPrice } from '../lib/utils';

export function Wishlist() {
  const [wishlistProps, setWishlistProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { preference } = usePreference();

  useEffect(() => {
    loadWishlist();
  }, [preference]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const [list, props] = await Promise.all([
        getWishlist(),
        getProperties({ listingType: preference || 'rent' })
      ]);
      
      const filtered = props.filter(p => list.includes(p.id));
      filtered.sort((a, b) => {
        if (a.listingType === 'rent' && b.listingType === 'rent') {
          const priorityA = a.availabilityStatus === 'rented_out' ? 1 : 0;
          const priorityB = b.availabilityStatus === 'rented_out' ? 1 : 0;
          return priorityA - priorityB;
        }
        return 0;
      });
      setWishlistProps(filtered);

    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    await toggleWishlist(id);
    await loadWishlist();
  };

  if (loading) {
     return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4aa4f0] mx-auto"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center sm:text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
          <Heart className="w-8 h-8 text-[#4aa4f0] fill-[#4aa4f0]" /> 
          Your Wishlist
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Saved properties you are interested in.</p>
      </div>

      {wishlistProps.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
           <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your wishlist is empty</h3>
           <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm mb-6">Explore our listings to find your dream property.</p>
           <Link to="/listings" className="inline-flex items-center gap-2 bg-[#4aa4f0] text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-opacity-90 transition-all">
             Browse Listings <ArrowRight className="w-5 h-5" />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProps.map((property) => {
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
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800/90 backdrop-blur rounded-lg px-2 py-1 text-xs font-bold text-[#4aa4f0] z-10 pointer-events-none">
                   {property.listingType === 'buy' ? formatPrice(property.price) : `₹${property.price}/mo`}
                </div>
                <button 
                  onClick={(e) => handleRemove(e, property.id)}
                  className="absolute top-4 left-4 p-2 bg-white dark:bg-slate-800/90 backdrop-blur rounded-full text-[#4aa4f0] hover:bg-white dark:bg-slate-800 hover:text-red-500 transition-colors shadow-sm z-10"
                  title="Remove from Wishlist"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <h3 className="absolute bottom-4 left-4 right-4 z-10 text-white font-bold text-lg leading-tight pointer-events-none">{property.title}</h3>
              </Link>
              <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-800">
                <div className="flex items-center text-slate-500 dark:text-slate-400 mb-3 text-xs gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#8cc63f]" />
                  {property.location}
                </div>
                
                <div className="flex gap-3 mb-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold"><Bed className="w-4 h-4" /> {property.bedrooms} Beds</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold"><Bath className="w-4 h-4" /> {property.bathrooms} Baths</span>
                </div>
                
                <div className="mb-3 mt-auto text-center bg-slate-50 dark:bg-slate-900 rounded-xl py-2 px-3 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {(() => {
                      const c = property.enquiryCount || 0;
                      if (c === 0) return "Be the first to enquire about this property";
                      if (c === 1) return "1 person enquired about this property";
                      return `${c} people enquired about this property`;
                    })()}
                  </p>
                </div>

                <Link to={`/property/${property.id}`} className="w-full py-2.5 bg-[#4aa4f0] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 inline-flex justify-center">View Details</Link>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
