/**
 * Full-screen loading state — ported from the original client's
 * .loading-state markup plus js/components/loadingState.js.
 *
 * The original toggled an `inactive` class from JS; here visibility is a prop,
 * and the same class is applied so the CSS is untouched.
 */
export default function LoadingState({ active = true }) {
  return (
    <div className={`loading-state${active ? '' : ' inactive'}`}>
      <div className="loading">
        <div className="loading-bar"></div>
        <div className="logo">
          <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
        </div>
      </div>
    </div>
  )
}
