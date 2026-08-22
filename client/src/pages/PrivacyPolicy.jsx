import { Link } from 'react-router-dom'

import PublicLayout from '../components/PublicLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
// Hero + table of contents + document card, shared with /terms-of-use. It lives
// in that page file rather than src/components/ because nothing else uses it.
import { LegalPageShell } from './TermsOfUse.jsx'

const toc = [
  { href: '#who-we-are', label: 'Who we are' },
  { href: '#data', label: 'What data we collect' },
  { href: '#purpose', label: 'Why we collect data' },
  { href: '#storage', label: 'Storage and sharing' },
  { href: '#rights', label: 'Your rights' },
  { href: '#contact', label: 'Contact us' },
]

export default function PrivacyPolicy() {
  useDocumentTitle('Privacy Policy | BrightMinds Tutors')

  return (
    <PublicLayout className="legal-page white-bg">
      <LegalPageShell
        title="Privacy Policy"
        intro="BrightMinds Tutors is committed to protecting your personal information. This Privacy Policy explains what data we collect, why we collect it, how we use it, and your rights regarding your data."
        tocLabel="Privacy sections"
        toc={toc}
      >
        <section id="who-we-are">
          <h2>1. Who We Are</h2>
          <p>
            BrightMinds Tutors is a tutoring platform operating in Nigeria connecting parents with
            qualified tutors for private academic sessions. This policy is in accordance with the
            Nigeria Data Protection Regulation, NDPR. For any privacy related matters contact us at{' '}
            <a href="mailto:info@brightmindstutors.com">info@brightmindstutors.com</a>.
          </p>
        </section>

        <section id="data">
          <h2>2. What Data We Collect</h2>
          <p>We collect the following personal information when you use our platform:</p>
          <ul>
            <li>
              <strong>Account data</strong> - your email address and password when you register.
            </li>
            <li>
              <strong>Profile data</strong> - your name, phone number, and where applicable your
              child's name and academic level.
            </li>
            <li>
              <strong>Booking data</strong> - subject requested, preferred schedule, session type,
              and home address where physical sessions are selected.
            </li>
            <li>
              <strong>Payment data</strong> - payment confirmation details. We do not store full
              card details on our servers.
            </li>
            <li>
              <strong>Usage data</strong> - how you interact with our platform including pages
              visited and actions taken. This helps us improve the service.
            </li>
            <li>
              <strong>Tutor application data</strong> - for prospective tutors, qualification
              details, CV, teaching experience, and bio submitted during the application process.
            </li>
          </ul>
        </section>

        <section id="purpose">
          <h2>3. Why We Collect Your Data</h2>
          <p>
            We collect your data to create and manage your account, to process and confirm tutoring
            bookings, to match students with appropriate tutors, to process payments, to communicate
            with you about your bookings and account, to improve our platform and services, and to
            comply with legal obligations.
          </p>
          <p>We do not collect any data beyond what is necessary for these purposes.</p>
        </section>

        <section id="storage">
          <h2>4. How We Store Your Data</h2>
          <p>
            Your data is stored securely on our servers. We use industry standard encryption to
            protect data in transit and at rest. Access to personal data is restricted to authorized
            BrightMinds staff only. We retain your data for as long as your account is active and
            for a reasonable period after account deletion as required by law.
          </p>
        </section>

        <section>
          <h2>5. Who We Share Your Data With</h2>
          <p>
            BrightMinds Tutors does not sell your personal data to any third party under any
            circumstances.
          </p>
          <p>
            We share limited data only in the following situations: with assigned tutors, your name,
            student name, subject, schedule, and contact number are shared so the tutor can prepare
            for and attend your sessions; with payment processors, necessary transaction data is
            shared with our payment provider to process your monthly payments; and with legal
            authorities, where required by Nigerian law or a valid court order.
          </p>
        </section>

        <section id="rights">
          <h2>6. Your Rights</h2>
          <p>Under the NDPR you have the following rights regarding your personal data:</p>
          <ul>
            <li>
              <strong>Right to access</strong> - you can request a copy of the personal data we hold
              about you.
            </li>
            <li>
              <strong>Right to correction</strong> - you can ask us to correct any inaccurate data
              we hold.
            </li>
            <li>
              <strong>Right to deletion</strong> - you can request that we delete your personal
              data. Note that some data may be retained where required by law.
            </li>
            <li>
              <strong>Right to withdraw consent</strong> - where processing is based on consent you
              may withdraw it at any time.
            </li>
          </ul>
          <p>
            To exercise any of these rights contact us at{' '}
            <a href="mailto:info@brightmindstutors.com">info@brightmindstutors.com</a>. We will
            respond within 30 days.
          </p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            BrightMinds Tutors may use basic cookies to maintain your session while you are logged
            in. We do not use tracking cookies or advertising cookies. You can disable cookies in
            your browser settings though this may affect your ability to stay logged in.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our platform is designed to be used by parents and guardians on behalf of their
            children. We do not knowingly collect personal data directly from children under 18. All
            accounts must be created and managed by an adult.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Where changes are material we will
            notify registered users via email. The date at the top of this document reflects the
            most recent update.
          </p>
        </section>

        <section id="contact">
          <h2>10. Contact Us</h2>
          <p>
            For any privacy related questions or to exercise your data rights please contact:
          </p>
          <ul className="contact-list">
            <li>
              Email - <a href="mailto:info@brightmindstutors.com">info@brightmindstutors.com</a>
            </li>
            <li>
              Phone - <a href="tel:+2348101836183">08101836183</a>
            </li>
          </ul>
          <div className="legal-actions">
            <Link to="/terms-of-use" className="cta-btn blue">
              Read Terms of Use
            </Link>
            <Link to="/pricing" className="cta-btn gold">
              See Pricing <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </section>
      </LegalPageShell>
    </PublicLayout>
  )
}
