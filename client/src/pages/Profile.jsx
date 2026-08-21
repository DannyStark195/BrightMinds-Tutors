import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { changeProfileAvatar, editUserProfile, uploadFile } from '../api/api.js'
import { useUser } from '../auth/UserContext.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { collectData, validatePhone } from '../utils/formHelpers.js'

/**
 * Parent profile — ported from the original client's profile.html plus
 * js/scripts/profile.js.
 *
 * The original fetched the profile itself (getUserProfile) and the header
 * fetched it again; here both read the shared `useUser()` profile, and the
 * page's own re-fetches become `refreshUser()`.
 */

const DEFAULT_AVATAR = '/assets/images/avatars/default_avatar.png'

/* The three inputs renderUserprofile() wrote into `#profile-fields`. `name` is
   also the API payload key — collectData() reads the form, so these names are
   what `edit-profile` receives (username, phone, bio), unchanged. */
const PROFILE_FIELDS = [
  { name: 'username', label: 'Full name', type: 'text', required: true },
  { name: 'phone', label: 'Phone number', type: 'tel', required: true },
  { name: 'bio', label: 'Bio', type: 'text', required: false },
]

/* Static in the original markup. profile.js looked `#info-account-status` and
   `#info-current-plan` up but never wrote to them, so these two strings are
   what the card always showed. The ids are kept for DOM parity. */
const SUMMARY_ITEMS = [
  {
    icon: 'fa-solid fa-user-check',
    label: 'Account status',
    value: 'Active parent account',
    id: 'info-account-status',
  },
  {
    icon: 'fa-solid fa-book-open-reader',
    label: 'Current plan',
    value: 'Standard mathematics',
    id: 'info-current-plan',
  },
]

const EMPTY_FORM = { username: '', phone: '', bio: '' }

export default function Profile() {
  useDocumentTitle('Profile | BrightMinds Tutors')

  const { user, setUser, loading, refreshUser } = useUser()

  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [profileError, setProfileError] = useState('')

  const fileInputRef = useRef(null)
  /* The original's module-level `currentAvatarImgMeta`: a
     `name-size-lastModified` fingerprint of the picture already on the account,
     used to skip re-uploading the very same file. Starts as '' and is replaced
     by the stored value (or `null`, when nothing is stored) on every render of
     the profile. */
  const avatarMetaRef = useRef('')

  /* renderUserprofile(): every time a fresh profile lands it rewrote the three
     inputs from it and re-read the stored fingerprint. Running on `user` covers
     the initial load, Cancel, and a successful save — the three moments the
     original called it. */
  useEffect(() => {
    if (!user) return
    setForm({
      username: user.username ?? '',
      phone: user.phone || '',
      bio: user.bio || '',
    })
    avatarMetaRef.current = localStorage.getItem(
      `brightminds_currentAvatar_meta_${user.username}`,
    )
  }, [user])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleAvatarUpload(event) {
    const input = event.target
    const file = input.files[0]
    if (!file) return

    setAvatarError('')
    setUploading(true)

    try {
      const selectedFileMeta = `${file.name}-${file.size}-${file.lastModified}`

      /* Same file as the one already on the account: the original bailed out
         here silently — the loader appears for a frame and nothing else
         happens, not even a message. Kept. */
      if (selectedFileMeta === avatarMetaRef.current) {
        return
      }

      const { valid, message, secure_url } = await uploadFile(file)

      if (!(valid && secure_url)) {
        setAvatarError(message)
        return
      }

      const avatarResponse = await changeProfileAvatar(secure_url)

      if (!(avatarResponse.valid && avatarResponse.profile_pic_url)) {
        setAvatarError(avatarResponse.message)
        return
      }

      /* `profileAvatarImg.src = avatarResponse.profile_pic_url` — the new
         picture goes up immediately, before the re-fetch below. Through the
         shared user it also swaps the header avatar. */
      setUser((current) => ({ ...current, profile_pic: avatarResponse.profile_pic_url }))
      avatarMetaRef.current = selectedFileMeta
      /* The original built this key from `#profile-name`'s text, i.e. the
         rendered username. */
      localStorage.setItem(
        `brightminds_currentAvatar_meta_${user?.username ?? ''}`,
        selectedFileMeta,
      )
    } catch {
      setAvatarError('Avatar upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Lets the same file be picked again and fire `change`.
      input.value = ''
    }

    /* The original's `await renderHeader()` sat after the try/finally, so the
       early `return`s above skipped it: only the success and thrown-error paths
       re-read the profile. `refreshUser()` is that re-read. */
    await refreshUser()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const data = collectData(event.currentTarget)

    /* validatePhone() returns a boolean, so this is truthy when the phone is
       VALID — the original named it `phoneError` but tested it the right way
       round, so the guard below is its real behaviour, not a bug. */
    const phoneError = validatePhone(data.phone)

    if (!phoneError) {
      setProfileError('This phone number is invalid')
      return
    }

    const { valid, message } = await editUserProfile(data)

    if (!valid) {
      setProfileError(message)
      return
    }

    /* No success message and no clearing of `profileError` — the original only
       ever wrote to that <p> on failure and never re-hid it, so an earlier
       error stays on screen after a successful save. Reproduced as-is.

       The original called renderUserprofile() here, which re-fetched the
       profile for the page only; the header kept its stale name until the next
       navigation. refreshUser() re-fetches the one shared profile, so the
       fields and the header both land on the saved values. */
    await refreshUser()
  }

  function handleCancel() {
    // cancelChangesBtn was wired straight to renderUserprofile(): re-fetch,
    // then rewrite the inputs from the server's copy.
    refreshUser()
  }

  return (
    <DashboardLayout className="profile-page page-shell">
      <main className="profile-main page-main">
        <section className="profile-hero surface-card">
          {/* `is-uploading` is inert — the only rule for it in the original
              stylesheet is commented out — but it is still what the DOM
              carried while an upload was in flight. */}
          <div className={`profile-avatar${uploading ? ' is-uploading' : ''}`}>
            <img
              src={user?.profile_pic || DEFAULT_AVATAR}
              alt={user ? `${user.username} profile picture` : "user's profile picture"}
              id="profile-avatar-img"
            />
            <div
              className={`profile-avatar-loader${uploading ? '' : ' inactive'}`}
              aria-hidden="true"
            >
              <span></span>
            </div>
            <button
              className="profile-avatar-camera change-profile-avatar-btn"
              type="button"
              aria-label="Change profile picture"
              disabled={uploading}
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fa-solid fa-camera"></i>
            </button>
            <input
              type="file"
              className="profile-avatar-input"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
            />
          </div>
          {/* The original shipped "Failed to upload image to cloud storage." as
              this element's text, but every path that reveals it overwrites the
              text first, so that string was never seen. */}
          <p className={`msg error avatar-upload-error${avatarError ? '' : ' inactive'}`}>
            {avatarError}
          </p>
          <div>
            <p className="eyebrow">My profile</p>
            <h1 id="profile-name">{user?.username}</h1>
            <p>
              Manage your contact details, student information, lesson preferences, and
              account settings from one place.
            </p>
          </div>
          <div className="profile-actions">
            <Link to="/book" className="cta-btn gold">
              Book a tutor
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <Link to="/dashboard">
              <button className="cta-btn blue" type="button">
                Dashboard
              </button>
            </Link>
          </div>
        </section>

        <section className="profile-layout">
          <div className="profile-stack" id="profile-stack">
            <form
              className="profile-card surface-card"
              id="profile-form"
              onSubmit={handleSubmit}
            >
              <div className="section-heading">
                <p className="eyebrow">Parent details</p>
                <h2>Account information</h2>
              </div>
              {/* Empty until the profile resolves, as in the original. */}
              <div className="profile-fields" id="profile-fields">
                {user &&
                  PROFILE_FIELDS.map((field) => (
                    <label className="profile-field" key={field.name}>
                      <span>{field.label}</span>
                      <input
                        type={field.type}
                        className="form-control"
                        value={form[field.name]}
                        name={field.name}
                        required={field.required}
                        onChange={handleFieldChange}
                      />
                    </label>
                  ))}
              </div>
              <p className={`msg error${profileError ? '' : ' inactive'}`}>
                {profileError}
              </p>
              <div className="profile-card-footer">
                <button
                  className="cta-btn blue cancel-changes-btn"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button className="cta-btn gold" type="submit">
                  Save changes
                </button>
              </div>
            </form>
          </div>

          <aside className="profile-side">
            <article className="profile-summary-card surface-card">
              <h2>Profile summary</h2>
              <div className="profile-summary-list">
                {SUMMARY_ITEMS.map((item) => (
                  <div className="profile-summary-item" key={item.id}>
                    <i className={`${item.icon} icon-badge`}></i>
                    <div>
                      <p>{item.label}</p>
                      <strong id={item.id}>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="profile-note surface-card">
              <h2>Need help?</h2>
              <p>
                Contact BrightMinds Tutors if your child changes school level, location, or
                subject needs before the next billing cycle.
              </p>
              <a href="https://wa.me/2348092812010" className="cta-btn blue">
                Chat on WhatsApp
              </a>
            </article>
            {/* DEAD CONTROL, kept because the original shipped it. profile.js
                looked `#delete-account-btn` up and never bound anything to it,
                so clicking Delete did nothing. The copy ("Permenly") is
                verbatim too. */}
            <article className="profile-note surface-card cancel-card">
              <h2>Delete Account</h2>
              <p>Permenly delete your account and all your information.</p>
              <button type="button" className="cta-btn danger" id="delete-account-btn">
                Delete
              </button>
            </article>
          </aside>
        </section>
      </main>

      <LoadingState active={loading} />
    </DashboardLayout>
  )
}
