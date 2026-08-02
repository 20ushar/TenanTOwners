import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function usePreference() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [preference, setPreferenceState] = useState<string | null>(() => {
    return localStorage.getItem('property_preference') || null;
  });

  const activePreference = typeParam || preference;

  const setPreference = (type: string) => {
    localStorage.setItem('property_preference', type);
    setPreferenceState(type);
    
    // Update URL param if it exists so it doesn't get out of sync
    if (typeParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('type', type);
      setSearchParams(newParams);
    }
  };

  return { preference: activePreference, setPreference, hasStoredPreference: !!preference };
}
