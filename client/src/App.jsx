import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthModalProvider } from './auth/AuthModalContext.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing.jsx'
import Pricing from './pages/Pricing.jsx'
import TermsOfUse from './pages/TermsOfUse.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Book from './pages/Book.jsx'
import BookingDetails from './pages/BookingDetails.jsx'
import MakePayment from './pages/MakePayment.jsx'
import MyPayments from './pages/MyPayments.jsx'
import Profile from './pages/Profile.jsx'
import Review from './pages/Review.jsx'
import BecomeTutor from './pages/BecomeTutor.jsx'

import Receipt from './pages/Receipt.jsx'
import Admin from './pages/Admin.jsx'
import AdminLogin from './pages/AdminLogin.jsx'

/**
 * Routes mirror the original client's file names one-for-one, so every
 * deployed URL keeps working (`vercel.json` had cleanUrls, so the live site
 * already served extensionless paths like /book and /my-payments).
 *
 * `/index` is kept as an alias for `/` because the original footer and
 * logout redirect both pointed at `./index`. It carries its query string
 * across, since the server's OAuth-failure redirect is
 * `{frontend_url}index?auth=required&oauth_error=...` — dropping the query
 * there would swallow both the error message and the flag that pops the
 * login form.
 */
/** Redirect to the landing page without losing the query string. */
function ToLanding() {
  const { search } = useLocation()
  return <Navigate to={`/${search}`} replace />
}

export default function App() {
  return (
    <AuthModalProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/index" element={<ToLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Parent-facing, requires a user token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<Book />} />
          <Route path="/booking-details" element={<BookingDetails />} />
          <Route path="/make-payment" element={<MakePayment />} />
          <Route path="/my-payments" element={<MyPayments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review" element={<Review />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
        </Route>

        {/* Standalone: printable receipt, no shared chrome (as in the original) */}
        <Route path="/receipt" element={<Receipt />} />

        {/* Admin, separate token */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Unknown paths fall back to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthModalProvider>
  )
}
