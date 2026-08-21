/**
 * Parent-facing API client — ported from the original client's js/api/api.js.
 *
 * Every exported function keeps the exact return shape the original had (some
 * resolve to `null` on failure, others to `{ valid, message }`), so pages read
 * results the same way they always did. What changed is the boilerplate: the
 * repeated token lookup and header objects are now three small helpers.
 *
 * BASE_URL is overridable via VITE_API_BASE_URL (see .env.example) and falls
 * back to production, so a fresh clone works without any setup.
 */

import { getUserToken, logout } from '../auth/auth.js'

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://brightminds-tutors.onrender.com/api/'

const jsonHeaders = { 'Content-Type': 'application/json' }

function authHeaders() {
  return { ...jsonHeaders, Authorization: `Bearer ${getUserToken()}` }
}

/**
 * GET a resource and pluck one field off the response.
 * Mirrors the original's behaviour: resolve to null on any failure, and sign
 * the user out on a 401 when the original did so.
 */
async function getAndPluck(path, field, { logoutOn401 = false } = {}) {
  try {
    const request = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: authHeaders(),
    })
    const response = await request.json()

    if (!request.ok) {
      if (logoutOn401 && request.status === 401) {
        logout() // Clear data and boot them to login
      }
      throw new Error(response.error || `Failed to fetch ${field}`)
    }
    return response[field]
  } catch {
    return null
  }
}

/**
 * POST JSON and normalise to { valid, message }, the shape the original used
 * for every mutating call.
 */
async function postForResult(path, data, fallbackError, { auth = true } = {}) {
  try {
    const request = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: auth ? authHeaders() : jsonHeaders,
      body: JSON.stringify(data),
    })
    const response = await request.json()

    if (!request.ok) {
      throw new Error(response.error || fallbackError)
    }
    return { valid: true, message: response.message, response }
  } catch (error) {
    return { valid: false, message: error.message }
  }
}

/* ---------------------------------------------------------------- auth ---- */

export async function signupUser(data) {
  const result = await postForResult('auth/signup', data, 'Signup failed', { auth: false })
  if (!result.valid) return { valid: false, message: result.message }
  return { valid: true, registrationToken: result.response.reg_token }
}

export async function loginUser(user) {
  try {
    const request = await fetch(`${BASE_URL}auth/login`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(user),
    })
    const response = await request.json()

    if (!request.ok) {
      throw new Error(response.error || 'Login failed')
    }
    return response
  } catch {
    return null
  }
}

export async function testAPI() {
  const request = await fetch(`${BASE_URL}`)
  request.json()
}

export async function verifyOTPCode({ email, code, registrationToken }) {
  const result = await postForResult(
    'auth/verify-code',
    { email, code, reg_token: registrationToken },
    'Verification failed.',
    { auth: false },
  )
  return { valid: result.valid, message: result.message }
}

export async function forgotPassword({ email }) {
  const result = await postForResult(
    'auth/forgot-password',
    { email },
    'Password reset request failed.',
    { auth: false },
  )
  if (!result.valid) return { valid: false, message: result.message }
  return {
    valid: true,
    message: result.message,
    registrationToken: result.response.reg_token,
  }
}

export async function resetPassword({ email, code, newPassword, registrationToken }) {
  const result = await postForResult(
    'auth/reset-password',
    { email, code, new_password: newPassword, reg_token: registrationToken },
    'Password reset failed.',
    { auth: false },
  )
  return { valid: result.valid, message: result.message }
}

/* ------------------------------------------------------------- profile ---- */

export async function getUserProfile() {
  return getAndPluck('profile', 'user', { logoutOn401: true })
}

export async function editUserProfile(data) {
  const { valid, message } = await postForResult(
    'edit-profile',
    data,
    'Failed to edit user profile',
  )
  return { valid, message }
}

export async function uploadFile(file) {
  const data = new FormData()
  data.append('profile_pic', file)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)

  try {
    const request = await fetch(`${BASE_URL}upload-file`, {
      method: 'POST',
      headers: {
        // Content-Type omitted so the browser declares boundary markers automatically
        Authorization: `Bearer ${getUserToken()}`,
      },
      body: data,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    const response = await request.json()

    if (!request.ok) {
      throw new Error(response.error || 'Failed to upload file')
    }
    return { valid: true, message: response.message, secure_url: response.secure_url }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { valid: false, message: 'Your connection is too slow. Try again later.' }
    }
    return { valid: false, message: error.message }
  }
}

export async function changeProfileAvatar(secure_url) {
  const result = await postForResult('upload-avatar', { secure_url }, 'Failed to upload file')
  if (!result.valid) return { valid: false, message: result.message }
  return {
    valid: true,
    message: result.message,
    profile_pic_url: result.response.profile_pic_url,
  }
}

/* ------------------------------------------------------------- reviews ---- */

export async function getBookingsForReview() {
  return getAndPluck('bookings/unreviewed', 'bookings_for_review', { logoutOn401: true })
}

export async function getReviewedBookings() {
  return getAndPluck('bookings/reviewed', 'reviewed_bookings', { logoutOn401: true })
}

export async function createReview(data) {
  const { valid, message } = await postForResult(
    'create-review',
    data,
    'Failed to create review',
  )
  return { valid, message }
}

export async function getFeaturedTestimonials() {
  try {
    const request = await fetch(`${BASE_URL}featured-testimonials`)
    const response = await request.json()

    if (!response.success || !response.testimonials || response.testimonials.length === 0) {
      return null
    }
    return response.testimonials
  } catch {
    return null
  }
}

/* ------------------------------------------------------------ bookings ---- */

export async function createBooking(data) {
  const { valid, message } = await postForResult(
    'create-booking',
    data,
    'Failed to book tutor',
  )
  return { valid, message }
}

export async function getBookings() {
  return getAndPluck('bookings', 'bookings')
}

export async function getBookingDetails(reff) {
  return getAndPluck(`booking-details/${reff}`, 'bookings')
}

export async function toggleFirstSessionHeld(data) {
  try {
    const request = await fetch(`${BASE_URL}first-session-held`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const response = await request.json()

    if (!request.ok) {
      throw new Error(response.error || 'Failed to update first session status')
    }
    return response.first_session_held
  } catch (error) {
    return error.message
  }
}

/* ------------------------------------------------------------ payments ---- */

export async function getPaymentDetails(reff) {
  return getAndPluck(`get_payment/${reff}`, 'payment_details')
}

export async function makePayment(data) {
  const result = await postForResult('make_payment', data, 'Failed to make payment')
  if (!result.valid) return { valid: false, message: result.message }
  return {
    valid: true,
    message: result.message,
    reference: result.response.payment_reference,
  }
}

export async function getPayments() {
  return getAndPluck('my-payments', 'payments')
}

export async function getReceipt(ref) {
  return getAndPluck(`my-payments/receipt/${ref}`, 'receipt')
}

export async function downloadReceipt(payment_ref) {
  try {
    const response = await fetch(`${BASE_URL}my-payments/${payment_ref}/download-receipt`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${getUserToken()}` },
    })

    if (!response.ok) {
      throw new Error('Failed to download receipt')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${payment_ref}.pdf`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch {
    return null
  }
}

/* ------------------------------------------------------ tutor application -- */

export async function createTutorApplication(data) {
  const { valid, message } = await postForResult(
    'create-tutor-application',
    data,
    'Failed to submit application',
  )
  return { valid, message }
}
