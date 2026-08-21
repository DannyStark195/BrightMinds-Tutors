import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Lets any component open the auth modal — the React stand-in for the original
 * client's `.open-login` / `.open-signup` class listeners, which relied on the
 * modal and its triggers sharing one global document.
 *
 * `form` is null when closed, otherwise one of the FORMS values below.
 */

export const FORMS = {
  signup: 'signup',
  login: 'login',
  verifyOtp: 'verifyOtp',
  forgotPassword: 'forgotPassword',
  resetPassword: 'resetPassword',
}

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [form, setForm] = useState(null)

  const openLogin = useCallback(() => setForm(FORMS.login), [])
  const openSignup = useCallback(() => setForm(FORMS.signup), [])
  const openForm = useCallback((next) => setForm(next), [])
  const closeForm = useCallback(() => setForm(null), [])

  const value = useMemo(
    () => ({ form, openForm, openLogin, openSignup, closeForm }),
    [form, openForm, openLogin, openSignup, closeForm],
  )

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used inside an AuthModalProvider')
  }
  return context
}
