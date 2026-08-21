import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  bookingDecision,
  getAdmin,
  getBookings,
  getParentsAndBookings,
  getStudents,
  getTutorApplications,
  getTutorOptions,
  getTutors,
  tutorApplicationDecision,
} from '../api/adminAPI.js'
import { logoutAdmin } from '../auth/auth.js'
import LoadingState from '../components/LoadingState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDate } from '../utils/helpers.js'

/**
 * Admin console — ported from the original client's admin.html plus
 * js/scripts/admin.js.
 *
 * Auth is enforced by <AdminRoute /> in the router. The original called
 * adminLoginRequired() from admin.js (the adminAuth.js <script> tag in
 * admin.html was commented out, but admin.js imported the guard directly).
 *
 * Layout note: `.admin-overlay` and `.review-panel` sat outside `.admin-page` in
 * admin.html, but src/styles/admin.css scopes every rule to `.admin-page`, so
 * they are rendered inside it here. Both are `position: fixed` and no ancestor
 * creates a containing block, so nothing moves.
 *
 * The biggest behavioural difference is not visible: the original called
 * renderAdminDecision() on every panel open *and* on every document click, and
 * each call added another click listener to the panel. Approving a booking after
 * a few clicks fired the decision request once per accumulated listener. Here it
 * is an ordinary onClick, so it fires once.
 */

const NAV_ITEMS = [
  { section: 'overview', icon: 'fa-solid fa-chart-line', label: 'Overview' },
  { section: 'bookings', icon: 'fa-solid fa-calendar-check', label: 'Bookings', count: true },
  { section: 'parents', icon: 'fa-solid fa-user-group', label: 'Parents' },
  { section: 'students', icon: 'fa-solid fa-user-group', label: 'Students' },
  { section: 'tutors', icon: 'fa-solid fa-chalkboard-user', label: 'Tutors' },
  { section: 'applications', icon: 'fa-solid fa-file-lines', label: 'Tutor Applications' },
]

const BOOKING_FILTERS = ['all', 'pending', 'approved', 'active', 'rejected', 'completed']
const APPLICATION_FILTERS = ['all', 'pending', 'approved', 'rejected']

/* Hardcoded in admin.html and never touched by admin.js. */
const OVERVIEW_STATS = [
  { icon: 'fa-solid fa-layer-group', label: 'Total Bookings', value: '24' },
  { icon: 'fa-solid fa-hourglass-half', label: 'Pending', value: '2' },
  { icon: 'fa-solid fa-circle-check', label: 'Approved', value: '18' },
  { icon: 'fa-solid fa-circle-xmark', label: 'Rejected', value: '4' },
]

const RECENT_ACTIVITY = [
  ['Booking BM-2847 approved', '2 hours ago'],
  ['Miss Adaeze assigned to Biology', '4 hours ago'],
  ['Tutor application from Chika Okoro received', 'Yesterday'],
  ['Booking BM-3496 rejected', 'Yesterday'],
  ['Parent account for Daniel Ebuka created', '2 days ago'],
]

export default function Admin() {
  useDocumentTitle('Admin | BrightMinds Tutors')

  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [bookings, setBookings] = useState([])
  const [applications, setApplications] = useState([])
  const [parents, setParents] = useState([])
  const [parentBookings, setParentBookings] = useState([])
  const [students, setStudents] = useState([])
  const [tutors, setTutors] = useState([])

  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [applicationFilter, setApplicationFilter] = useState('all')
  const [expandedParents, setExpandedParents] = useState(() => new Set())
  const [panel, setPanel] = useState(null)

  const refreshBookings = useCallback(async () => {
    setBookings(toList(await getBookings()))
  }, [])

  const refreshApplications = useCallback(async () => {
    setApplications(toList(await getTutorApplications()))
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const [adminProfile, bookingList, applicationList, parentsPayload, studentList, tutorList] =
        await Promise.all([
          getAdmin(),
          getBookings(),
          getTutorApplications(),
          getParentsAndBookings(),
          getStudents(),
          getTutors(),
        ])

      if (cancelled) return

      setAdmin(adminProfile)
      setBookings(toList(bookingList))
      setApplications(toList(applicationList))
      setParents(toList(parentsPayload?.parents))
      setParentBookings(parentsPayload?.bookings || [])
      setStudents(toList(studentList))
      setTutors(toList(tutorList))
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  /* The original added this class to <body> to lock scrolling behind the mobile
     sidebar. body is shared by every route now, so the cleanup matters: without
     it the class would follow you off the admin page. */
  useEffect(() => {
    if (!sidebarOpen) return

    document.body.classList.add('admin-sidebar-open')
    return () => document.body.classList.remove('admin-sidebar-open')
  }, [sidebarOpen])

  useEffect(() => {
    function handleKeydown(event) {
      if (event.key === 'Escape') {
        setPanel(null)
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  function selectSection(next) {
    setSection(next)
    setSidebarOpen(false)
  }

  function toggleParent(username) {
    setExpandedParents((current) => {
      const next = new Set(current)
      if (next.has(username)) {
        next.delete(username)
      } else {
        next.add(username)
      }
      return next
    })
  }

  async function openBookingPanel(booking) {
    // Tutor choices are filtered by the booking's subject, as before.
    const options = toList(await getTutorOptions(booking.course.course_name))
    setPanel({ type: 'booking', record: booking, tutorOptions: options })
  }

  function openApplicationPanel(application) {
    setPanel({ type: 'application', record: application, tutorOptions: [] })
  }

  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length

  return (
    <div className="admin-page">
      <div className="admin-nav-btn-wrapper">
        <div
          className={`cross-btn admin-close-nav-btn${sidebarOpen ? ' active' : ''}`}
          aria-label="Close admin navigation"
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => handleActivate(event, () => setSidebarOpen(false))}
        >
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div
          className={`admin-nav-btn${sidebarOpen ? '' : ' active'}`}
          aria-label="Open admin navigation"
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(true)}
          onKeyDown={(event) => handleActivate(event, () => setSidebarOpen(true))}
        >
          <img src="/assets/icons/menu.svg" alt="menu icon" />
        </div>
      </div>

      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`admin-sidebar${sidebarOpen ? ' active' : ''}`}>
        <Link to="/admin" className="admin-brand">
          <img src="/assets/icons/tutor-logo-gold.svg" alt="BrightMind logo" />
          <span>BrightMind</span>
        </Link>

        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <button
              className={`admin-nav-link${section === item.section ? ' active' : ''}`}
              type="button"
              data-section={item.section}
              key={item.section}
              onClick={() => selectSection(item.section)}
            >
              <i className={item.icon}></i>
              {item.label}
              {item.count && <span className="nav-count pending-count">{pendingCount}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-account">
          <div>
            <span>Admin</span>
            {/* "Daniel Stark" was the placeholder in admin.html; admin.js
                replaced it with the signed-in admin's username. */}
            <strong className="admin-name">{admin?.username}</strong>
          </div>
          <button type="button" className="logout-btn" onClick={logoutAdmin}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {/* ------------------------------------------------------ overview -- */}
        <section
          className={`admin-section${section === 'overview' ? ' active' : ''}`}
          data-panel="overview"
        >
          <AdminHeading
            eyebrow="Overview"
            title="Admin dashboard"
            blurb="Track bookings, tutor activity, students, and applications from one workspace."
          />

          <section className="summary-grid admin-stats" aria-label="Booking summary">
            {OVERVIEW_STATS.map((stat) => (
              <article className="metric-card surface-card" key={stat.label}>
                <i className={`${stat.icon} icon-badge`}></i>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </section>

          <section className="activity-card surface-card">
            <div className="section-heading">
              <p className="eyebrow">Recent activity</p>
              <h2>Last platform actions</h2>
            </div>
            <div className="activity-list">
              {RECENT_ACTIVITY.map(([text, when]) => (
                <article key={text}>
                  <span className="activity-dot"></span>
                  <p>
                    {text} <strong>{when}</strong>
                  </p>
                </article>
              ))}
            </div>
          </section>
        </section>

        {/* ------------------------------------------------------ bookings -- */}
        <section
          className={`admin-section${section === 'bookings' ? ' active' : ''}`}
          data-panel="bookings"
        >
          <AdminHeading
            eyebrow="Bookings"
            title="Booking requests"
            blurb="Review each lesson request, assign a tutor, approve, reject, or mark completed."
          />

          <FilterTabs
            filters={BOOKING_FILTERS}
            active={bookingFilter}
            onChange={setBookingFilter}
            group="bookings"
          />

          <section className="admin-table-card surface-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Schedule</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody data-bookings-table>
                  {bookings.map((booking, index) => {
                    const status = booking.status.toLowerCase()
                    return (
                      <tr
                        data-status={status}
                        key={booking.reference_code}
                        /* The original filtered by setting `row.hidden`, which
                           keeps every row in the DOM. Same here. */
                        hidden={bookingFilter !== 'all' && status !== bookingFilter}
                      >
                        <td>{booking.reference_code}</td>
                        <td>{booking.student.name}</td>
                        <td>{booking.course.course_name}</td>
                        <td>{booking.preferred_days}</td>
                        <td>{booking.session_type}</td>
                        <td>{formatDate(booking.start_date)}</td>
                        <td>
                          <span className={`status ${booking.status}`}>{booking.status}</span>
                        </td>
                        <td>
                          <button
                            className="table-action"
                            type="button"
                            data-review="booking"
                            data-index={index}
                            onClick={() => openBookingPanel(booking)}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        {/* ------------------------------------------------------- parents -- */}
        <section
          className={`admin-section${section === 'parents' ? ' active' : ''}`}
          data-panel="parents"
        >
          <AdminHeading
            eyebrow="Parents"
            title="Registered Parents"
            blurb="Open a parent record to view booking history and contact details."
          />

          <section className="admin-table-card surface-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Bookings</th>
                    <th>Child/Student</th>
                    <th>Date Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody data-parents-table>
                  {parents.map((parent, index) => {
                    const history = parentBookings[index] || []
                    return (
                      <Fragment key={parent.username}>
                        <tr className="parent-row" data-parent={parent.username}>
                          <td>{parent.username}</td>
                          <td>{parent.email}</td>
                          <td>{parent.phone}</td>
                          <td>{history.length}</td>
                          <td>{parent.children.length}</td>
                          <td>{formatDate(parent.created_at)}</td>
                          <td>
                            <button
                              className="table-action"
                              type="button"
                              data-review="parent"
                              onClick={() => toggleParent(parent.username)}
                            >
                              History
                            </button>
                          </td>
                        </tr>
                        {/* `.parent-history-row` / `.parent-history` have no CSS
                            of their own — admin.css only defines the equivalent
                            `.student-*` classes, which nothing uses. So this
                            block is unstyled, exactly as in the original. */}
                        <tr
                          className={`parent-history-row${
                            expandedParents.has(parent.username) ? '' : ' inactive'
                          }`}
                        >
                          <td colSpan="6">
                            <div className="parent-history">
                              <strong>Booking history</strong>
                              {toList(history).map((booking) => (
                                <p key={booking.reference_code}>
                                  {booking.reference_code} - {booking.course.course_name} -{' '}
                                  {booking.status}
                                </p>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        {/* ------------------------------------------------------ students -- */}
        <section
          className={`admin-section${section === 'students' ? ' active' : ''}`}
          data-panel="students"
        >
          <AdminHeading
            eyebrow="Students"
            title="Registered Students"
            blurb="Review Students and their Parents"
          />

          <section className="admin-table-card surface-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Age</th>
                    {/* "Disablities" is the original's typo, kept. */}
                    <th>Disablities</th>
                    <th>Parent Name</th>
                    <th>Parent Email</th>
                    <th>Parent Phone</th>
                  </tr>
                </thead>
                <tbody data-students-table>
                  {students.map((student) => (
                    <tr
                      className="student-row"
                      data-student={student.name}
                      key={`${student.name}-${student.parent.parent_email}`}
                    >
                      <td>{student.name}</td>
                      <td>{student.age}</td>
                      <td>{student.disabilities}</td>
                      <td>{student.parent.parent_name}</td>
                      <td>{student.parent.parent_email}</td>
                      <td>{student.parent.parent_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        {/* -------------------------------------------------------- tutors -- */}
        <section
          className={`admin-section${section === 'tutors' ? ' active' : ''}`}
          data-panel="tutors"
        >
          <AdminHeading
            eyebrow="Tutors"
            title="Approved tutors"
            blurb="Active tutors available for admin assignment."
          />

          {/* admin.html left four hardcoded tutor cards here inside a broken
              comment (a trailing `-->` with no opening `<!--`, and one
              `</article>` without its opening tag). admin.js overwrote the whole
              container on load, so none of it was ever really seen. Only the API
              tutors are rendered here.

              The subject line and session count are hardcoded for every card in
              the original — the API fields for them are not wired up. */}
          <section className="tutor-grid">
            {tutors.map((tutor) => (
              <article className="admin-tutor-card surface-card" key={tutor.tutor_id}>
                <div className="admin-tutor-card-profile-pic">
                  <img
                    src={tutor.profile_pic || '/assets/images/avatars/default_avatar.png'}
                    alt={tutor.tutor_name}
                  />
                </div>
                <div>
                  <h2>{tutor.tutor_name}</h2>
                  <p>Mathematics, Physics</p>
                  <strong>18 sessions assigned</strong>
                </div>
              </article>
            ))}
          </section>
        </section>

        {/* -------------------------------------------------- applications -- */}
        <section
          className={`admin-section${section === 'applications' ? ' active' : ''}`}
          data-panel="applications"
        >
          <AdminHeading
            eyebrow="Tutor applications"
            title="Applications queue"
            blurb="Review new tutor applications, approve suitable tutors, or reject with a reason."
          />

          <FilterTabs
            filters={APPLICATION_FILTERS}
            active={applicationFilter}
            onChange={setApplicationFilter}
            group="applications"
          />

          <section className="admin-table-card surface-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subjects</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody data-applications-table>
                  {applications.map((application) => (
                    <tr
                      data-status={application.status}
                      key={application.id}
                      /* Bookings lowercase their status for filtering, the
                         applications table does not. Kept as-is. */
                      hidden={
                        applicationFilter !== 'all' && application.status !== applicationFilter
                      }
                    >
                      <td>{application.applicant_name}</td>
                      <td>{application.subjects_taught}</td>
                      <td>{application.qualification}</td>
                      <td>{application.experience_years}</td>
                      <td>{formatDate(application.created_at)}</td>
                      <td>
                        <span className={`status ${application.status}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="table-action"
                          type="button"
                          data-review="application"
                          onClick={() => openApplicationPanel(application)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      <div
        className={`admin-overlay${panel ? ' active' : ''}`}
        onClick={() => setPanel(null)}
      ></div>

      <aside className={`review-panel${panel ? ' active' : ''}`} aria-hidden={!panel}>
        <button
          className="panel-close"
          type="button"
          aria-label="Close review panel"
          onClick={() => setPanel(null)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="panel-content" data-panel-content>
          {panel?.type === 'booking' && (
            <BookingPanel
              booking={panel.record}
              tutorOptions={panel.tutorOptions}
              onDecided={refreshBookings}
            />
          )}
          {panel?.type === 'application' && (
            <ApplicationPanel application={panel.record} onDecided={refreshApplications} />
          )}
        </div>
      </aside>

      <LoadingState active={loading} />
    </div>
  )
}

/* -------------------------------------------------------------- helpers ---- */

/** The API returns arrays, but the original wrapped every read in
 *  Object.values() to tolerate an object keyed by id. Same tolerance here, plus
 *  a null guard, since each adminAPI call resolves to null on failure. */
function toList(value) {
  if (!value) return []
  return Array.isArray(value) ? value : Object.values(value)
}

function handleActivate(event, callback) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}

function AdminHeading({ eyebrow, title, blurb }) {
  return (
    <div className="admin-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{blurb}</p>
      </div>
    </div>
  )
}

function FilterTabs({ filters, active, onChange, group }) {
  return (
    <div className="filter-tabs" data-filter-group={group}>
      {filters.map((filter) => (
        <button
          className={`filter-btn${active === filter ? ' active' : ''}`}
          type="button"
          data-filter={filter}
          key={filter}
          onClick={() => onChange(filter)}
        >
          {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- panels ------ */

function BookingPanel({ booking, tutorOptions, onDecided }) {
  const needsMeetingLink = booking.session_type === 'online' && !booking.meeting_link

  const [assignedTutor, setAssignedTutor] = useState(tutorOptions[0]?.tutor_id ?? '')
  const [meetingLink, setMeetingLink] = useState('')

  return (
    <>
      <div className="panel-header">
        <p className="eyebrow">Booking review</p>
        <h2>{booking.reference_code}</h2>
      </div>

      <section className="panel-block">
        <h3>Full booking details</h3>
        <dl className="detail-list">
          <Detail term="Student" value={booking.student.name} />
          <Detail term="Parent" value={booking.parent.name} />
          <Detail term="Phone" value={booking.parent.phone} />
          <Detail term="Subject" value={booking.course.course_name} />
          <Detail term="Schedule" value={booking.preferred_days} />
          <Detail term="Location" value={booking.session_type} />
          {booking.session_type === 'online' && (
            <Detail term="Meeting Link" value={booking.meeting_link || 'no meeting link'} />
          )}
          <Detail term="Start Date" value={formatDate(booking.start_date)} />
          <Detail term="Status" value={booking.status} />
          <Detail term="Notes/Message" value={booking.notes || 'no message'} />
        </dl>
      </section>

      <section className="panel-block">
        {needsMeetingLink && (
          <>
            <h3>Set Meeting Link</h3>
            <label>
              <input
                type="url"
                className="form-control"
                data-meeting-link
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(event) => setMeetingLink(event.target.value)}
              />
            </label>
          </>
        )}

        <h3>Assign tutor</h3>
        <label>
          Tutor filtered by subject
          <select
            className="form-control"
            data-assigned-tutor
            value={assignedTutor}
            onChange={(event) => setAssignedTutor(event.target.value)}
          >
            {tutorOptions.map((tutor) => (
              <option data-tutor-assigned value={tutor.tutor_id} key={tutor.tutor_id}>
                {tutor.tutor_name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <DecisionBlock
        onSubmit={(action, reason) =>
          bookingDecision(
            booking.reference_code,
            action,
            /* Field names preserved: approve sends
               `{ assignedTutor, meetingLink }`, reject sends the bare reason
               string as the whole body. */
            action === 'approve' ? { assignedTutor, meetingLink } : reason,
          )
        }
        onDecided={onDecided}
      />

      {/* DEAD in the original: `.forward-card` is display:none until it gets
          `active`, and nothing ever added it. Kept so the panel's DOM matches.
          Note the copy interpolates `booking.phone`, which does not exist
          (`booking.parent.phone` does), so it would read "undefined" if shown. */}
      <section className="panel-block forward-card" data-forward-card>
        <h3>WhatsApp forward card</h3>
        <p data-forward-copy>
          Booking {booking.reference_code}: {booking.course.course_name} for{' '}
          {booking.student.name}. {booking.preferred_days}. {booking.session_type}. Parent
          contact: {String(booking.phone)}.
        </p>
        <a
          className="cta-btn gold"
          href={`https://wa.me/?text=Booking%20${booking.reference_code}%20approved`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Forward on WhatsApp
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      </section>
    </>
  )
}

function ApplicationPanel({ application, onDecided }) {
  return (
    <>
      <div className="panel-header">
        <p className="eyebrow">Tutor application</p>
        <h2>{application.applicant_name}</h2>
      </div>

      <section className="panel-block">
        <h3>Full application details</h3>
        <dl className="detail-list">
          <Detail term="Subjects" value={application.subjects_taught} />
          <Detail term="Qualification" value={application.qualification} />
          <Detail term="Experience years" value={application.experience_years} />
          <Detail term="Teaching preference" value={application.teaching_preference} />
          {/* Raw timestamp, not formatDate() — as in the original. */}
          <Detail term="Date applied" value={application.created_at} />
          <Detail term="Status" value={application.status} />
        </dl>
      </section>

      <section className="panel-block">
        <h3>Experience Summary</h3>
        <p>{application.teaching_experience}</p>
      </section>

      <section className="panel-block">
        <h3>Documents</h3>
        {/* "Experence" is the original's typo, kept. */}
        <a href={application.experience_proof_url} className="cta-btn blue">
          Download Experence proof
        </a>
      </section>

      <DecisionBlock
        onSubmit={(action, reason) => tutorApplicationDecision(application.id, action, reason)}
        onDecided={onDecided}
      />
    </>
  )
}

function Detail({ term, value }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/**
 * Approve / reject controls, shared by both panels.
 *
 * Reject is two-stage, as in the original: the first click reveals the reason
 * field and focuses it, and only a second click with a non-empty reason submits.
 *
 * Two fixes over the original, both in failure paths only:
 *  - it left the button disabled and reading "Processing..." forever when the
 *    request failed, with no way to retry;
 *  - its click handler was bound to the whole panel and matched any `.cta-btn`,
 *    so clicking "Download Experence proof" (also a `.cta-btn`) threw on a null
 *    textarea. Handlers are on the actual buttons here.
 */
function DecisionBlock({ onSubmit, onDecided }) {
  const [reasonVisible, setReasonVisible] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState({ text: '', tone: '' })
  const [pendingAction, setPendingAction] = useState(null)

  async function handleDecision(action) {
    if (action === 'reject' && !reasonVisible) {
      setReasonVisible(true)
      return
    }
    if (action === 'reject' && !reason) return

    setPendingAction(action)
    const { valid, message: apiMessage } = await onSubmit(action, reason)
    setPendingAction(null)
    setMessage({ text: apiMessage, tone: valid ? 'success' : 'error' })

    if (valid) {
      await onDecided()
    }
  }

  return (
    <section className="panel-block">
      <h3>Decision</h3>
      <div className={`reason-field${reasonVisible ? '' : ' inactive'}`}>
        <label>
          Optional rejection reason
          <textarea
            className="form-control"
            placeholder="Add a short reason for rejection"
            value={reason}
            autoFocus={reasonVisible}
            onChange={(event) => setReason(event.target.value)}
          ></textarea>
        </label>
      </div>
      <div className="panel-actions">
        <button
          className="cta-btn approve-btn"
          type="button"
          disabled={pendingAction !== null}
          onClick={() => handleDecision('approve')}
        >
          {pendingAction === 'approve' ? 'Processing...' : 'Approve'}
        </button>
        <button
          className="cta-btn reject-btn"
          type="button"
          disabled={pendingAction !== null}
          onClick={() => handleDecision('reject')}
        >
          {pendingAction === 'reject' ? 'Processing...' : 'Reject'}
        </button>
        {/* "decison" is the original's typo; it is only ever seen if the API
            returns no message. */}
        <p className={`msg ${message.tone}${message.text ? '' : ' inactive'}`}>
          {message.text || 'Failed to update admin decison'}
        </p>
      </div>
    </section>
  )
}
