import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuthModal } from '../auth/AuthModalContext.jsx'

/**
 * Public site header — ported from the header template in the original
 * client's js/components/headerFooter.js, with the open/close behaviour from
 * js/components/navaMenu.js.
 *
 * The original toggled an `active` class on `.navbar` and `.more-links` from a
 * click listener; that is `navOpen` state here. Class names are unchanged, so
 * the mobile slide-in panel (clip-path transition under 860px) is untouched.
 *
 * The `<button>` inside `<Link>` nesting is kept from the original because the
 * `.navbar button` and `.more-links a button` rules depend on it.
 */
export default function Header() {
  const [navOpen, setNavOpen] = useState(false)
  const { openLogin, openSignup } = useAuthModal()

  const closeNav = () => setNavOpen(false)

  return (
    <header className="header">
      <div className="logo">
        <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
        <p>BrightMinds Tutors</p>
      </div>

      <nav className={`navbar${navOpen ? ' active' : ''}`}>
        <div className="cross-btn close-nav-btn" onClick={closeNav}>
          <i className="fa-solid fa-xmark"></i>
        </div>

        <button
          className="gold open-signup phone-active"
          onClick={() => {
            closeNav()
            openSignup()
          }}
        >
          Get Started
        </button>
        <button
          className="open-login phone-active"
          onClick={() => {
            closeNav()
            openLogin()
          }}
        >
          Log In
        </button>

        <div className={`more-links${navOpen ? ' active' : ''}`}>
          <Link to="/become-tutor" onClick={closeNav}>
            <button>Become a tutor</button>
          </Link>
          <Link to="/pricing" onClick={closeNav}>
            <button>See Pricing</button>
          </Link>
          <div className="call-container">
            <p>Prefer to speak with us?</p>
            <a href="tel:+2348092812010" className="call-btn">
              <i className="fa-solid fa-phone"></i>
              <div>
                <p>Call Now:</p>
                <p>08092812010</p>
              </div>
            </a>
          </div>
        </div>
      </nav>

      <div className="nav-btn" onClick={() => setNavOpen(true)}>
        <img src="/assets/icons/menu.svg" alt="menu icon" />
      </div>
    </header>
  )
}
