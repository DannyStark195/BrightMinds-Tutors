/**
 * Admin API client — ported from the original client's js/api/adminAPI.js.
 * Same endpoints, same return shapes; the token/header boilerplate that was
 * repeated in every function is factored into two helpers.
 */

import { getAdminToken, logoutAdmin } from '../auth/auth.js'

export const ADMIN_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}admin/`
    : 'https://brightminds-tutors.onrender.com/api/admin/'

const jsonHeaders = { 'Content-Type': 'application/json' }

function authHeaders() {
  return { ...jsonHeaders, Authorization: `Bearer ${getAdminToken()}` }
}

async function getAndPluck(path, field, { logoutOn401 = false } = {}) {
  try {
    const request = await fetch(`${ADMIN_BASE_URL}${path}`, {
      method: 'GET',
      headers: authHeaders(),
    })
    const response = await request.json()

    if (!request.ok) {
      if (logoutOn401 && request.status === 401) {
        logoutAdmin() // Clear data and boot them to login
      }
      throw new Error(response.error || `Failed to fetch ${field}`)
    }
    return field ? response[field] : response
  } catch {
    return null
  }
}

async function postForResult(path, data, fallbackError) {
  try {
    const request = await fetch(`${ADMIN_BASE_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const response = await request.json()

    if (!request.ok) {
      throw new Error(response.error || fallbackError)
    }
    return { valid: true, message: response.message }
  } catch (error) {
    return { valid: false, message: error.message }
  }
}

export async function loginUser(user) {
  try {
    const request = await fetch(`${ADMIN_BASE_URL}auth/login`, {
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

export async function getAdmin() {
  return getAndPluck('admin', 'admin', { logoutOn401: true })
}

export async function getBookings() {
  return getAndPluck('bookings', 'bookings')
}

/** Returns the whole response body — the original did too. */
export async function getParentsAndBookings() {
  return getAndPluck('parents', null)
}

export async function getStudents() {
  return getAndPluck('students', 'students')
}

export async function getTutors() {
  return getAndPluck('tutors', 'tutors')
}

export async function getTutorApplications() {
  return getAndPluck('tutor-applications', 'applications')
}

export async function getTutorOptions(course) {
  return getAndPluck(`tutor-options/${course}`, 'options')
}

export async function bookingDecision(ref, action, data) {
  return postForResult(
    `booking-decision/${ref}/${action}`,
    data,
    'Failed to update admin decision',
  )
}

export async function tutorApplicationDecision(applicationId, action, reason) {
  return postForResult(
    `tutor-application-decision/${applicationId}/${action}`,
    reason,
    'Failed to update admin decision',
  )
}
