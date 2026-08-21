import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { logout } from '../auth/auth.js'
import { useUser } from '../auth/UserContext.jsx'

/**
 * Signed-in header with the profile drop-down — ported from the original
 * client's js/components/dNavMenu.js.
 *
 * The original wired four listeners by hand (menu button, close button,
 * backdrop, and a document-level click to catch outside clicks) and toggled
 * `active` classes on five separate elements. That is one piece of state here,
 * owned by DashboardLayout so the shared `.overlay` backdrop can close the menu
 * too. Class names are unchanged, so the drop-down (desktop) and full-screen
 * panel (under 860px) animate exactly as before.
 */
export default function DashboardHeader({ menuOpen, onMenuOpenChange }) {
  const wrapperRef = useRef(null)

  // Close when clicking anywhere outside the menu, as the original did. Clicks
  // on the toggle itself are inside wrapperRef, so opening is never undone.
  useEffect(() => {
    if (!menuOpen) return

    function handleDocumentClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        onMenuOpenChange(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [menuOpen, onMenuOpenChange])

  const { user } = useUser()

  return (
    <header className="header">
      <div className="logo">
        <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
        <p>BrightMinds Tutors</p>
      </div>

      <div className="nav-btn-wrapper" ref={wrapperRef}>
        <div
          className={`cross-btn dashboard-close-nav-btn${menuOpen ? ' active' : ''}`}
          onClick={() => onMenuOpenChange(false)}
        >
          <i className="fa-solid fa-xmark"></i>
        </div>

        <div
          className={`dashboard-nav-btn${menuOpen ? '' : ' active'}`}
          onClick={() => onMenuOpenChange(true)}
        >
          <img src="/assets/icons/menu.svg" alt="menu icon" />
        </div>

        <nav className={`navbar dashboard-navbar${menuOpen ? ' active' : ''}`}>
          <div className="profile">
            <div className="profile-img">
              <img
                src={user?.profile_pic || '/assets/images/avatars/default_avatar.png'}
                alt="user profile picture"
              />
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.username}</p>
              <Link to="/profile">
                My profile <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className={`more-links d${menuOpen ? ' active' : ''}`}>
            <div className="link">
              <i className="fa-solid fa-book"></i>
              <Link to="/book">
                <button>Book a tutor</button>
              </Link>
            </div>
            <div className="link">
              <i className="fa-solid fa-receipt"></i>
              <Link to="/my-payments">
                <button>My payments</button>
              </Link>
            </div>
            <div className="link">
              <i className="fa-solid fa-star"></i>
              <Link to="/review">
                <button>Review</button>
              </Link>
            </div>
            <div className="link">
              <i className="fa-solid fa-graduation-cap"></i>
              <Link to="/become-tutor">
                <button>Become a tutor</button>
              </Link>
            </div>
          </div>

          <a className="logout-btn" onClick={logout}>
            <button type="button" className="cta-btn gold">
              Log out
            </button>
          </a>
        </nav>
      </div>
    </header>
  )
}
