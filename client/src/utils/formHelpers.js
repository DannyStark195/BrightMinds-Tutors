/**
 * Form validation helpers — ported from the original client's
 * js/utils/formHelpers.js. Validation rules are unchanged so the same inputs
 * produce the same messages.
 *
 * The original's setupPasswordToggle() is gone: the eye/eye-slash toggle is
 * component state now (see components/PasswordInput.jsx).
 */

export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s()-]/g, '')
  const nigerianRegex = /^(0|\+234|234)[789][01]\d{8}$/
  return nigerianRegex.test(cleaned)
}

export function validateEmail(email) {
  if (!email.includes('@') || !email.endsWith('.com')) {
    return 'This email is invalid'
  }
  return null
}

export function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null // null means no error, password is valid
}

export function validateFile(file) {
  const fileName = file.name
  if (!/\.(docs|docx|pdf|png|jpeg|jpg)$/i.test(fileName)) {
    return 'Invalid document format'
  }

  const fileSizeMb = file.size / 1024 / 1024
  if (fileSizeMb > 10) {
    return 'File must be less than 10MB'
  }
  return null
}

/** Reads a native <form> into a plain object, merging in any extra fields. */
export function collectData(form, extraData = {}) {
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)
  return { ...data, ...extraData }
}
