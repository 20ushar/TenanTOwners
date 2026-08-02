import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-[#4aa4f0] font-bold text-9xl mb-4 opacity-20">404</div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8">
        The page you are looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 bg-[#4aa4f0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
        <Link 
          to="/listings"
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Search className="w-5 h-5" />
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
