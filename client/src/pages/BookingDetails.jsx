import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getBookingDetails, toggleFirstSessionHeld } from '../api/api.js'
import { useUser } from '../auth/UserContext.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatCurrency, formatDate } from '../utils/helpers.js'

/**
 * One booking's details — ported from the original client's booking-details.html
 * plus js/scripts/bookingDetails.js.
 *
 * DashboardLayout renders the signed-in header and the `.overlay` backdrop; the
 * page has no footer, as in the original. `?reff=` selects the booking.
 *
 * The original filled 16 placeholder nodes by id and toggled `inactive` on the
 * aside cards. Here the fetched booking drives the markup directly, and the
 * placeholder copy that shipped in the HTML (BM-3581 / Physics / 2 hours /
 * 3 sessions per week) is kept as the fallback: bookingDetails.js threw on its
 * first property access when the fetch failed, so those defaults were what the
 * page actually showed in that case.
 */

const DEFAULT_AVATAR = '/assets/images/avatars/default_avatar.png'

/** `session_type | address` for physical lessons, `| meeting link` otherwise. */
function locationFor(booking) {
  if (booking.session_type === 'physical') {
    return `${booking.session_type} | ${booking.address}`
  }
  return `${booking.session_type} | ${booking.meeting_link || 'meeting link not set yet'}`
}

/**
 * The `#booking-status-message` copy, chosen exactly as bookingDetails.js chose
 * it. The fallback sentence is the one that sat in booking-details.html, which
 * is what `pending`, a rejection with no reason attached, an unrecognised status
 * and the in-flight request all displayed.
 *
 * `approved` and `renew` are the two statuses that carry an action link; both
 * point at /make-payment with this booking's reference.
 */
function StatusMessage({ booking }) {
  const status = booking?.status

  if (status === 'approved') {
    return (
      <>
        Your request has been approved, please make your payment and activate your
        booking. When this booking reaches auto-renew, the plan will update and you can
        renew it directly.{' '}
        <Link
          to={`/make-payment?reff=${booking.reference_code}`}
          className="cta-btn proceed-payment"
        >
          Proceed to payment
        </Link>
      </>
    )
  }

  if (status === 'renew') {
    return (
      <>
        Renew your plan to continue lessons!.{' '}
        <Link
          to={`/make-payment?reff=${booking.reference_code}`}
          className="cta-btn proceed-payment"
        >
          Renew Booking
        </Link>
      </>
    )
  }

  if (status === 'active') {
    return 'Your booking is now active!'
  }

  if (status === 'rejected' && booking.rejection_reason) {
    return `Your request has been rejected for the following reasons: ${booking.rejection_reason}`
  }

  if (status === 'completed') {
    return 'You have completed this booking! Thank you for appreciating our service.'
  }

  return 'Your request has been confirmed and the tutor will be assigned shortly.'
}

export default function BookingDetails() {
  useDocumentTitle('Booking details | BrightMinds Tutors')

  const [searchParams] = useSearchParams()
  const reff = searchParams.get('reff')

  const { user, loading: userLoading } = useUser()
  const [booking, setBooking] = useState(null)
  const [loadingBooking, setLoadingBooking] = useState(true)
  const [firstSessionHeld, setFirstSessionHeld] = useState(false)

  useEffect(() => {
    let current = true

    // Resolves to null rather than throwing, so there is nothing to catch here.
    getBookingDetails(reff).then((details) => {
      if (!current) return
      setBooking(details)
      setFirstSessionHeld(Boolean(details?.first_session_held))
      setLoadingBooking(false)
    })

    return () => {
      current = false
    }
  }, [reff])

  /* The original showed its loading overlay until both the profile and the
     booking had resolved; the profile now comes from UserProvider, so its load
     is part of the same wait. */
  const loading = userLoading || loadingBooking

  async function handleFirstSessionToggle() {
    if (!booking) return

    const next = !firstSessionHeld
    setFirstSessionHeld(next)

    /* Payload names are the Flask ones: booking_ref, first_session_held. The
       original ignored the response (including the error string this returns on
       failure) and left the toggle wherever the click put it. */
    await toggleFirstSessionHeld({
      booking_ref: booking.reference_code,
      first_session_held: next,
    })
  }

  const status = booking?.status

  /* Net effect of the original's five sequential classList toggles:
     - "Complete Booking" is shown only for `renew`.
     - "Cancel plan" starts visible and is hidden for `completed`, `renew` and
       `rejected`. (Its `remove('inactive')` for `active` was a no-op — the card
       had not been hidden at that point.)
     - The first-session switch is shown only for `active`. */
  const showCompleteCard = status === 'renew'
  const hideCancelCard =
    status === 'completed' || status === 'renew' || status === 'rejected'
  const showFirstSession = status === 'active'

  /* Both of the original's branches wanted the bundled default avatar; the
     tutor-with-no-picture branch pointed at `assets/images/avatar/…`, a path
     that does not exist (the folder is `avatars`), so it rendered a broken
     image. Collapsed to the one working path — see docs/DEVIATIONS.md. */
  const tutorImage = booking?.tutor?.profile_pic || DEFAULT_AVATAR

  return (
    <DashboardLayout className="booking-details-page page-shell">
      <main className="booking-details-main page-main">
        <section className="booking-details-hero surface-card">
          <div>
            <p className="eyebrow">Booking details</p>
            <h1>Review your lesson request</h1>
            <p>
              These details are for one booking request. In the finished site, this card
              will be loaded from the backend for each selected booking.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/dashboard" className="cta-btn gold">
              Dashboard
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </section>

        <section className="booking-details-layout">
          <div className="booking-summary-panel">
            <article className="info-card surface-card booking-overview-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">Booking reference</p>
                  <h2>
                    <span id="booking-ref">
                      {booking ? booking.reference_code : 'BM-3581'}
                    </span>
                  </h2>
                  {/* The status doubles as the pill's colour class, exactly as
                      `classList.add(status)` did. */}
                  <span className={`status${status ? ` ${status}` : ''}`} id="status-badge">
                    {status}
                  </span>
                </div>
                <div className="booking-avatar">
                  <img src={tutorImage} alt="Tutor profile picture" id="booking-tutor-img" />
                </div>
              </div>
              <div className="meta-grid">
                <div>
                  <p className="meta-label">Subject</p>
                  <strong id="booking-subject">
                    {booking ? booking.course.course_name : 'Physics'}
                  </strong>
                </div>
                <div>
                  <p className="meta-label">Tutor</p>
                  <strong id="booking-tutor">
                    {booking?.tutor?.tutor_name || 'Not assigned yet'}
                  </strong>
                </div>
                <div>
                  <p className="meta-label">Schedule</p>
                  <strong id="booking-schedule">
                    {booking && `${booking.preferred_days} · ${booking.time_window}`}
                  </strong>
                </div>
                <div>
                  <p className="meta-label">Location</p>
                  <strong id="booking-location">{booking && locationFor(booking)}</strong>
                </div>
                <div>
                  <p className="meta-label">Start date</p>
                  <strong id="booking-start-date">
                    {booking && formatDate(booking.start_date)}
                  </strong>
                </div>
                <div>
                  <p className="meta-label">Next billing date</p>
                  <strong id="booking-next_billing">
                    {booking && formatDate(booking.next_billing_date)}
                  </strong>
                </div>
              </div>
            </article>

            <article className="info-card surface-card booking-details-card">
              <h2>Student &amp; booking information</h2>
              <dl className="details-list">
                <div>
                  <dt>Student name</dt>
                  <dd>
                    <span id="booking-student-name">{booking?.student.name}</span>
                  </dd>
                </div>
                <div>
                  <dt>Parent / guardian</dt>
                  <dd>
                    <span id="booking-parent-name">{user?.username}</span>
                  </dd>
                </div>
                <div>
                  <dt>Contact number</dt>
                  <dd>
                    <span id="booking-parent-number">{user?.phone}</span>
                  </dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>
                    <span id="booking-parent-email">{user?.email}</span>
                  </dd>
                </div>
                <div>
                  <dt>Session length</dt>
                  <dd>
                    <span id="booking-session-length">
                      {booking ? booking.hours_per_session : '2'}
                    </span>{' '}
                    hours
                  </dd>
                </div>
                <div>
                  <dt>Weekly frequency</dt>
                  <dd>
                    <span id="booking-session-weekly">
                      {booking ? booking.sessions_per_week : '3'}
                    </span>{' '}
                    sessions per week
                  </dd>
                </div>
              </dl>
            </article>

            {/* Card is always present, as in the original — only the switch
                inside it is hidden until the booking is active. */}
            <article className="info-card surface-card booking-details-card">
              <div className={`first-session${showFirstSession ? '' : ' inactive'}`}>
                <p>First session held?</p>
                <div
                  className={`toggle first-session-held-btn${firstSessionHeld ? ' on' : ''}`}
                  onClick={handleFirstSessionToggle}
                >
                  <div className="toggle-slide"></div>
                </div>
              </div>
            </article>
          </div>

          <aside className="booking-details-aside">
            {/* "Next lesson" was never populated: bookingDetails.js looked
                `#booking-next-lesson` up and then never assigned to it, and the
                <p> above it is empty in the HTML too. Left as it shipped. */}
            <article className="side-card surface-card">
              <i className="fa-solid fa-calendar-check icon-badge"></i>
              <h2>Next lesson</h2>
              <p></p>
              <strong id="booking-next-lesson"></strong>
            </article>

            <article className="side-card surface-card">
              <i className="fa-solid fa-wallet icon-badge"></i>
              <h2>Payment summary</h2>
              <p>Lesson fee, deposit, and any outstanding charges.</p>
              {/* The API field is monthly_price; the label says "/ week". Copy
                  and field are both the original's. */}
              <strong>
                ₦<span id="booking-cost">
                  {booking && formatCurrency(booking.monthly_price)}
                </span>{' '}
                / week
              </strong>
            </article>

            <article className="side-card surface-card status-card">
              <i className="fa-solid fa-hourglass-half icon-badge"></i>
              <h2>Booking status</h2>
              <p id="booking-status-message">
                <StatusMessage booking={booking} />
              </p>
              <span
                id="booking-status"
                className={`status booking-status${status ? ` ${status}` : ''}`}
              >
                {status}
              </span>
            </article>

            {/* Neither button was ever wired up: bookingDetails.js selected
                #complete-booking-btn and #cancel-booking-btn and attached no
                listeners, so both are inert here as well. */}
            <article
              className={`side-card surface-card completed-card${
                showCompleteCard ? '' : ' inactive'
              }`}
            >
              <i className="fa-solid fa-check icon-badge"></i>
              <h2>Complete Booking</h2>
              <p>Satisfied with your lessons? Complete booking to stop lessons</p>
              <button type="button" className="cta-btn primary" id="complete-booking-btn">
                Complete booking
              </button>
            </article>

            <article
              className={`side-card surface-card cancel-card${hideCancelCard ? ' inactive' : ''}`}
            >
              <i className="fa-solid fa-ban icon-badge"></i>
              <h2>Cancel plan</h2>
              <p>Request cancellation for this booking.</p>
              <button type="button" className="cta-btn danger" id="cancel-booking-btn">
                Cancel plan
              </button>
            </article>
          </aside>
        </section>
      </main>

      {/* The original kept this as a sibling of the page wrapper. It is fixed,
          full-screen and z-index 999, and nothing here creates a stacking
          context, so rendering it inside the wrapper looks identical. */}
      <LoadingState active={loading} />
    </DashboardLayout>
  )
}
