import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PreferenceContextType {
  preference: string | null;
  setPreference: (type: string) => void;
  hasStoredPreference: boolean;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [storedPref, setStoredPref] = useState<string | null>(() => {
    return localStorage.getItem('property_preference') || null;
  });

  const setPreference = (type: string) => {
    localStorage.setItem('property_preference', type);
    setStoredPref(type);
    
    // Update URL param if it exists so it doesn't get out of sync
    if (typeParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('type', type);
      setSearchParams(newParams);
    }
  };

  const activePreference = typeParam || storedPref || 'rent'; // default to rent so it never flashes

  return (
    <PreferenceContext.Provider value={{ 
      preference: activePreference, 
      setPreference, 
      hasStoredPreference: !!storedPref || !!typeParam
    }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export function usePreference() {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error('usePreference must be used within a PreferenceProvider');
  }
  return context;
}
