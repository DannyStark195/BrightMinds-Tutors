import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { loginUser } from '../api/adminAPI.js'
import { setAdminToken } from '../auth/auth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { collectData } from '../utils/formHelpers.js'

/**
 * Admin login — ported from the original client's admin-login.html plus
 * js/auth/adminAuth.js.
 *
 * No layout component: the original page had no header and no footer, just the
 * one card. The wrapper keeps `booking-page` because the card's layout comes
 * from css/book.css, which admin-login.html loaded before css/admin-login.css.
 *
 * Notes on the original:
 *  - adminAuth.js imported `adminLoginRequired` and `isAdminLoggedIn` but never
 *    called either, so an already-signed-in admin landing here just saw the
 *    form again. That is reproduced: no redirect.
 *  - The error message was revealed and never hidden again, so a second failed
 *    attempt looked the same as the first. Same here.
 */
export default function AdminLogin() {
  useDocumentTitle('Admin Login | BrightMinds Tutors')

  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  async function handleAdminLogin(event) {
    event.preventDefault()

    const data = collectData(event.currentTarget)
    const loginValid = await loginUser(data)

    if (!loginValid) {
      setFailed(true)
      return
    }

    setAdminToken(loginValid.token)
    navigate('/admin')
  }

  return (
    <div className="booking-page admin-login-page page-shell">
      <form className="booking-form surface-card admin-login-form" onSubmit={handleAdminLogin}>
        <section className="booking-step active">
          <div className="step-heading">
            <span>Admin access</span>
            <h2>Log in</h2>
          </div>

          <div className="details admin-login-fields">
            <label className="date-field">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Enter admin name"
                autoComplete="username"
                required
              />
            </label>
            <label className="date-field">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </label>
            <p className={`msg error${failed ? '' : ' inactive'}`}>
              The admin name or password you have entered is incorrect.
            </p>
          </div>
        </section>

        <div className="booking-actions admin-login-actions">
          <Link to="/" className="cta-btn blue">
            Back
          </Link>
          <button type="submit" className="cta-btn gold">
            Log in
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </form>
    </div>
  )
}
