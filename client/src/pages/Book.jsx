import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createBooking } from '../api/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { subscribeUserToPush } from '../push.js'
import { collectData } from '../utils/formHelpers.js'

/**
 * Booking wizard — ported from the original client's book.html plus
 * js/scripts/book.js.
 *
 * The original kept nine module-level `let`s (selectedSubject, selectedLevel,
 * selectedTime, selectedHr, selectedDays, selectedTimeWindow, selectedLocation,
 * selectedPhysicalAddress, selectedStartDate) in sync with the DOM by hand:
 * every option had a click listener that stripped `active` from its siblings,
 * set `input.checked = true`, and wrote back to the matching variable. Here
 * those variables are one `booking` state object and the `active` classes are
 * derived from it, so the DOM can no longer drift from the data.
 *
 * The four `.booking-step` sections all ship with `active` in book.html;
 * updateStepDisplay() corrected that on load. Here only the current step gets
 * `active`, which is the same end state without the flash.
 */

/* Time windows offered per daily-hours choice. Values are sent to the API
   verbatim, including the original's "9.am - 11.am" punctuation. */
const TIME_WINDOWS_BY_HOURS = {
  '2hrs': ['9.am - 11.am', '3.pm - 5.pm', '4.pm - 6.pm'],
  '3hrs': ['11.am - 2.pm', '2.pm - 5.pm', '3.pm - 6.pm'],
}

const SUBJECTS = [
  { value: 'Mathematics', icon: 'fa-solid fa-square-root-variable' },
  { value: 'English', icon: 'fa-solid fa-book-open' },
  { value: 'Physics', icon: 'fa-solid fa-atom' },
  { value: 'Biology', icon: 'fa-solid fa-dna' },
  { value: 'Computer Science', icon: 'fa-solid fa-code' },
]

/* Labels and values differ ("JSS" is sent as "Jss", "University" as "Uni"), so
   these stay as pairs. Preserved exactly — the Flask backend is unchanged. */
const GRADE_LEVELS = [
  { label: 'Primary', value: 'Primary' },
  { label: 'JSS', value: 'Jss' },
  { label: 'SS', value: 'SS' },
  { label: 'University', value: 'Uni' },
]

const TIMES_A_WEEK = [
  { label: '5x', value: '5' },
  { label: '3x', value: '3' },
  { label: '2x', value: '2' },
]

const HOURS_A_DAY = [
  { label: '2 Hours', value: '2hrs' },
  { label: '3 Hours', value: '3hrs' },
]

const DAYS = [
  { label: 'Mon', value: 'mon' },
  { label: 'Tue', value: 'tue' },
  { label: 'Wed', value: 'wed' },
  { label: 'Thur', value: 'thur' },
  { label: 'Fri', value: 'fri' },
  { label: 'Sat', value: 'sat' },
]

const LOCATIONS = [
  {
    value: 'physical',
    icon: 'fa-solid fa-location-dot',
    title: 'Physical',
    blurb: 'Tutor comes to you',
  },
  {
    value: 'online',
    icon: 'fa-solid fa-video',
    title: 'Online',
    blurb: 'Via Google Meet or Zoom',
  },
]

const PROGRESS_STEPS = [
  { step: 1, label: 'Need' },
  { step: 2, label: 'Schedule' },
  { step: 3, label: 'Place' },
  { step: 4, label: 'Details' },
]

const INITIAL_BOOKING = {
  subject: null,
  gradeLevel: null,
  times: null,
  hrs: null,
  days: [],
  timeWindow: null,
  startDate: '',
  lessonLocation: null,
  address: '',
}

export default function Book() {
  useDocumentTitle('BrightMinds Tutors')

  const navigate = useNavigate()
  const formRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [booking, setBooking] = useState(INITIAL_BOOKING)
  const [detailsError, setDetailsError] = useState(false)
  const [ageError, setAgeError] = useState('')
  /* null while the form is up; then 'pending' or 'error', which hides the
     wizard and reveals the matching alert panel. */
  const [outcome, setOutcome] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  /* NaN until a frequency is picked, exactly like the original's
     Number.parseInt(null, 10). Every comparison against it is false, which is
     what stopped days being selectable before step 1 was answered. */
  const timesAWeek = Number.parseInt(booking.times, 10)
  const timeWindows = TIME_WINDOWS_BY_HOURS[booking.hrs] || []

  function update(changes) {
    setBooking((current) => ({ ...current, ...changes }))
  }

  /* Changing the weekly frequency trims any days already picked beyond the new
     allowance (the original's resetScheduleForTime + updateStep2). */
  function selectTimes(value) {
    setBooking((current) =>
      current.times && current.times !== value
        ? { ...current, times: value, days: current.days.slice(0, Number.parseInt(value, 10)) }
        : { ...current, times: value },
    )
  }

  /* Changing daily hours invalidates the chosen window, since each hours option
     offers a different set (the original's resetScheduleForHours). */
  function selectHours(value) {
    setBooking((current) =>
      current.hrs && current.hrs !== value
        ? { ...current, hrs: value, timeWindow: null }
        : { ...current, hrs: value },
    )
  }

  function toggleDay(value) {
    setBooking((current) => {
      if (current.days.includes(value)) {
        return { ...current, days: current.days.filter((day) => day !== value) }
      }
      // Silently ignored once the weekly allowance is used up, as before.
      if (current.days.length < Number.parseInt(current.times, 10)) {
        return { ...current, days: [...current.days, value] }
      }
      return current
    })
  }

  function selectLocation(value) {
    update({ lessonLocation: value })
  }

  /* Steps 1-3 fail silently — the original just returned without surfacing a
     message. Only step 4 has error slots. */
  function validateStep(step) {
    if (step === 1) {
      return Boolean(booking.subject && booking.gradeLevel && booking.times && booking.hrs)
    }
    if (step === 2) {
      return (
        booking.days.length === timesAWeek &&
        Boolean(booking.timeWindow && booking.startDate)
      )
    }
    if (step === 3) {
      if (booking.lessonLocation === 'physical') {
        return Boolean(booking.address.trim())
      }
      return booking.lessonLocation === 'online'
    }
    if (step === 4) {
      return validateDetails()
    }
    return false
  }

  function validateDetails() {
    const form = formRef.current
    const details = [...form.querySelectorAll('.detail')]

    setDetailsError(false)
    setAgeError('')

    if (!details.every((detail) => detail.value.trim())) {
      setDetailsError(true)
      return false
    }

    const studentAge = Number(form.querySelector('[name="studentAge"]').value)
    if (!(Number.isInteger(studentAge) && studentAge >= 5)) {
      setAgeError('Student must be at least 5 years old')
      return false
    }
    return true
  }

  function handleContinue() {
    if (!validateStep(currentStep)) return

    if (currentStep === 4) {
      /* requestSubmit() so the browser still runs native validation. That is
         what enforces the Terms checkbox: the original's validateStep4 looked
         for `.terms-checkbox`, but the markup's checkbox has `class=""`, so the
         lookup returned null and `.terms-error` was never shown. The checkbox's
         `required` attribute is doing the work, via the browser's own tooltip. */
      formRef.current.requestSubmit()
      return
    }

    setCurrentStep((step) => step + 1)
  }

  function handleBack() {
    // Back from step 1 left the wizard entirely, as it did originally.
    if (currentStep - 1 < 1) {
      navigate('/dashboard')
      return
    }
    setCurrentStep((step) => step - 1)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    /* Field names come from the inputs' `name` attributes plus these three
       extras, matching the original payload exactly. `selectedDays` carries the
       real day list because Object.fromEntries collapses the six same-named
       checkboxes to one value, and `selectedPhysicalAddress` carries the address
       because that input has no `name`. */
    const data = collectData(event.currentTarget, {
      selectedDays: booking.days,
      selectedLocation: booking.lessonLocation,
      selectedPhysicalAddress: booking.address,
    })

    setSubmitting(true)
    const { valid } = await createBooking(data)

    if (!valid) {
      setOutcome('error')
      return
    }

    setOutcome('pending')
    await subscribeUserToPush()
  }

  const continueLabel =
    currentStep === 4 ? (
      'Submit'
    ) : (
      <>
        Continue
        <i className="fa-solid fa-arrow-right"></i>
      </>
    )

  return (
    <DashboardLayout className="booking-page page-shell">
      <main className="booking-main page-main">
        <div className={outcome ? 'inactive' : ''} id="booking">
          <section className="booking-hero page-hero surface-card">
            <div>
              <p className="eyebrow">Book a tutor</p>
              <h1>Build the right lesson plan for your child</h1>
              <p>
                Choose the subject, schedule, lesson format, and contact details so BrightMind
                can match you with a suitable tutor.
              </p>
            </div>
          </section>

          <section className="booking-workspace">
            <aside className="booking-summary surface-card">
              <div className="booking-progress progress-tracker active">
                <div className={`progress progress-w-${currentStep * 25}`}></div>
                {PROGRESS_STEPS.map(({ step, label }) => (
                  <div
                    className={`step${step <= currentStep ? ' active' : ''}`}
                    data-step={step}
                    key={step}
                  >
                    <span>{step}</span>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
              {/* Hardcoded in the original — book.js never updated the summary. */}
              <div className="summary-card">
                <h2>Booking summary</h2>
                <dl>
                  <div>
                    <dt>Subject</dt>
                    <dd>Not selected</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>Not selected</dd>
                  </div>
                  <div>
                    <dt>Schedule</dt>
                    <dd>Choose days and time</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>Physical or online</dd>
                  </div>
                </dl>
              </div>
            </aside>

            <form className="booking-form surface-card" ref={formRef} onSubmit={handleSubmit}>
              {/* ---------------------------------------------- step 1 ---- */}
              <section className={`booking-step step-1${currentStep === 1 ? ' active' : ''}`}>
                <div className="step-heading">
                  <span>Step 1</span>
                  <h2>What does your child need?</h2>
                </div>
                <div className="field-group">
                  <p className="field-label">Subject</p>
                  <div className="option-grid book-subjects">
                    {SUBJECTS.map(({ value, icon }, index) => (
                      <label
                        className={`option-card sub${booking.subject === value ? ' active' : ''}`}
                        key={value}
                      >
                        <i className={icon}></i>
                        {value}
                        <input
                          type="radio"
                          name="subject"
                          value={value}
                          className="hidden-radio lg subject-btn"
                          required={index === 0}
                          checked={booking.subject === value}
                          onChange={() => update({ subject: value })}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field-group">
                  <p className="field-label">Grade level</p>
                  <div className="pill-row levels">
                    {GRADE_LEVELS.map(({ label, value }, index) => (
                      <label
                        className={`option-pill level${
                          booking.gradeLevel === value ? ' active' : ''
                        }`}
                        key={value}
                      >
                        {label}
                        <input
                          type="radio"
                          name="gradeLevel"
                          value={value}
                          className="hidden-radio grade-btn"
                          required={index === 0}
                          checked={booking.gradeLevel === value}
                          onChange={() => update({ gradeLevel: value })}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="split-fields">
                  <div className="field-group">
                    <p className="field-label">Times a week</p>
                    <div className="pill-row times">
                      {TIMES_A_WEEK.map(({ label, value }, index) => (
                        <label
                          className={`option-pill time${
                            booking.times === value ? ' active' : ''
                          }`}
                          key={value}
                        >
                          {label}
                          <input
                            type="radio"
                            name="times"
                            value={value}
                            className="hidden-radio times-btn"
                            required={index === 0}
                            checked={booking.times === value}
                            onChange={() => selectTimes(value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <p className="field-label">Hours a day</p>
                    <div className="pill-row hrs">
                      {HOURS_A_DAY.map(({ label, value }, index) => (
                        <label
                          className={`option-pill hr${booking.hrs === value ? ' active' : ''}`}
                          key={value}
                        >
                          {label}
                          <input
                            type="radio"
                            name="hrs"
                            value={value}
                            className="hidden-radio hrs-btn"
                            required={index === 0}
                            checked={booking.hrs === value}
                            onChange={() => selectHours(value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------- step 2 ---- */}
              <section className={`booking-step step-2${currentStep === 2 ? ' active' : ''}`}>
                <div className="step-heading">
                  <span>Step 2</span>
                  <h2>Choose a schedule</h2>
                </div>
                <div className="field-group">
                  <p className="field-label">Preferred days</p>
                  <div className="pill-row days">
                    {DAYS.map(({ label, value }) => (
                      <label
                        className={`option-pill day${
                          booking.days.includes(value) ? ' active' : ''
                        }`}
                        key={value}
                      >
                        {label}
                        <input
                          type="checkbox"
                          name="days"
                          value={value}
                          className="hidden-radio days-btn"
                          checked={booking.days.includes(value)}
                          onChange={() => toggleDay(value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field-group">
                  <p className="field-label">Time window</p>
                  <div className="option-grid time-windows">
                    {timeWindows.map((window) => (
                      <label
                        className={`option-card window${
                          booking.timeWindow === window ? ' active' : ''
                        }`}
                        key={window}
                      >
                        {window}
                        <input
                          type="radio"
                          name="timeWindow"
                          value={window}
                          className="hidden-radio window-btn"
                          checked={booking.timeWindow === window}
                          onChange={() => update({ timeWindow: window })}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <label className="date-field">
                  Start date
                  <input
                    type="date"
                    className="form-control start-date"
                    name="startDate"
                    value={booking.startDate}
                    onChange={(event) => update({ startDate: event.target.value })}
                  />
                </label>
              </section>

              {/* ---------------------------------------------- step 3 ---- */}
              <section className={`booking-step step-3${currentStep === 3 ? ' active' : ''}`}>
                <div className="step-heading">
                  <span>Step 3</span>
                  <h2>Where should lessons happen?</h2>
                </div>
                <div className="option-grid locations">
                  {LOCATIONS.map(({ value, icon, title, blurb }, index) => (
                    <label
                      className={`option-card location${
                        booking.lessonLocation === value ? ' active' : ''
                      }`}
                      key={value}
                    >
                      <i className={icon}></i>
                      <strong>{title}</strong>
                      <span>{blurb}</span>
                      <input
                        type="radio"
                        name="lessonLocation"
                        value={value}
                        className="hidden-radio location-btn"
                        required={index === 0}
                        checked={booking.lessonLocation === value}
                        onChange={() => selectLocation(value)}
                      />
                    </label>
                  ))}
                </div>
                {/* The address input has no `name` in the original, so it never
                    reached FormData; its value travels as
                    `selectedPhysicalAddress`. */}
                <label
                  className={`date-field address-field${
                    booking.lessonLocation === 'physical' ? '' : ' inactive'
                  }`}
                >
                  Address
                  <input
                    type="text"
                    className="form-control physical-location-input"
                    placeholder="Input your address"
                    value={booking.address}
                    onChange={(event) => update({ address: event.target.value })}
                  />
                </label>
              </section>

              {/* ---------------------------------------------- step 4 ---- */}
              <section className={`booking-step step-4${currentStep === 4 ? ' active' : ''}`}>
                <div className="step-heading">
                  <span>Step 4</span>
                  <h2>Your details</h2>
                </div>
                <div className="details">
                  <input
                    type="text"
                    name="studentName"
                    className="form-control detail"
                    placeholder="Student's name"
                    required
                  />
                  <div className="detail-field">
                    <input
                      type="number"
                      name="studentAge"
                      className="form-control detail"
                      placeholder="Student's age"
                      min="6"
                      step="1"
                      required
                    />
                    <p className={`msg error age${ageError ? '' : ' inactive'}`}>{ageError}</p>
                  </div>
                  <input
                    type="text"
                    name="disabilities"
                    className="form-control detail"
                    placeholder="Any disabilities? If yes, state."
                    required
                  />
                  <textarea
                    name="message"
                    className="form-control"
                    placeholder="Leave a message (optional)"
                  ></textarea>
                  <p className={`msg error details-error${detailsError ? '' : ' inactive'}`}>
                    Please fill in all required details.
                  </p>
                </div>
                <label className="field-label condition">
                  <input type="checkbox" required className="" name="termsCheckbox" />I agree to
                  the <Link to="/terms-of-use">Terms of Use</Link>
                </label>
                {/* Never shown: the original looked this up via `.terms-checkbox`,
                    a class the checkbox above does not have. Native `required`
                    validation covers it instead. */}
                <p className="msg error terms-error inactive">
                  Please agree to the Terms of Use.
                </p>
              </section>

              <div className="booking-actions">
                <button type="button" className="cta-btn blue back-btn" onClick={handleBack}>
                  Back
                </button>
                <button
                  type="button"
                  className="cta-btn gold continue-btn"
                  onClick={handleContinue}
                  disabled={submitting}
                >
                  {continueLabel}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* One alert node in the original, whose innerHTML was swapped between
            the two outcomes. */}
        <div className={`alert booking-pending${outcome ? '' : ' inactive'}`}>
          {outcome === 'error' && (
            <div className="alert__hero">
              <div className="hero-content">
                <p className="eyebrow">Booking Error</p>
                <h2 style={{ color: 'var(--Danger)' }}>Error</h2>
                <p style={{ color: 'var(--Danger)' }}>
                  There was an error during booking. We apologize for the inconvenience, please
                  try again.
                </p>
                <div className="hero-actions">
                  <a href="/book" className="cta-btn gold">
                    Back to booking
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
              <div className="alert__icon">
                <img src="/assets/icons/error.svg" alt="BrightMind tutor" />
              </div>
            </div>
          )}
          {outcome === 'pending' && (
            <div className="alert__hero">
              <div className="hero-content">
                <p className="eyebrow">Booking pending</p>
                <h2>Pending</h2>
                <p>
                  Your request is being reviewed. You will get an approval in less than 24 hours
                </p>
                <div className="hero-actions">
                  <Link to="/dashboard" className="cta-btn gold">
                    Back to dashboard
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
              <div className="alert__icon">
                <img src="/assets/icons/bell.svg" alt="BrightMind tutor" />
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
