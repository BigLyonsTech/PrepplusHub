import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageLoader from './components/PageLoader'
import ChatWidget from './components/ChatWidget'

// Every page is code-split. Three.js is gone entirely (Logo3D is a CSS/
// framer-motion flip, not WebGL) and GSAP isn't imported by any live code
// path — Reveal.jsx uses framer-motion's whileInView instead, so every
// route (including the landing page) loads without that extra weight.
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthEntry = lazy(() => import('./pages/AuthEntry'))
const Login = lazy(() => import('./pages/Login'))
const RegistrationForm = lazy(() => import('./pages/RegistrationForm'))
const OTPVerification = lazy(() => import('./pages/OTPVerification'))
const RoleConfirmation = lazy(() => import('./pages/RoleConfirmation'))
const CustomerOnboardingQuiz = lazy(() => import('./pages/CustomerOnboardingQuiz'))
const VendorEligibilityFlow = lazy(() => import('./pages/VendorEligibilityFlow'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ProfileCustomization = lazy(() => import('./pages/ProfileCustomization'))
const ProductsBrowse = lazy(() => import('./pages/ProductsBrowse'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CheckoutFlow = lazy(() => import('./pages/CheckoutFlow'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const VendorOrdersPage = lazy(() => import('./pages/VendorOrdersPage'))

export default function App() {
  const location = useLocation()

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* 1. Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Auth Entry + login */}
            <Route path="/auth" element={<AuthEntry />} />
            <Route path="/login" element={<Login />} />

            {/* 3–4. Registration + OTP */}
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/verify-otp" element={<OTPVerification />} />

            {/* 5. Role Confirmation */}
            <Route path="/role-confirmation" element={<RoleConfirmation />} />

            {/* 6–7. Onboarding */}
            <Route path="/onboarding/quiz" element={<CustomerOnboardingQuiz />} />
            <Route path="/onboarding/vendor" element={<VendorEligibilityFlow />} />

            {/* 8–10. Dashboards */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 11. Profile */}
            <Route path="/profile" element={<ProfileCustomization />} />

            {/* Public browsing + 12. Product detail */}
            <Route path="/products" element={<ProductsBrowse />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* 13. Checkout */}
            <Route path="/checkout" element={<CheckoutFlow />} />

            {/* Order tracking + vendor order management */}
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />

            {/* 14. Terms */}
            <Route path="/terms" element={<TermsAndConditions />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ChatWidget />
    </>
  )
}
