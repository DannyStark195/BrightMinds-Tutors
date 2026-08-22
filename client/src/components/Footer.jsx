import { Link } from 'react-router-dom'

/**
 * Site footer — ported from the footer template in the original client's
 * js/components/headerFooter.js. Same markup and classes; internal links go
 * through the router instead of full page loads.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-left">
          <div className="logo">
            <img src="/assets/icons/tutor-logo-white.svg" alt="BrightMind logo" />
            <p>BrightMinds Tutors</p>
          </div>
          <p>
            Qualified, vetted tutors with transparent pricing, bookable without knowing anybody.
          </p>
        </div>

        <div className="footer-middle">
          <ul>
            <li>
              <Link to="/" className="footer-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="footer-link">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/terms-of-use" className="footer-link">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="footer-link">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-right">
          <p>Phone - 08101836183</p>
          <p>
            Email -{' '}
            <a href="mailto:support@brightmindstutors.com" className="footer-link">
              info@brightmind-tutors.com
            </a>
          </p>
          <p>
            <a href="https://wa.me/2348101836183" className="footer-link">
              Chat Us on Whatsapp
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">© 2026 BrightMinds Tutors</p>
        <p className="attribution">
          Coded by{' '}
          <a href="https://github.com/DannyStark195" className="footer-link">
            Danny Stark
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
