import { useState } from 'react'

/**
 * Password field with an eye/eye-slash reveal toggle.
 *
 * Replaces the original client's setupPasswordToggle(), which wired up three
 * hard-coded element ids per field. The markup and classes are unchanged, so
 * the .password-wrapper / .toggle-password CSS still applies.
 */
export default function PasswordInput({ id, name, placeholder, className = 'input-error', ...rest }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-wrapper">
      <input
        type={visible ? 'text' : 'password'}
        id={id}
        name={name}
        placeholder={placeholder}
        className={className}
        {...rest}
      />
      <span
        className="toggle-password"
        onClick={() => setVisible((shown) => !shown)}
        role="button"
        tabIndex={0}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setVisible((shown) => !shown)
          }
        }}
      >
        <i className={visible ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
      </span>
    </div>
  )
}
