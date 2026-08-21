import { useSearchParams } from 'react-router-dom'

import AuthModal from './AuthModal.jsx'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

/**
 * Shell for the four signed-out pages (landing, pricing, terms, privacy):
 * public header, page content, footer, and the auth modal.
 *
 * `className` is the page's own wrapper class — the original set this on the
 * <div> directly inside <body> (`landing-page`, `pricing-page white-bg`,
 * `legal-page white-bg`), and each page's scoped CSS hangs off it.
 */
export default function PublicLayout({ className, children }) {
  const [searchParams] = useSearchParams()

  return (
    <div className={className}>
      <Header />
      {children}
      <Footer />
      <AuthModal oauthError={searchParams.get('oauth_error') || ''} />
    </div>
  )
}
