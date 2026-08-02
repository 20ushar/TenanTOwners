import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { RequireAuth } from './lib/RequireAuth';
import { RequireAdmin } from './lib/RequireAdmin';
import { PreferenceProvider } from './lib/PreferenceContext';
import { SplashScreen } from './components/SplashScreen';

const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Listings = React.lazy(() => import('./pages/Listings').then(m => ({ default: m.Listings })));
const PropertyDetail = React.lazy(() => import('./pages/PropertyDetail').then(m => ({ default: m.PropertyDetail })));
const Wishlist = React.lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CustomInquiry = React.lazy(() => import('./pages/CustomInquiry').then(m => ({ default: m.CustomInquiry })));
const MyRequests = React.lazy(() => import('./pages/MyRequests').then(m => ({ default: m.MyRequests })));
const Login = React.lazy(() => import('./pages/Login'));
const AboutUs = React.lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const ContactUs = React.lazy(() => import('./pages/ContactUs').then(m => ({ default: m.ContactUs })));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const FAQ = React.lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

type LoaderProps = {};
const PageLoader: React.FC<LoaderProps> = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-[#4aa4f0]"></div>
  </div>
);

function AppContent() {
  const { loading } = useAuth();
  
  return (
    <>
      <SplashScreen finishLoading={!loading} />
      <BrowserRouter>
        <PreferenceProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                <Route path="/704STK" caseSensitive element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/custom-inquiry" element={<RequireAuth><CustomInquiry /></RequireAuth>} />
                <Route path="/my-requests" element={<RequireAuth><MyRequests /></RequireAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </PreferenceProvider>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
}
