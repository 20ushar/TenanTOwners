import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, MailCheck, ArrowLeft } from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000;
const MAX_SIGNUP_ATTEMPTS = 3;
const SIGNUP_LOCKOUT_DURATION = 15 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 3;
const RESET_LOCKOUT_DURATION = 30 * 60 * 1000;

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'signin' | 'signup' | 'forgot_password' | 'forgot_password_success'>('signin');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const location = useLocation();

  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const getRateLimit = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"attempts": 0, "lockUntil": 0, "history": []}');
    } catch {
      return { attempts: 0, lockUntil: 0, history: [] };
    }
  };

  const setRateLimit = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (pwd.length > 64) return "Password must be no more than 64 characters long.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    if (!/[^a-zA-Z0-9]/.test(pwd)) return "Password must contain at least one special character.";
    if (/^\s|\s$/.test(pwd)) return "Password cannot start or end with a space.";
    return null;
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return '';
    let score = 0;
    if (pwd.length > 7) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score < 2) return 'Weak';
    if (score === 2 || score === 3) return 'Medium';
    if (score >= 4) return 'Strong';
    return '';
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('This preview domain is not authorized. Please add this app URL to your Firebase Console under Authentication > Settings > Authorized domains.');
      } else {
        setError('An error occurred during Google sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const now = Date.now();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      if (view === 'signup') {
        const rl = getRateLimit('signup_rl');
        // Clean up old history
        rl.history = rl.history.filter((time: number) => now - time < SIGNUP_LOCKOUT_DURATION);
        
        if (rl.history.length >= MAX_SIGNUP_ATTEMPTS) {
          throw new Error('Too many account creation attempts. Please try again later.');
        }

        const pwdError = validatePassword(password);
        if (pwdError) throw new Error(pwdError);
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!cleanName) {
          throw new Error('Full Name is required.');
        }
        if (cleanName.length > 100) {
          throw new Error('Name is too long.');
        }

        await signUpWithEmail(cleanEmail, password, cleanName);
        
        rl.history.push(now);
        setRateLimit('signup_rl', rl);
        
      } else if (view === 'signin') {
        const rl = getRateLimit('login_rl');
        if (now < rl.lockUntil) {
          const remainingMinutes = Math.ceil((rl.lockUntil - now) / 60000);
          throw new Error(`Too many failed login attempts. Please try again in ${remainingMinutes} minutes or reset your password.`);
        }

        try {
          await signInWithEmail(cleanEmail, password);
          // Reset on success
          setRateLimit('login_rl', { attempts: 0, lockUntil: 0, history: [] });
        } catch (err: any) {
          rl.attempts += 1;
          if (rl.attempts >= MAX_LOGIN_ATTEMPTS) {
            rl.lockUntil = now + LOGIN_LOCKOUT_DURATION;
            rl.attempts = 0;
          }
          setRateLimit('login_rl', rl);
          
          if (err?.code === 'auth/operation-not-allowed') {
            throw new Error('Email/Password authentication is not enabled in the Firebase Console.');
          }
          
          throw new Error('Invalid email or password.');
        }
        
      } else if (view === 'forgot_password') {
        if (!cleanEmail) {
          throw new Error('Please enter your email address.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        const rl = getRateLimit('reset_rl_' + cleanEmail);
        rl.history = rl.history.filter((time: number) => now - time < RESET_LOCKOUT_DURATION);
        
        if (rl.history.length >= MAX_RESET_ATTEMPTS) {
          throw new Error('Too many reset attempts. Please wait before trying again.');
        }
        
        try {
          await resetPassword(cleanEmail);
        } catch (err: any) {
          if (err?.code === 'auth/too-many-requests') {
             throw new Error('Too many reset attempts. Please wait before trying again.');
          } else if (err?.code === 'auth/network-request-failed') {
             throw new Error('Unable to connect. Check your internet connection and try again.');
          } else {
             throw new Error('Password reset is temporarily unavailable. Please try again later.');
          }
        }
        
        rl.history.push(now);
        setRateLimit('reset_rl_' + cleanEmail, rl);
        
        setSuccess('Password reset instructions have been sent. Please check your Inbox, Spam, and Promotions folders.');
        setView('forgot_password_success');
        setResendCooldown(60);
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendResetEmail = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    const now = Date.now();
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const rl = getRateLimit('reset_rl_' + cleanEmail);
      rl.history = rl.history.filter((time: number) => now - time < RESET_LOCKOUT_DURATION);
      
      if (rl.history.length >= MAX_RESET_ATTEMPTS) {
        throw new Error('Too many reset attempts. Please wait before trying again.');
      }
      
      try {
        await resetPassword(cleanEmail);
      } catch (err: any) {
        if (err?.code === 'auth/too-many-requests') {
           throw new Error('Too many reset attempts. Please wait before trying again.');
        } else if (err?.code === 'auth/network-request-failed') {
           throw new Error('Unable to connect. Check your internet connection and try again.');
        } else {
           throw new Error('Password reset is temporarily unavailable. Please try again later.');
        }
      }
      
      rl.history.push(now);
      setRateLimit('reset_rl_' + cleanEmail, rl);
      
      setSuccess('Password reset instructions have been sent. Please check your Inbox, Spam, and Promotions folders.');
      setResendCooldown(60);
    } catch (err: any) {
      if (err.message) {
        setError(err.message.replace('Firebase: ', ''));
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {view === 'signup' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={150}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>

        {view !== 'forgot_password' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
              {view === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot_password');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-bold text-[#4aa4f0] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={64}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-colors pr-12"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {view === 'signup' && password.length > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs">
                 <span className="text-slate-500">Password strength:</span>
                 <span className={`font-bold ${getPasswordStrength(password) === 'Weak' ? 'text-red-500' : getPasswordStrength(password) === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                   {getPasswordStrength(password)}
                 </span>
              </div>
            )}
          </div>
        )}

        {view === 'signup' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={64}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#4aa4f0] outline-none transition-colors pr-12"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-[#4aa4f0] text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {view === 'signin' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
        </button>
      </form>
    );
  };

  if (view === 'forgot_password_success') {
    return (
      <div className="flex flex-col justify-center items-center py-12 md:py-20 px-4 min-h-[80vh]">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <MailCheck className="w-12 h-12 text-[#4aa4f0]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Check your email
          </h2>
          <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium text-left">
            {success}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed text-left">
            Email delivery may take a few minutes. If you cannot find it, search for 'password reset' or 'TenanTOwners' in your email account.
          </p>
          
          <div className="space-y-4">
            <div className="text-sm">
              <span className="text-slate-500 dark:text-slate-400 mr-1">Still not received it?</span>
              <button
                type="button"
                onClick={handleResendResetEmail}
                disabled={isSubmitting || resendCooldown > 0}
                className="font-bold text-[#4aa4f0] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isSubmitting ? 'Sending...' : resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Email'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setView('signin');
                setError('');
                setSuccess('');
              }}
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
          {error && (
            <div className="mt-6 bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-left">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center py-12 md:py-20 px-4 min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-center mb-6">
           <svg className="w-12 h-12 text-[#4aa4f0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter">
             <polygon points="12,3 3,21 21,21" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create an Account' : 'Reset Password'}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
          {view === 'signin' 
            ? 'Sign in to access your tenant or owner portal.' 
            : view === 'signup' 
            ? 'Join TenantOwners to manage properties.' 
            : 'Enter your email and we will send you a reset link.'}
        </p>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        {renderForm()}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              type="button"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
          {view === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => { setView('signup'); setError(''); setSuccess(''); }} className="text-[#4aa4f0] hover:underline font-bold">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => { setView('signin'); setError(''); setSuccess(''); }} className="text-[#4aa4f0] hover:underline font-bold">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
