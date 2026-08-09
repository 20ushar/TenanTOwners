import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2 } from 'lucide-react';

export function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About TenanTOwners | Rental and Resale Properties</title>
        <meta name="description" content="Learn about TenanTOwners, our mission, vision and approach to simplifying rental and resale property discovery." />
        <link rel="canonical" href="https://tenantowners.com/about" />
        <meta property="og:title" content="About TenanTOwners | Rental and Resale Properties" />
        <meta property="og:description" content="Learn about TenanTOwners, our mission, vision and approach to simplifying rental and resale property discovery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tenantowners.com/about" />
      </Helmet>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">About Us</h1>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners is a real-estate platform created to make renting and buying property simpler, faster, and more transparent.
          </p>
          <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            We help people discover suitable rental and resale properties, compare available options, view important property details, request visits, and connect with our team for further assistance.
          </p>
          <p className="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            Our goal is to reduce the confusion and unnecessary delays commonly involved in property searching by providing a clear, convenient, and user-friendly experience.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
          <p className="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            To simplify property discovery by connecting tenants and buyers with suitable real-estate opportunities through technology, accurate information, and responsive assistance.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h2>
          <p className="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            To build a trusted and accessible real-estate platform where people can search, compare, and explore properties with greater clarity and confidence.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What We Do</h2>
          <ul className="space-y-4 mb-8">
            {[
              "List rental and resale properties",
              "Provide useful property details and filters",
              "Help users request and schedule property visits",
              "Assist tenants and buyers during the property-search process",
              "Connect interested users with property owners and representatives"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-[#8cc63f] mr-3 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-lg">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Founders</h2>
          <p className="mb-8 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            TenanTOwners was founded by Tushar and Sudhanshu with the aim of creating a practical, technology-driven platform that makes real-estate discovery more organised and accessible.
          </p>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xl font-medium text-[#4aa4f0]">
              TenanTOwners — Discover Properties. Connect Smarter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
