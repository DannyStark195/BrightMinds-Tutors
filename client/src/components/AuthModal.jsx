import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  BASE_URL,
  forgotPassword,
  loginUser,
  resetPassword,
  signupUser,
  verifyOTPCode,
} from '../api/api.js'
import { setUserToken } from '../auth/auth.js'
import { FORMS, useAuthModal } from '../auth/AuthModalContext.jsx'
import { collectData, validateEmail, validatePassword } from '../utils/formHelpers.js'
import PasswordInput from './PasswordInput.jsx'

/**
 * Signup / login / OTP / forgot-password / reset-password modal.
 *
 * Ported from the original client's js/auth/authForm.js, which built all five
 * forms as one innerHTML string and swapped an `active` class between them.
 * The markup and class names are unchanged — only the wiring is React:
 * which form is showing comes from AuthModalContext, and each form's message,
 * button label and disabled state are local state instead of direct DOM writes.
 *
 * Behaviour notes:
 *  - `oauthError` is rendered into the signup form's message slot, matching the
 *    original: js/scripts/landing.js wrote the OAuth error into the first
 *    `.msg.error` in the overlay (the signup form's) without opening a form.
 *  - The original's reset-password handler grabbed the *signup* form's button
 *    when setting its "Loading..." label, so the reset button never showed
 *    progress. That is wired to the correct button here.
 */

/** One shared per-form UI state shape. */
const idleState = { message: '', tone: 'error', submitting: false }

export default function AuthModal({ oauthError = '' }) {
  const { form, openForm, closeForm } = useAuthModal()
  const navigate = useNavigate()

  const [registrationToken, setRegistrationToken] = useState('')
  const [resetPasswordToken, setResetPasswordToken] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  const [signupState, setSignupState] = useState(idleState)
  const [loginState, setLoginState] = useState(idleState)
  const [otpState, setOtpState] = useState(idleState)
  const [forgotState, setForgotState] = useState(idleState)
  const [resetState, setResetState] = useState(idleState)

  // Surface an OAuth failure in the signup form's message slot, as the original did.
  useEffect(() => {
    if (oauthError) {
      setSignupState({ message: oauthError, tone: 'error', submitting: false })
    }
  }, [oauthError])

  const isOpen = form !== null

  /* --------------------------------------------------------------- signup -- */

  function handleSignupPasswordInput(event) {
    const passwordError = validatePassword(event.target.value)
    setSignupState((state) => ({ ...state, message: passwordError || '', tone: 'error' }))
  }

  async function handleSignup(event) {
    event.preventDefault()
    const data = collectData(event.currentTarget)
    const { email, password } = data

    const emailError = validateEmail(email)
    if (emailError) {
      setSignupState({ message: emailError, tone: 'error', submitting: false })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setSignupState({ message: passwordError, tone: 'error', submitting: false })
      return
    }

    setSignupState({ message: '', tone: 'error', submitting: true })
    const result = await signupUser(data)

    if (!result.valid) {
      setSignupState({ message: result.message, tone: 'error', submitting: false })
      return
    }

    setSignupState(idleState)
    setRegistrationToken(result.registrationToken)
    openForm(FORMS.verifyOtp)
  }

  /* ---------------------------------------------------------------- login -- */

  async function handleLogin(event) {
    event.preventDefault()
    const user = collectData(event.currentTarget)

    setLoginState({ message: '', tone: 'error', submitting: true })
    const loggedInUser = await loginUser(user)

    if (!loggedInUser) {
      setLoginState({
        message: 'The email or password you have entered is incorrect.',
        tone: 'error',
        submitting: false,
      })
      return
    }

    setUserToken(loggedInUser.token)
    navigate('/dashboard')
  }

  /* ------------------------------------------------------------------ otp -- */

  async function handleOtpVerification(event) {
    event.preventDefault()
    const data = collectData(event.currentTarget, { registrationToken })

    setOtpState({ message: '', tone: 'error', submitting: true })
    const { valid, message } = await verifyOTPCode(data)

    setOtpState({ message, tone: valid ? 'success' : 'error', submitting: false })

    if (valid) {
      setTimeout(() => openForm(FORMS.login), 2000)
    }
  }

  /* ------------------------------------------------------- forgot password -- */

  async function handleForgotPassword(event) {
    event.preventDefault()
    const data = collectData(event.currentTarget)
    const { email } = data

    const emailError = validateEmail(email)
    if (emailError) {
      setForgotState({ message: emailError, tone: 'error', submitting: false })
      return
    }

    setForgotState({ message: '', tone: 'error', submitting: true })
    const result = await forgotPassword(data)

    if (!result.valid) {
      setForgotState({ message: result.message, tone: 'error', submitting: false })
      return
    }

    setForgotState(idleState)
    setResetPasswordToken(result.registrationToken)
    setResetEmail(email)
    openForm(FORMS.resetPassword)
  }

  /* -------------------------------------------------------- reset password -- */

  async function handleResetPassword(event) {
    event.preventDefault()
    const data = collectData(event.currentTarget, { registrationToken: resetPasswordToken })
    const { email, code, newPassword } = data

    const emailError = validateEmail(email)
    if (emailError) {
      setResetState({ message: emailError, tone: 'error', submitting: false })
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setResetState({ message: passwordError, tone: 'error', submitting: false })
      return
    }

    if (!code) {
      setResetState({ message: 'Missing verification code', tone: 'error', submitting: false })
      return
    }

    if (!resetPasswordToken) {
      setResetState({
        message: 'Please request a password reset code first',
        tone: 'error',
        submitting: false,
      })
      return
    }

    setResetState({ message: '', tone: 'error', submitting: true })
    const { valid, message } = await resetPassword(data)

    setResetState({ message, tone: valid ? 'success' : 'error', submitting: false })

    if (valid) {
      setTimeout(() => openForm(FORMS.login), 2000)
    }
  }

  async function handleResendCode() {
    if (!resetEmail) return

    const result = await forgotPassword({ email: resetEmail })

    if (!result.valid) {
      setResetState({ message: result.message, tone: 'error', submitting: false })
      return
    }

    setResetPasswordToken(result.registrationToken)
    setResetState({ message: result.message, tone: 'success', submitting: false })
  }

  /* -------------------------------------------------------------- helpers -- */

  function goToOAuth(provider) {
    window.location.href = `${BASE_URL}auth/${provider}`
  }

  return (
    <div
      className={`dark-overlay${isOpen ? ' active' : ''}`}
      onClick={(event) => {
        // Only a click on the backdrop itself closes the modal.
        if (event.target === event.currentTarget) closeForm()
      }}
    >
      <div className="form-container">
        <div className="cross-btn cancel-form-popup" onClick={closeForm}>
          <i className="fa-solid fa-xmark"></i>
        </div>

        {/* ------------------------------------------------------- signup -- */}
        <div className={`signup-form-container form${form === FORMS.signup ? ' active' : ''}`}>
          <div className="top">
            <div className="logo">
              <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
            </div>
            <h2>Sign up</h2>
            <form className="signup-form" onSubmit={handleSignup}>
              <input
                type="email"
                name="email"
                id="signup-email"
                placeholder="E-mail address"
                className="input-error"
              />
              <PasswordInput
                id="signup-password"
                name="password"
                placeholder="Password"
                onInput={handleSignupPasswordInput}
              />
              <label htmlFor="age-confirmation" className="condition age-confirmation">
                <input type="checkbox" name="age-confirmation" id="age-confirmation" required />I
                agree to the{' '}
                <Link to="/terms-of-use" target="_blank">
                  Terms of Use
                </Link>
              </label>
              <FormMessage state={signupState} />
              <button type="submit" className="cta-btn gold" disabled={signupState.submitting}>
                {signupState.submitting ? 'Loading...' : 'Sign Up'}
              </button>
              <div>or</div>
              <OAuthButtons action="Sign up" onPick={goToOAuth} />
            </form>
          </div>

          <div className="bottom">
            <p>Already have an account?</p>
            <p className="open-login" onClick={() => openForm(FORMS.login)}>
              Log in
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- login -- */}
        <div className={`login-form-container form${form === FORMS.login ? ' active' : ''}`}>
          <div className="top">
            <div className="logo">
              <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
            </div>
            <h2>Log in</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                id="login-email"
                placeholder="E-mail address"
                className="input-error"
              />
              <PasswordInput id="login-password" name="password" placeholder="Password" />
              <a
                href="#"
                className="forgot-password"
                onClick={(event) => {
                  event.preventDefault()
                  openForm(FORMS.forgotPassword)
                }}
              >
                Forgot password?
              </a>
              <FormMessage state={loginState} />
              <button type="submit" className="cta-btn gold" disabled={loginState.submitting}>
                {loginState.submitting ? 'Loading...' : 'Login'}
              </button>
              <div>or</div>
              <OAuthButtons action="Log in" onPick={goToOAuth} />
            </form>
          </div>

          <div className="bottom">
            <p>Don't have an account?</p>
            <p className="open-signup" onClick={() => openForm(FORMS.signup)}>
              Sign up
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- verify otp -- */}
        <div
          className={`verify-otp-form-container form${form === FORMS.verifyOtp ? ' active' : ''}`}
        >
          <div className="top">
            <div className="logo">
              <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
            </div>
            <h2>Verify Code</h2>
            <form className="verify-otp-form" onSubmit={handleOtpVerification}>
              <p>
                A verification code has been sent to your email. Please enter the code below to
                verify your account.
              </p>
              <PasswordInput id="verify-password" name="code" placeholder="Code" />
              <FormMessage state={otpState} />
              <button type="submit" className="cta-btn gold" disabled={otpState.submitting}>
                {otpState.submitting ? 'Loading...' : 'Verify'}
              </button>
            </form>
          </div>
        </div>

        {/* ----------------------------------------------- forgot password -- */}
        <div
          className={`forgot-password-form-container form${
            form === FORMS.forgotPassword ? ' active' : ''
          }`}
        >
          <div className="top">
            <div className="logo">
              <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
            </div>
            <h2>Forgot password</h2>
            <form className="forgot-password-form" onSubmit={handleForgotPassword}>
              <p>Enter your email address and we'll send you an OTP to reset your password.</p>
              <input
                type="email"
                name="email"
                id="forgot-password-email"
                placeholder="E-mail address"
                className="input-error"
              />
              <FormMessage state={forgotState} />
              <button type="submit" className="cta-btn gold" disabled={forgotState.submitting}>
                {forgotState.submitting ? 'Loading...' : 'Send code'}
              </button>
            </form>
          </div>
        </div>

        {/* ------------------------------------------------ reset password -- */}
        <div
          className={`reset-password-form-container form${
            form === FORMS.resetPassword ? ' active' : ''
          }`}
        >
          <div className="top">
            <div className="logo">
              <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
            </div>
            <h2>Reset Password</h2>
            <form className="reset-password-form" onSubmit={handleResetPassword}>
              <p>Enter the OTP sent to your email and choose a new password.</p>
              <input
                type="email"
                name="email"
                id="reset-email"
                placeholder="E-mail address"
                className="input-error"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
              />
              <input
                type="password"
                id="reset-code"
                name="code"
                placeholder="Code"
                className="input-error"
              />
              <PasswordInput
                id="reset-password"
                name="newPassword"
                placeholder="New Password"
              />
              <FormMessage state={resetState} />
              <p className="resend-code" onClick={handleResendCode}>
                Resend code
              </p>
              <button type="submit" className="cta-btn gold" disabled={resetState.submitting}>
                {resetState.submitting ? 'Loading...' : 'Reset password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Error/success line under a form's fields. Hidden while there is no message. */
function FormMessage({ state }) {
  return (
    <p className={`msg ${state.tone}${state.message ? '' : ' inactive'}`}>{state.message}</p>
  )
}

/** Google + Facebook buttons, identical in both the signup and login forms. */
function OAuthButtons({ action, onPick }) {
  const [redirecting, setRedirecting] = useState('')

  function pick(provider) {
    setRedirecting(provider)
    onPick(provider)
  }

  return (
    <>
      <button
        type="button"
        className="oauth-btn google-btn"
        disabled={redirecting !== ''}
        onClick={() => pick('google')}
      >
        {redirecting === 'google' ? (
          'Redirecting...'
        ) : (
          <div>
            <img src="/assets/icons/google.svg" alt="google icon" />
            {action} with Google
          </div>
        )}
      </button>
      <button
        type="button"
        className="oauth-btn facebook-btn"
        disabled={redirecting !== ''}
        onClick={() => pick('facebook')}
      >
        {redirecting === 'facebook' ? (
          'Redirecting...'
        ) : (
          <div>
            <img src="/assets/icons/facebook.svg" alt="facebook icon" />
            {action} with Facebook
          </div>
        )}
      </button>
    </>
  )
}
