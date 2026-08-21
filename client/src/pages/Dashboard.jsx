import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getBookings, getPayments, getReviewedBookings } from '../api/api.js'
import { useUser } from '../auth/UserContext.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDate, getHourOfDay } from '../utils/helpers.js'

/*
  The progress tracker's four steps light up by booking status. The original
  chose each step's `active` class with a chain of `||` comparisons; these are
  the same three sets, named. (Step 4's chain tested `status === 'active'`
  twice — a harmless duplicate, dropped here.)
*/
const STEP_SUBMITTED_STATUSES = [
  'pending',
  'rejected',
  'approved',
  'renew',
  'active',
  'completed',
]
const STEP_APPROVED_STATUSES = ['approved', 'renew', 'active', 'completed']
const STEP_ACTIVE_STATUSES = ['active', 'completed']

/* Which `.progress.progress-w-*` class scales the connector line (see src/index.css). */
function progressWidth(status) {
  if (status === 'pending' || status === 'rejected') return 'progress-w-50'
  if (status === 'approved' || status === 'renew') return 'progress-w-75'
  return 'progress-w-100'
}

function sessionLocation(booking) {
  if (booking.session_type === 'physical') return booking.address
  return booking.meeting_link || 'meeting link not set yet'
}

/*
  The three spans the original script filled in start empty in the HTML, and the
  full-screen LoadingState covers the page until the fetches resolve, so empty
  strings are the honest initial value.

  `bookings: []` renders an empty booking list — which is also exactly what
  getBookings() resolving to `[]` produced in the original. `null` is a separate
  case, handled in the render below.
*/
const EMPTY_SUMMARY = {
  greeting: '',
  paymentCount: '',
  reviewCount: '',
  bookingCount: '',
  bookings: [],
}

/**
 * Parent dashboard — ported from the original client's dashboard.html and
 * js/scripts/dashboard.js.
 *
 * The `?token=` OAuth hand-off that used to sit at the top of that script now
 * runs once in src/main.jsx, before React mounts, so ProtectedRoute can see the
 * token. The login check itself is ProtectedRoute's job too.
 */
export default function Dashboard() {
  useDocumentTitle('BrightMinds Tutors')

  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(EMPTY_SUMMARY)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const [reviews, bookings, payments] = await Promise.all([
        getReviewedBookings(),
        getBookings(),
        getPayments(),
      ])

      if (cancelled) return

      setSummary({
        greeting: `Good ${getHourOfDay()}`,
        paymentCount: payments?.length ?? '0',
        reviewCount: reviews?.length ?? '0',
        bookingCount: bookings?.length ?? '0',
        bookings,
      })
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // The original's `userProfile.username ? userProfile.username : ''`. The
  // profile itself comes from UserProvider, which has already fetched it for the
  // header, rather than from a fourth request in the Promise.all above.
  const username = user?.username || ''

  return (
    <DashboardLayout className="dashboard-page page-shell">
      <main className="dashboard-main page-main">
        <section className="dashboard-hero page-hero surface-card">
          <div>
            <p className="eyebrow">Student dashboard</p>
            <h1>
              <span className="greeting">{summary.greeting}</span>, <span>{username}</span>
            </h1>
            <p>
              Track lessons, payments, tutor reviews, and booking requests from one focused
              workspace.
            </p>
          </div>
          <Link to="/book" className="cta-btn gold">
            Book a tutor
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </section>

        <section className="dashboard-stats" aria-label="Dashboard summary">
          <Link to="/my-payments" className="stat-card metric-card surface-card">
            <i className="fa-solid fa-receipt icon-badge"></i>
            <span className="dashboard-stat">Payments</span>
            <strong>
              <span className="dashboard-stat-no">{summary.paymentCount}</span> records
            </strong>
          </Link>
          <Link to="/book" className="stat-card metric-card surface-card">
            <i className="fa-solid fa-book icon-badge"></i>
            <span className="dashboard-stat">Active bookings</span>
            <strong>
              <span className="dashboard-stat-no">{summary.bookingCount}</span> sessions
            </strong>
          </Link>
          <Link to="/review" className="stat-card metric-card surface-card">
            <i className="fa-solid fa-star icon-badge"></i>
            <span className="dashboard-stat">Reviews</span>
            <strong>
              <span className="dashboard-stat-no">{summary.reviewCount}</span> shared
            </strong>
          </Link>
        </section>

        <section className="dashboard-layout">
          <section className="bookings-panel surface-card">
            <div className="section-heading">
              <p className="eyebrow">Active bookings</p>
              <h2>Current lesson requests</h2>
            </div>

            <div className="booking-list">
              {summary.bookings ? (
                summary.bookings.map((booking) => (
                  <BookingCard key={booking.reference_code} booking={booking} />
                ))
              ) : (
                /*
                  getBookings() resolved to null. The original wrote
                  `'<p>No bookings yet<p>'` into the list and then threw on
                  `null.forEach`, so this message is what stayed on screen. The
                  stray second <p> that malformed string produced is kept: the
                  list is a grid, so it adds one 18px gap below the message.
                */
                <>
                  <p>No bookings yet</p>
                  <p></p>
                </>
              )}
            </div>
          </section>

          <aside className="dashboard-side">
            {/* Both side cards are static copy in the original: the script
                looked their elements up but never wrote to them. */}
            <article className="side-card surface-card">
              <i className="fa-solid fa-calendar-check"></i>
              <h2>Next lesson</h2>
              <p>Mathematics with Miss Adaeze</p>
              <strong>Monday - 4:00 PM</strong>
            </article>
            <article className="side-card surface-card">
              <i className="fa-solid fa-wallet"></i>
              <h2>Payment status</h2>
              <p>Your confirmed mathematics booking is up to date.</p>
              <strong>No outstanding balance</strong>
            </article>
          </aside>
        </section>
      </main>

      <LoadingState active={loading} />
    </DashboardLayout>
  )
}

function BookingCard({ booking }) {
  const status = booking.status

  return (
    <Link
      to={`/booking-details?reff=${booking.reference_code}`}
      className="booking-card surface-card"
    >
      <div className="card-header">
        <div>
          <span className="card-subject">{booking.course.course_name}</span>
          <p>
            {booking.preferred_days}- {sessionLocation(booking)}
          </p>
        </div>
        <span className={`status ${status}`}>{status}</span>
      </div>
      <div className="progress-tracker">
        <div className={`progress ${progressWidth(status)}`}></div>
        <div className={`step${STEP_SUBMITTED_STATUSES.includes(status) ? ' active' : ''}`}>
          <span>1</span>
          <p>Submitted</p>
        </div>
        <div className={`step${STEP_SUBMITTED_STATUSES.includes(status) ? ' active' : ''}`}>
          <span>2</span>
          <p>Review</p>
        </div>
        <div className={`step${STEP_APPROVED_STATUSES.includes(status) ? ' active' : ''}`}>
          <span>3</span>
          <p>Approved</p>
        </div>
        <div className={`step${STEP_ACTIVE_STATUSES.includes(status) ? ' active' : ''}`}>
          <span>4</span>
          <p>Active</p>
        </div>
      </div>
      <div className="card-footer">
        <span className="reference">{booking.reference_code}</span>
        {status === 'approved' && (
          <Link
            to={`/make-payment?reff=${booking.reference_code}`}
            className="cta-btn proceed-payment"
          >
            Proceed to payment <i className="fa-solid fa-arrow-right"></i>
          </Link>
        )}
        {status === 'renew' && (
          <Link
            to={`/make-payment?reff=${booking.reference_code}`}
            className="cta-btn proceed-payment"
          >
            Renew Booking<i className="fa-solid fa-arrow-right"></i>
          </Link>
        )}
        <span className="date">Submitted {formatDate(booking.created_at)}</span>
      </div>
    </Link>
  )
}
