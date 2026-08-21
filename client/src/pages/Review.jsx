import { useCallback, useEffect, useState } from 'react'

import { createReview, getBookingsForReview, getReviewedBookings } from '../api/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { collectData } from '../utils/formHelpers.js'
import { formatDate } from '../utils/helpers.js'

/**
 * Reviews — ported from the original client's review.html plus
 * js/scripts/review.js.
 *
 * The original defined the form twice: once statically in review.html and once
 * as an identical innerHTML template in review.js, which it re-rendered after a
 * successful submit to clear the fields. Here the form is declared once and
 * React resets it.
 *
 * Two dead code paths from the original are documented at their call sites
 * below, and two dead CSS rules in src/styles/review.css.
 */

const STARS = [1, 2, 3, 4, 5]

/** Filled stars up to `rating`, hollow for the rest. Used by the review cards. */
function starClasses(index, rating) {
  return index <= rating ? 'fa-solid fa-star' : 'fa-regular fa-star'
}

export default function Review() {
  useDocumentTitle('Reviews | BrightMinds Tutors')

  const [bookingsForReview, setBookingsForReview] = useState([])
  const [reviewedBookings, setReviewedBookings] = useState([])
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState({ text: '', tone: 'error' })
  const [submitting, setSubmitting] = useState(false)

  /* Both endpoints resolve to null on failure. The original called .forEach on
     the result, so a null threw and killed the rest of the module — the select
     stayed empty, the star picker was never wired up and the submit handler was
     never attached. Falling back to [] keeps the same empty rendering without
     taking the page down with it. */
  const load = useCallback(async () => {
    const [unreviewed, reviewed] = await Promise.all([
      getBookingsForReview(),
      getReviewedBookings(),
    ])
    setBookingsForReview(unreviewed || [])
    setReviewedBookings(reviewed || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget

    if (bookingsForReview.length === 0) {
      setMessage({ text: 'No more bookings to review', tone: 'error' })
      return
    }

    const data = collectData(form)

    setSubmitting(true)
    const { valid, message: apiMessage } = await createReview(data)
    setSubmitting(false)

    if (!valid) {
      setMessage({ text: apiMessage, tone: 'error' })
      return
    }

    setMessage({ text: apiMessage, tone: 'success' })

    /* The original reset the form by re-rendering its innerHTML, which replaced
       the very <p class="msg"> element it had just written the success text
       into — so the confirmation flashed for the length of the two refetches and
       then vanished, and because the handler held a stale reference to the
       detached node, no message ever appeared again for the rest of the session.
       Here the message stays put and the fields reset, which is what that code
       was reaching for. See docs/DEVIATIONS.md. */
    form.reset()
    setRating(0)
    await load()
  }

  return (
    <DashboardLayout className="review-page page-shell">
      <main className="review-main page-main">
        <section className="review-hero page-hero surface-card">
          <div>
            <p className="eyebrow">Your tutoring experience</p>
            <h1>Share feedback from your recent lessons</h1>
            <p className="hero-copy">
              Reviews help us match families with reliable tutors and improve every session.
            </p>
          </div>
          {/* Hardcoded in the original and never updated from the API. */}
          <div className="rating-summary surface-card">
            <span>4.8</span>
            <div>
              <div className="stars" aria-label="Average rating 4.8 out of 5">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star-half-stroke"></i>
              </div>
              <p>Average family rating</p>
            </div>
          </div>
        </section>

        <section className="review-grid">
          <article className="review-form-card surface-card">
            <div className="section-heading">
              <h2>Write a review</h2>
              <p>Pick the booking and rate the lesson quality.</p>
            </div>
            <form className="review-form" onSubmit={handleSubmit}>
              <label htmlFor="booking">
                Booking
                <select className="form-control" name="bookingId" id="booking">
                  {bookingsForReview.map((booking) => (
                    /* The original wrapped the status in a <span> inside the
                       <option>. The HTML parser drops elements inside <option>
                       but keeps their text, so what rendered was plain text —
                       including the original's double space before the bracket,
                       kept here. */
                    <option value={booking.booking_id} key={booking.booking_id}>
                      {`${booking.course_name} with ${booking.tutor_name}  (${booking.status})`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Rating
                <div className="rating-picker">
                  {STARS.map((star) => (
                    <label className="rating" id={`star-${star}`} key={star}>
                      {/* The original added `fa-solid` on top of `fa-regular`
                          rather than swapping them, so both classes are present
                          on a filled star. Reproduced exactly. */}
                      <i className={`fa-regular fa-star${star <= rating ? ' fa-solid' : ''}`}></i>
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        className="hidden-radio rating-btn"
                        data-star={star}
                        required={star === 1}
                        checked={rating === star}
                        onChange={() => setRating(star)}
                      />
                    </label>
                  ))}
                </div>
              </label>

              <label htmlFor="feedback">
                Feedback
                <textarea
                  className="form-control"
                  placeholder="Tell us what worked well and what could be better."
                  id="feedback"
                  name="feedback"
                  required
                ></textarea>
              </label>

              <p
                className={`msg ${message.tone}${message.text ? '' : ' inactive'}`}
              >
                {message.text}
              </p>

              <button className="cta-btn gold" type="submit" disabled={submitting}>
                {submitting ? (
                  'Loading...'
                ) : (
                  <>
                    Submit review
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          </article>

          <section className="review-list" aria-label="Recent reviews">
            {reviewedBookings.map((booking) => (
              <article className="review-card surface-card" key={booking.review.submitted_on + booking.tutor_name}>
                <div className="review-card-header">
                  <img src={booking.tutor_profile_pic} alt={booking.tutor_name} />
                  <div>
                    <h3>{booking.tutor_name}</h3>
                    <p>{booking.course_name} tutor</p>
                  </div>
                </div>
                <div className="stars">
                  {STARS.map((star) => (
                    <i className={starClasses(star, booking.review.rating)} key={star}></i>
                  ))}
                </div>
                <p>{booking.review.feedback}</p>
                <span>Reviewed {formatDate(booking.review.submitted_on)}</span>
              </article>
            ))}
          </section>
        </section>
      </main>
    </DashboardLayout>
  )
}
