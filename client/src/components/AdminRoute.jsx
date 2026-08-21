import { Navigate, Outlet } from 'react-router-dom'

import { isAdminLoggedIn } from '../auth/auth.js'

/**
 * Gate for the admin pages, replacing the original client's
 * adminLoginRequired(). Admins use a separate token, so this check is
 * independent of ProtectedRoute.
 */
export default function AdminRoute() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin-login" replace />
  }

  return <Outlet />
}
