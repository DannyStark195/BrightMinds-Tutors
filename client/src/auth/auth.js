/**
 * Auth token handling — ported from the original client's js/auth/auth.js.
 *
 * The original's redirect helpers (loginRequired / redirectIfLoggedIn /
 * adminLoginRequired) are replaced by route guards, which is the React
 * equivalent and keeps redirects declarative:
 *   - components/ProtectedRoute.jsx  (parents)
 *   - components/AdminRoute.jsx      (admins)
 *
 * logout() still does a full-page replace rather than a router navigation:
 * reloading is what tears down every bit of in-memory user state, which is
 * exactly what you want when signing out.
 */

export const USER_TOKEN_KEY = 'brightminds-user-token'
export const ADMIN_TOKEN_KEY = 'brightminds-admin-token'

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY)
}

export function setUserToken(token) {
  localStorage.setItem(USER_TOKEN_KEY, token)
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function isAuthenticated() {
  return !!getUserToken()
}

export function isAdminLoggedIn() {
  return !!getAdminToken()
}

export function logout() {
  localStorage.removeItem(USER_TOKEN_KEY)
  window.location.replace('/')
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  window.location.replace('/admin-login')
}
