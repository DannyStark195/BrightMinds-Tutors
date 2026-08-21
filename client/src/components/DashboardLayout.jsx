import { useState } from 'react'

import DashboardHeader from './DashboardHeader.jsx'

/**
 * Shell for the signed-in pages (dashboard, book, booking-details,
 * make-payment, my-payments, profile, review, become-tutor).
 *
 * Matches the original structure: the page wrapper holds the header and
 * content, and the `.overlay` backdrop is a sibling of the wrapper. These
 * pages have no footer, as in the original.
 *
 * The nav menu's open state lives here so both the header's close button and
 * the backdrop can dismiss it.
 */
export default function DashboardLayout({ className, children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className={className}>
        <DashboardHeader menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
        {children}
      </div>
      <div
        className={`overlay${menuOpen ? ' active' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>
    </>
  )
}
