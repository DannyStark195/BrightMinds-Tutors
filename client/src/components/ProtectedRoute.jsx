import { Navigate, Outlet } from 'react-router-dom'

import { isAuthenticated } from '../auth/auth.js'
import { UserProvider } from '../auth/UserContext.jsx'

/**
 * Gate for the parent-facing pages, replacing the original client's
 * js/auth/dAuth.js -> loginRequired().
 *
 * Signed-out visitors land back on the home page with `?auth=required`, the
 * same query flag the original used, which makes Landing pop the login form.
 *
 * Wrapping the outlet in UserProvider means the profile is fetched once per
 * dashboard visit rather than once per page script.
 */
export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/?auth=required" replace />
  }

  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  )
}
