import React, { useState } from 'react';
import { addInquiry } from '../lib/store';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackMetaEvent } from '../lib/metaPixel';

export function CustomInquiry() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bhk: '',
    tenantPreference: '',
    furnishingStatus: '',
    shiftingDate: '',
    budget: '',
    requirements: '',
    propertyId: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMSG('');
    try {
      await addInquiry({
        id: `inq_${Date.now()}`,
        ...formData,
        status: 'pending',
        dateSubmitted: new Date().toISOString()
      });
      trackMetaEvent('Lead', {
        content_category: 'Custom property requirement',
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error("Failed to submit inquiry", error);
      setErrorMSG('Failed to submit request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
        <CheckCircle2 className="w-20 h-20 text-[#8cc63f] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Request Received!</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-light mb-8">
          Thank you for sharing your requirements. Our team will review them and reach out with tailored off-market properties.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#4aa4f0] text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
           Return Home <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Requirement Request</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-xl mx-auto">
          Can't find what you're looking for? Tell us your specific needs, and we'll tap into our network to find your perfect home.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-700">
        {errorMSG && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-medium">
            {errorMSG}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Phone Number</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location Preference</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Select Location</option>
                <option value="Gaur City 1">Gaur City 1</option>
                <option value="Gaur City 2">Gaur City 2</option>
                <option value="Techzone 4">Techzone 4</option>
                <option value="Noida Extension">Noida Extension</option>
                <option value="Central Noida">Central Noida</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">BHK Type</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.bhk}
                onChange={e => setFormData({...formData, bhk: e.target.value})}
              >
                <option value="">Any BHK</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="2 BHK + Study">2 BHK + Study</option>
                <option value="3 BHK + 2T">3 BHK + 2T</option>
                <option value="3 BHK + 3T">3 BHK + 3T</option>
                <option value="3 BHK + 3T + Servant">3 BHK + 3T + Servant</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5+ BHK">5+ BHK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tenant Profile</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.tenantPreference}
                onChange={e => setFormData({...formData, tenantPreference: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Family">Family</option>
                <option value="Male Bachelor">Male Bachelor</option>
                <option value="Female Bachelor">Female Bachelor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Furnishing Status</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.furnishingStatus}
                onChange={e => setFormData({...formData, furnishingStatus: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Raw-Flat">Raw-Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Maximum Budget (₹)</label>
              <input
                required
                type="number"
                placeholder="e.g. 25000"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Shifting Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.shiftingDate}
                onChange={e => setFormData({...formData, shiftingDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Specific Property ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. GC1-0001"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition"
                value={formData.propertyId}
                onChange={e => setFormData({...formData, propertyId: e.target.value})}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Specific Requirements & Amenities</label>
             <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Any additional preferences, amenities, pet policies, etc.</p>
             <textarea
               rows={4}
               className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition resize-none"
               value={formData.requirements}
               onChange={e => setFormData({...formData, requirements: e.target.value})}
             ></textarea>
          </div>

          <div className="pt-4">
             <button disabled={isSubmitting} type="submit" className="flex justify-center items-center gap-2 w-full py-4 bg-[#4aa4f0] text-white font-bold text-lg rounded-xl shadow hover:bg-opacity-90 transition-all outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-75 disabled:cursor-not-allowed">
               {isSubmitting ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Submitting...
                 </>
               ) : (
                 'Submit Request'
               )}
             </button>
             <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">Safe, secure, and confidential. We never share your data.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
