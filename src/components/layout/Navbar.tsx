import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, Settings, Phone, LogIn, FileText, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { isAdminEmail } from '../../lib/admin';

export function Navbar() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const isAdmin = isAdminEmail(user?.email);

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Browse Listings', path: '/listings', icon: Search },
  ];

  if (user && !isAdmin) {
    links.push({ name: 'Wishlist', path: '/wishlist', icon: Heart });
    links.push({ name: 'My Requests', path: '/my-requests', icon: FileText });
  }

  const showOwnerPortal = !loading && Boolean(user) && isAdmin;
  
  if (showOwnerPortal) {
    links.push({ name: 'Owner Portal', path: '/704STK', icon: Settings });
  }

  return (
    <nav className="bg-slate-50 dark:bg-slate-900 transition-colors duration-200 sticky top-0 z-50 py-4 shadow-sm md:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#4aa4f0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter">
                  <polygon points="12,3 3,21 21,21" />
                </svg>
              </div>
              <div className="leading-none">
                <span className="text-xl md:text-2xl tracking-tight text-[#4aa4f0] font-normal">
                  Tenan<span className="text-[#8cc63f]">TO</span>wners
                </span>
              </div>
            </Link>
          </div>
          <div className="hidden lg:flex space-x-8">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || 
                (link.path !== '/' && location.pathname.startsWith(link.path));
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "inline-flex items-center pb-1 text-sm font-semibold transition-colors duration-200 border-b-2 gap-2",
                    isActive
                      ? "border-[#4aa4f0] text-[#4aa4f0]"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => setIsDark(!isDark)}
               className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#4aa4f0] transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
               aria-label="Toggle dark mode"
             >
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             
             {!user && (
               <Link
                 to="/login"
                 className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#4aa4f0] transition-colors"
               >
                 <LogIn className="w-4 h-4" />
                 Sign In
               </Link>
             )}
             
             <Link
               to="/custom-inquiry"
               className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-full hover:bg-slate-800 transition-colors shadow-sm"
             >
               <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
               <span>Requirement Request</span>
             </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 flex justify-around items-center p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.1)]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || 
            (link.path !== '/' && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex flex-col items-center justify-center w-full py-1",
                isActive ? "text-[#4aa4f0]" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110 stroke-[2.5px]")} />
              <span className="text-[10px] sm:text-xs font-bold text-center leading-none">{link.name.replace(' Listing', '')}</span>
            </Link>
          );
        })}
        
        {!user && (
          <Link
            to="/login"
            className="flex flex-col items-center justify-center w-full py-1 text-slate-500 dark:text-slate-400"
          >
            <LogIn className="w-5 h-5 mb-1" />
            <span className="text-[10px] sm:text-xs font-bold text-center leading-none">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
