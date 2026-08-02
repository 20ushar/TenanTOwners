import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Home as HomeIcon, Shield, Repeat } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { isAdminEmail } from '../lib/admin';

export function Home() {
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <div className="space-y-6">
      {/* Offer Banner */}
      <section className="relative w-full rounded-3xl bg-[#0F172A] overflow-hidden shadow-xl p-6 md:px-10 md:py-8 mb-6 border border-[#F59E0B]/20 transition-all duration-300 hover:shadow-2xl hover:border-[#F59E0B]/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] opacity-[0.15] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4aa4f0] opacity-[0.1] rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 relative z-10 w-full hover:scale-[1.02] transition-transform duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold tracking-widest uppercase border border-[#F59E0B]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
            </span>
            Limited Period Offer
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <span className="inline-block text-2xl md:text-3xl mb-1 md:mb-0">🎉</span>
            <span>Pay Only 15 Days Brokerage <span className="text-[#F59E0B]">Instead of 20 Days!</span></span>
          </h2>
          
          <p className="text-slate-300 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
            Save 25% on Brokerage Charges. Find your perfect rental home while paying less than the usual brokerage fee.
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative text-center w-full min-h-[70vh] flex items-center justify-center rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden shadow-sm py-20 px-4">
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <svg className="w-24 h-24 md:w-32 md:h-32 text-[#4aa4f0] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter">
              <polygon points="12,3 3,21 21,21" />
            </svg>
            <h1 className="text-4xl md:text-6xl tracking-tight text-[#4aa4f0] font-normal">
              Tenan<span className="text-[#8cc63f]">TO</span>wners
              <span className="sr-only">Tenant Owners</span>
            </h1>
          </div>
          
          <h2 className="text-xl md:text-3xl font-medium tracking-normal text-slate-900 dark:text-white mb-2">
            _The new era of Rentworld_
          </h2>
          <p className="text-lg md:text-2xl font-medium text-slate-900 dark:text-white tracking-wide mb-12">
            &bull; Trust &bull; Live &bull; Repeat
          </p>

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 w-full max-w-[280px] sm:max-w-none">
            <Link
              to="/listings"
              className="w-full sm:w-auto justify-center rounded-xl bg-[#4aa4f0] px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Listings
            </Link>
            {!isAdmin && (
              <Link
                to="/custom-inquiry"
                className="w-full sm:w-auto justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-300 px-8 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                Requirement Request <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Trust</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Verified listings and secure application tracking directly with owners.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
             <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Live</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Find spaces that truly feel like home, complete with amenities and authentic, detailed photos.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
             <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Repeat className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Repeat</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">A relationship-first approach to renting that makes you want to stay long term.</p>
          </div>
        </div>
      </section>
      
      {!isAdmin && (
       <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between text-left gap-6">
         <div className="flex-1">
           <h4 className="text-indigo-900 font-bold mb-2 text-2xl">Can't find exactly what you're looking for?</h4>
           <p className="text-indigo-700 mb-6 max-w-xl text-sm">
             Submit your specific requirements, and we'll scout our exclusive unlisted inventory to find your perfect match.
           </p>
            <Link
              to="/custom-inquiry"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold inline-block"
            >
              Requirement Request
            </Link>
         </div>
         <div className="w-32 h-32 bg-indigo-200/50 rounded-3xl flex items-center justify-center shrink-0">
           <Search className="w-12 h-12 text-indigo-600" />
         </div>
       </section>
      )}
    </div>
  );
}
