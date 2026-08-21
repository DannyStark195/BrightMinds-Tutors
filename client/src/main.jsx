import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { setUserToken } from './auth/auth.js'

/*
  Stylesheet order matters and is fixed here rather than left to each page's
  import, so the cascade matches the original <link> order on every page:

    index.css        global.css + layout.css + components.css (shared)
    styles/*.css     the per-page files, each scoped to its page wrapper class

  dashboard.css must precede review.css (the original review.html loaded both,
  in that order), and book.css must precede admin-login.css for the same reason.
*/
import './index.css'
import './styles/landing.css'
import './styles/pricing.css'
import './styles/legal.css'
import './styles/dashboard.css'
import './styles/book.css'
import './styles/booking-details.css'
import './styles/payment.css'
import './styles/my-payments.css'
import './styles/profile.css'
import './styles/review.css'
import './styles/become-tutor.css'
import './styles/admin.css'
import './styles/admin-login.css'
import './styles/receipt.css'

/**
 * OAuth providers redirect back to /dashboard?token=<jwt>. Store the token and
 * scrub it from the URL *before* React mounts, otherwise ProtectedRoute would
 * see no token and bounce the user to the login form.
 *
 * The original relied on script order for this: dashboard.js (which read the
 * token) was loaded before dAuth.js (which enforced the login check).
 */
function consumeOAuthToken() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (token) {
    setUserToken(token)
    // Keep the token out of the visible URL and out of history.
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

consumeOAuthToken()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
