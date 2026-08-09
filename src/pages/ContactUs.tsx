import { WHATSAPP_DISPLAY_NUMBER } from '../lib/constants';
import React from 'react';
import { Mail, Phone } from 'lucide-react';

export function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Contact Us</h1>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
          Have questions or need assistance? Reach out to us through any of the channels below, and we'll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="mailto:tenantownerofficial@gmail.com" className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#4aa4f0] transition-colors group">
            <div className="w-14 h-14 bg-[#4aa4f0]/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#4aa4f0] group-hover:text-white transition-colors text-[#4aa4f0]">
               <Mail className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Email Us</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium break-all">tenantownerofficial@gmail.com</p>
            </div>
          </a>

                    <a href={`tel:${WHATSAPP_DISPLAY_NUMBER}`} className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#8cc63f] transition-colors group">
            <div className="w-14 h-14 bg-[#8cc63f]/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#8cc63f] group-hover:text-white transition-colors text-[#8cc63f]">
               <Phone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Call Us</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{WHATSAPP_DISPLAY_NUMBER}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
