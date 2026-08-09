import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../../lib/AuthContext';
import { PreferenceModal } from '../PreferenceModal';

export function Layout() {
  const { user, signOut } = useAuth();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
      setIsSignOutModalOpen(false);
    }
  };

  const cancelSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSignOutModalOpen && !isSigningOut) {
        cancelSignOut();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSignOutModalOpen, isSigningOut]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col dark:bg-slate-900 dark:text-white transition-colors duration-200">
      {isSignOutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign out?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[90px]"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PreferenceModal />
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <Outlet />
      </main>
      <footer className="py-12 pb-28 lg:pb-12 mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex flex-col items-start min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-[#4aa4f0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter">
                    <polygon points="12,3 3,21 21,21" />
                  </svg>
                  <div className="text-xl tracking-tight text-[#4aa4f0] font-normal">
                    Tenan<span className="text-[#8cc63f]">TO</span>wners
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">_The new era of Rentworld_</p>
                <p className="font-semibold mt-1 tracking-widest text-slate-400 dark:text-slate-500 text-[10px] uppercase">TRUST &bull; LIVE &bull; REPEAT</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-widest">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/about" className="hover:text-[#4aa4f0] transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/contact" className="hover:text-[#4aa4f0] transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-[#4aa4f0] transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-[#4aa4f0] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/faq" className="hover:text-[#4aa4f0] transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-widest">Connect</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a href="https://www.instagram.com/tenantowner?igsh=MXBycjNheGs3bGRh" target="_blank" rel="noopener noreferrer" className="hover:text-[#4aa4f0] transition-colors">Instagram</a></li>
                <li><a href="https://www.facebook.com/realepropmart" target="_blank" rel="noopener noreferrer" className="hover:text-[#4aa4f0] transition-colors">Facebook</a></li>
              </ul>
            </div>
            {user && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-widest">Account</h4>
                <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest mb-1 text-slate-400 dark:text-slate-500">Logged in as</p>
                    {user.displayName && <p className="font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>}
                    <p className="truncate">{user.email}</p>
                  </div>
                  <button onClick={() => setIsSignOutModalOpen(true)} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors duration-200 cursor-pointer text-left">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">&copy; {new Date().getFullYear()} TenanTOwners. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
