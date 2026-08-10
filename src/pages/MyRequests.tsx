import React, { useState, useEffect } from 'react';
import { getMyInquiries, getApplications, getMyPropertyEnquiries, deleteInquiry } from '../lib/store';
import { Inquiry, Application, PropertyEnquiry } from '../types';
import { useAuth } from '../lib/AuthContext';
import { FileText, Home, MessageSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyRequests() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [propertyEnquiries, setPropertyEnquiries] = useState<PropertyEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [inqs, apps, enquiries] = await Promise.all([
        getMyInquiries(),
        getApplications(),
        getMyPropertyEnquiries(),
      ]);
      setInquiries(inqs.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()));
      setApplications(apps.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()));
      setPropertyEnquiries(enquiries);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInquiry = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await deleteInquiry(id);
      setInquiries(inquiries.filter(i => i.id !== id));
    } catch (error) {
      console.error("Failed to delete inquiry", error);
      alert("Failed to delete inquiry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-8">
           <div>
             <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-40 animate-pulse"></div>
                ))}
             </div>
           </div>
           <div>
             <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-32 animate-pulse"></div>
                ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Track your property enquiries, applications, and requirement requests.</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <MessageSquare className="w-6 h-6 text-[#4aa4f0]" />
            <h2 className="text-2xl font-bold">My Enquiries</h2>
          </div>

          {propertyEnquiries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't enquired about any properties yet.</p>
              <Link to="/listings" className="inline-flex items-center justify-center rounded-xl bg-[#4aa4f0] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-opacity-90 transition-all">Browse Listings</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {propertyEnquiries.map((enquiry) => (
                <div key={`${enquiry.propertyId}-${enquiry.createdAt}`} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{enquiry.property?.title || `Property ${enquiry.propertyId}`}</h3>
                      {enquiry.property?.location && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{enquiry.property.location}</p>}
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">Submitted on {new Date(enquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#4aa4f0]/20 text-[#4aa4f0]">Submitted</span>
                  </div>
                  <Link to={`/property/${enquiry.propertyId}`} className="text-sm text-[#4aa4f0] font-bold hover:underline">View Property Details</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <FileText className="w-6 h-6 text-[#8cc63f]" />
            <h2 className="text-2xl font-bold">Requirement Requests</h2>
          </div>
          
          {inquiries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't submitted any requirement requests yet.</p>
              <Link to="/custom-inquiry" className="inline-flex items-center justify-center rounded-xl bg-[#4aa4f0] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-opacity-90 transition-all">Submit a Request</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{inq.location || 'Any location'} • {inq.bhk ? `${inq.bhk} BHK` : 'Any BHK'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Submitted on {new Date(inq.dateSubmitted).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      inq.status === 'confirmed' ? 'bg-[#8cc63f]/20 text-[#8cc63f]' : 
                      inq.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                      'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {inq.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-2 relative z-10">
                    <div><span className="text-slate-400 dark:text-slate-500 font-medium block text-[10px] uppercase tracking-wider">Budget</span><span className="font-bold text-slate-700 dark:text-slate-200">₹{inq.budget || 'N/A'}</span></div>
                    <div><span className="text-slate-400 dark:text-slate-500 font-medium block text-[10px] uppercase tracking-wider">Shifting Date</span><span className="font-bold text-slate-700 dark:text-slate-200">{inq.shiftingDate ? new Date(inq.shiftingDate).toLocaleDateString() : 'Flexible'}</span></div>
                    <div><span className="text-slate-400 dark:text-slate-500 font-medium block text-[10px] uppercase tracking-wider">Furnishing</span><span className="font-bold text-slate-700 dark:text-slate-200">{inq.furnishingStatus || 'Any'}</span></div>
                    <div><span className="text-slate-400 dark:text-slate-500 font-medium block text-[10px] uppercase tracking-wider">Tenant</span><span className="font-bold text-slate-700 dark:text-slate-200">{inq.tenantPreference || 'Any'}</span></div>
                  </div>
                  {inq.requirements && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-1 relative z-10">
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">"{inq.requirements}"</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => inq.id && handleDeleteInquiry(inq.id, e)}
                    className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition text-sm font-bold relative z-10"
                  >
                    <Trash2 className="w-4 h-4" /> Cancel Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <Home className="w-6 h-6 text-[#4aa4f0]" />
            <h2 className="text-2xl font-bold">Property Applications</h2>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't applied to any properties yet.</p>
              <Link to="/listings" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-800 transition-all">Browse Listings</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Property ID: {app.propertyId}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Applied on {new Date(app.dateApplied).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      app.status === 'approved' ? 'bg-[#8cc63f]/20 text-[#8cc63f]' : 
                      app.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                      app.status === 'reviewing' ? 'bg-[#4aa4f0]/20 text-[#4aa4f0]' :
                      'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <Link to={`/property/${app.propertyId}`} className="text-sm text-[#4aa4f0] font-bold hover:underline">View Property Details</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
