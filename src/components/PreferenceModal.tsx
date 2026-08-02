import React from 'react';
import { usePreference } from '../lib/PreferenceContext';
import { Building2, Home } from 'lucide-react';

export function PreferenceModal() {
  const { hasStoredPreference, setPreference } = usePreference();

  if (hasStoredPreference) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div 
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-8 text-center">
          <h2 id="modal-title" className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            What are you looking for?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Choose your preferred property type to personalize your experience.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPreference('rent')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#4aa4f0] hover:bg-[#4aa4f0]/5 dark:hover:bg-[#4aa4f0]/10 transition-all group focus:outline-none focus:ring-2 focus:ring-[#4aa4f0] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#4aa4f0]/20 transition-colors">
                <Home className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-[#4aa4f0] transition-colors" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Rent</span>
            </button>

            <button
              onClick={() => setPreference('buy')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#8cc63f] hover:bg-[#8cc63f]/5 dark:hover:bg-[#8cc63f]/10 transition-all group focus:outline-none focus:ring-2 focus:ring-[#8cc63f] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#8cc63f]/20 transition-colors">
                <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-[#8cc63f] transition-colors" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
