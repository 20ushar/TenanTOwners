import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        void supabase.from('user_profiles').upsert({
            firebase_uid: user.uid,
            email: user.email,
            display_name: user.displayName,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'firebase_uid' })
          .then(({ error }) => {
            if (error) console.error('Failed to sync user profile:', error);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      // Auto logout after 30 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        if (auth.currentUser) {
          firebaseSignOut(auth);
        }
      }, 30 * 60 * 1000);
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
      resetTimer();
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    if (userCredential.user) {
      const { error } = await supabase.from('user_profiles').upsert({
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        display_name: userCredential.user.displayName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'firebase_uid' });
      if (error) throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      
      const { error } = await supabase.from('user_profiles').upsert({
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        display_name: name,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'firebase_uid' });
      if (error) throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
