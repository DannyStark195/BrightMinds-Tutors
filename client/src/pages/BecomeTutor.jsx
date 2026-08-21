import { useState } from 'react'

import { createTutorApplication, uploadFile } from '../api/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { subscribeUserToPush } from '../push.js'
import { collectData, validateFile } from '../utils/formHelpers.js'

/**
 * Tutor application form — ported from the original client's become-tutor.html
 * plus js/scripts/becomeTutor.js.
 *
 * Despite being linked from the public nav, this was a signed-in page: it
 * loaded js/auth/dAuth.js (loginRequired) and js/components/dNavMenu.js (the
 * dashboard header) and had no footer. So it sits behind <ProtectedRoute /> in
 * DashboardLayout, and the auth check is the router's job, not this file's.
 *
 * The original's own `css/dashboard.css` <link> was commented out, so none of
 * those rules ever applied here — src/styles/become-tutor.css mirrors that.
 */

/* Label / payload value pairs. The visible label is not always the value the
   API receives ("Maths" is sent as "Mathematics"), which is why these are
   pairs rather than plain strings. Order matters: it is the order the selected
   subjects are sent in. */
const SUBJECTS = [
  { label: 'Maths', value: 'Mathematics' },
  { label: 'English', value: 'English' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Biology', value: 'Biology' },
  { label: 'Computer Science', value: 'Computer Science' },
]

const PROCESS_STEPS = [
  {
    icon: 'fa-solid fa-file-lines',
    title: 'Apply',
    description:
      'Share your subject strengths, credentials, and preferred teaching schedule.',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Verify',
    description:
      'We review your details and confirm your teaching experience before approving your profile.',
  },
  {
    icon: 'fa-solid fa-chalkboard-user',
    title: 'Teach',
    description:
      'Receive suitable student matches and manage lessons through BrightMinds Tutors.',
  },
]

const QUALIFICATIONS = [
  { value: '', label: 'Select qualification' },
  { value: 'BSc', label: 'B.Sc' },
  { value: 'BEd', label: 'B.Ed' },
  { value: 'BA', label: 'B.A' },
  { value: 'HND', label: 'HND' },
  { value: 'OND', label: 'OND' },
  { value: 'NCE', label: 'NCE' },
  { value: 'MSc', label: 'M.Sc' },
  { value: 'MEd', label: 'M.Ed' },
  { value: 'PhD', label: 'PhD' },
  { value: 'Professional Certification', label: 'Professional Certification' },
]

const NO_FILE_CHOSEN = 'No file chosen'

/** Kept verbatim from the original: the chosen filename is cut to 8 characters. */
function truncateText(text, length) {
  if (text.length <= length) {
    return text
  }
  return text.substring(0, length) + '...'
}

export default function BecomeTutor() {
  useDocumentTitle('Become a Tutor | BrightMinds Tutors')

  const [selected, setSelected] = useState(() => new Set())
  const [fileName, setFileName] = useState(NO_FILE_CHOSEN)
  const [subjectError, setSubjectError] = useState('')
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  /* On success the original wrote the API's message into the SAME <p> it used
     for file errors, adding `success` on top of the existing `error` class.
     Because `.msg.success` is declared after `.msg.error` in the design system,
     the text renders green. Reproduced rather than "improved", because it is
     what the page actually showed. */
  const [fileSuccess, setFileSuccess] = useState('')

  /* The original rebuilt this list from the checked inputs on every change, so
     it was always in markup order regardless of click order. Deriving it from
     SUBJECTS keeps that, and keeps the payload byte-identical. */
  const selectedSubjects = SUBJECTS.filter(({ value }) => selected.has(value)).map(
    ({ value }) => value,
  )

  function toggleSubject(value) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  function handleProofChange(event) {
    const file = event.target.files && event.target.files[0]
    setFileName(file ? truncateText(file.name, 8) : NO_FILE_CHOSEN)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // Captured now: `currentTarget` is null once we start awaiting.
    const form = event.currentTarget

    /* The original passed a `subjectsTaught` extra into this first read and
       then never used it — only the file is needed at this point. */
    const proof = collectData(form).proofExperience
    const proofError = validateFile(proof)

    setSubjectError('')
    setFileError('')
    setFileSuccess('')

    if (!selectedSubjects.length) {
      setSubjectError('Select at least one subject')
      return
    }
    if (proofError) {
      setFileError(proofError)
      return
    }

    setSubmitting(true)

    const { valid: uploaded, message: uploadMessage, secure_url } = await uploadFile(proof)

    if (!(uploaded && secure_url)) {
      setFileError(uploadMessage)
      // The original returned here without restoring the button, leaving it
      // disabled and reading "Loading..." with no way to retry. See
      // docs/DEVIATIONS.md.
      setSubmitting(false)
      return
    }

    /* Payload field names are the form's `name` attributes plus these two
       extras, exactly as the original sent them. Flask is unchanged, so the
       shape stays put — including `proofExperience`, a File that JSON.stringify
       flattens to `{}`, and `tutorSubject`, which FormData collapses to the
       last checked subject. */
    const tutorData = collectData(form, { selectedSubjects, secure_url })

    const { valid, message } = await createTutorApplication(tutorData)
    setSubmitting(false)

    if (!valid) {
      setFileError(message)
      return
    }

    setFileSuccess(message)
    await subscribeUserToPush()
  }

  return (
    <DashboardLayout className="tutor-page page-shell">
      <main className="page-main">
        <div className="tutor-main">
          <section className="tutor-hero surface-card">
            <div className="hero-content">
              <p className="eyebrow">Tutor applications</p>
              <h1>Teach students who need your exact strengths</h1>
              <p>
                Set your subjects, preferred lesson format, and availability. Our team
                reviews applications before matching tutors with families.
              </p>
              <div className="hero-actions">
                <a href="#application" className="cta-btn gold">
                  Start application
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="hero-panel">
              <img src="/assets/images/tutors/emeka.jpg" alt="BrightMind tutor" />
              <div className="panel-stat">
                <span>3 steps</span>
                <p>Apply, verify, start teaching</p>
              </div>
            </div>
          </section>

          <section className="tutor-process" id="process">
            {PROCESS_STEPS.map((step) => (
              <article className="surface-card" key={step.title}>
                <i className={`${step.icon} icon-badge`}></i>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </article>
            ))}
          </section>

          <section className="application-section surface-card" id="application">
            <div className="section-heading">
              <p className="eyebrow">Application form</p>
              <h2>Tell us how you teach</h2>
            </div>
            <form className="tutor-form" onSubmit={handleSubmit}>
              <label htmlFor="teaching-level">
                Level you teach
                <select
                  className="form-control"
                  id="teaching-level"
                  name="teachingLevel"
                  required
                >
                  <option value="primary">Primary</option>
                  <option value="jss">JSS</option>
                  <option value="ss">SS</option>
                  <option value="uni">University</option>
                </select>
              </label>
              <label htmlFor="qualification">
                Qualification
                <select
                  className="form-control"
                  id="qualification"
                  name="qualification"
                  required
                >
                  {QUALIFICATIONS.map((qualification) => (
                    <option value={qualification.value} key={qualification.label}>
                      {qualification.label}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="lesson-format">
                Lesson format
                {/* No `value` attributes in the original, so the option text is
                    what gets submitted. */}
                <select
                  className="form-control"
                  id="lesson-format"
                  name="lessonFormat"
                  required
                >
                  <option>Physical and online</option>
                  <option>Physical only</option>
                  <option>Online only</option>
                </select>
              </label>
              <label htmlFor="years-experience">
                Years of experience
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 3"
                  id="years-experience"
                  name="yearsExperience"
                  min="0"
                  step="1"
                  required
                />
              </label>
              <div className="tutor-subjects">
                <p className="field-label">Subjects you can teach</p>
                <div className="pill-row tutor-subject-options">
                  {SUBJECTS.map(({ label, value }) => (
                    <label
                      className={`option-pill tutor-subject-option${
                        selected.has(value) ? ' active' : ''
                      }`}
                      key={value}
                    >
                      {label}
                      <input
                        type="checkbox"
                        name="tutorSubject"
                        value={value}
                        className="hidden-radio tutor-subject-btn"
                        checked={selected.has(value)}
                        onChange={() => toggleSubject(value)}
                      />
                    </label>
                  ))}
                </div>
                <p className={`msg error subject${subjectError ? '' : ' inactive'}`}>
                  {subjectError}
                </p>
              </div>
              <label className="wide" htmlFor="teaching-experience">
                Teaching experience
                <textarea
                  className="form-control"
                  placeholder="Summarize your experience, certifications, and what students can expect."
                  id="teaching-experience"
                  name="teachingExperience"
                  required
                ></textarea>
              </label>
              <label className="wide">
                Proof of experience
                <div className="upload-btn">
                  {/* The original had `for="proof-experience"` on this div. A
                      `for` attribute does nothing outside <label>, and it was
                      never needed: the file input is nested inside and made
                      invisible on top of the pill by
                      `.upload-btn input[type="file"]`, so the click lands on
                      the input itself. Classes stay — the pill's whole look is
                      `cta-btn blue`. */}
                  <div className="upload-label cta-btn blue">
                    <input
                      id="proof-experience"
                      type="file"
                      name="proofExperience"
                      onChange={handleProofChange}
                      required
                    />
                    Upload
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                  </div>
                  <span className="upload-filename" id="proof-name">
                    {fileName}
                  </span>
                </div>
                <p
                  className={`msg error file${fileSuccess ? ' success' : ''}${
                    fileError || fileSuccess ? '' : ' inactive'
                  }`}
                >
                  {fileError || fileSuccess}
                </p>
              </label>
              <button className="cta-btn gold" type="submit" disabled={submitting}>
                {submitting ? (
                  'Loading...'
                ) : (
                  <>
                    Submit application
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* DEAD MARKUP, kept because the original shipped it in the DOM.
            becomeTutor.js never removed this `inactive` class — on success it
            only wrote the API message into the `.msg.file` slot above — so this
            success panel was never visible. It stays permanently hidden here so
            the page looks and behaves as it did.

            To turn it on deliberately, drive `inactive` off submit state and
            add `inactive` to `.tutor-main`. Note the copy would need attention
            first: "Successfull" is a typo, and the "Back to dashboard" button
            links to `#process` rather than /dashboard. Both are kept verbatim
            because changing user-visible strings is the owner's call. */}
        <div className="alert tutor-application-success inactive">
          <div className="alert__hero">
            <div className="hero-content">
              <p className="eyebrow">Application Review</p>
              <h2>Application Successfull</h2>
              <p>Your application has been successfully sent.</p>
              <div className="hero-actions">
                <a href="#process" className="cta-btn gold">
                  Back to dashboard
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="alert__icon">
              <img src="/assets/icons/icon-checkbox-check.svg" alt="BrightMind tutor" />
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
