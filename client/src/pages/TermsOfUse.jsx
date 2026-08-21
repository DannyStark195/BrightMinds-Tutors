import { Link } from 'react-router-dom'

import PublicLayout from '../components/PublicLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * The chrome shared by /terms-of-use and /privacy-policy: centred hero, sticky
 * table of contents, and the document card the sections sit in. Both original
 * pages had byte-identical markup here, differing only in the heading, the
 * intro line, and the contents list.
 *
 * It lives in this page file rather than src/components/ because it is only
 * ever used by the two legal pages — PrivacyPolicy.jsx imports it from here.
 *
 * `toc` is `[{ href, label }]`. The hrefs are same-page fragments, so they stay
 * plain <a> elements: <Link to="#about"> would be read as a route, not an
 * anchor.
 */
export function LegalPageShell({ title, intro, tocLabel, toc, children }) {
  return (
    <main>
      <section className="legal-hero">
        <p className="eyebrow">Last updated: May 2026</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <div className="legal-shell">
        <aside className="legal-toc" aria-label={tocLabel}>
          <p>On this page</p>
          {toc.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </aside>

        <article className="legal-document">{children}</article>
      </div>
    </main>
  )
}

/**
 * The original TOC links to `#bookings`, but no section carries that id — the
 * "Booking and payment" entry is a dead anchor. Kept as-is: adding the id would
 * be a behavioural change, and the copy here is legal text.
 */
const toc = [
  { href: '#about', label: 'About BrightMinds Tutors' },
  { href: '#eligibility', label: 'Eligibility' },
  { href: '#bookings', label: 'Booking and payment' },
  { href: '#conduct', label: 'Conduct and responsibilities' },
  { href: '#liability', label: 'Liability and termination' },
  { href: '#contact', label: 'Contact us' },
]

export default function TermsOfUse() {
  useDocumentTitle('Terms of Use | BrightMinds Tutors')

  return (
    <PublicLayout className="legal-page white-bg">
      <LegalPageShell
        title="Terms of Use"
        intro="By accessing or using the BrightMinds Tutors platform you agree to be bound by these Terms of Use. Please read them carefully before registering or making a booking."
        tocLabel="Terms sections"
        toc={toc}
      >
        <section id="about">
          <h2>1. About BrightMinds Tutors</h2>
          <p>
            BrightMinds Tutors is an online platform that connects parents and students with
            qualified, vetted tutors for private tutoring sessions in Mathematics, Chemistry,
            Physics, English, and Biology. BrightMinds Tutors acts as an intermediary between
            parents and tutors and is not itself a tutoring provider.
          </p>
        </section>

        <section id="eligibility">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years of age to create an account on this platform. By
            registering you confirm that you are an adult and where applicable that you are
            registering on behalf of a minor in your care. BrightMinds Tutors reserves the right to
            suspend any account where eligibility requirements are not met.
          </p>
        </section>

        <section>
          <h2>3. Account Responsibility</h2>
          <p>
            When you create an account you agree to provide accurate and complete information. You
            are solely responsible for maintaining the confidentiality of your login credentials and
            for all activity that occurs under your account. If you suspect unauthorized access to
            your account please contact us immediately. BrightMinds Tutors is not liable for any
            loss resulting from unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2>4. Our Services</h2>
          <p>
            BrightMinds Tutors is a tutoring agency that recruits, vets, and assigns qualified
            tutors to students across five core subjects. We take full responsibility for the
            quality and conduct of every tutor on our platform. All tutors undergo a formal
            application and review process including qualification verification before being
            approved. Once approved tutors are assigned directly by BrightMinds to students based on
            subject compatibility and schedule preference.
          </p>
        </section>

        <section>
          <h2>5. Booking Policy</h2>
          <p>
            Submitting a booking request does not guarantee confirmation. All bookings are subject
            to tutor availability and admin review. You will be notified through your dashboard when
            your booking has been reviewed. BrightMinds Tutors reserves the right to decline any
            booking request without providing a reason. Confirmed bookings are binding on both the
            parent and the assigned tutor.
          </p>
        </section>

        <section>
          <h2>6. Cancellation Policy</h2>
          <p>
            BrightMinds Tutors operates on a monthly auto-renewal model. Once a booking is confirmed
            sessions continue automatically each month until the parent chooses to cancel. To cancel
            a booking parents must notify BrightMinds at least 48 hours before their next billing
            date. Cancellation takes effect at the end of the current paid month — sessions will
            continue until that date and no further charges will be made after that point. Refunds
            are applied as follows: Cancellation before the first session — full refund of the
            monthly fee. Cancellation after the first session but within the first week — 50% refund
            of the monthly fee. Cancellation after two weeks — no refund. Sessions have been
            substantially delivered for that month. Cancellation after a full month — no refund
            applicable. Simply do not renew by notifying us before your next billing date. To cancel
            a booking contact us via email at{' '}
            <a href="mailto:info@brightmindstutors.com">info@brightmindstutors.com</a> or call{' '}
            <a href="tel:+2348092812010">08092812010</a>.
          </p>
        </section>

        <section>
          <h2>7. Payment Terms</h2>
          <p>
            Payment is due monthly at the start of each billing cycle following booking
            confirmation. All prices are displayed in Nigerian Naira and are billed on a monthly
            auto-renewal basis. Your billing date is set on the day your booking is confirmed and
            recurs on that same date every month. BrightMinds Tutors reserves the right to revise
            pricing with reasonable advance notice to users. Failure to make payment on time may
            result in suspension of sessions until outstanding amounts are settled. Refund
            eligibility is determined by the cancellation policy outlined in Section 6 above..
          </p>
        </section>

        <section id="conduct">
          <h2>8. Tutor Conduct</h2>
          <p>
            BrightMinds Tutors takes tutor quality seriously. All tutors undergo a formal vetting
            process including qualification verification before being approved on the platform.
            However BrightMinds Tutors cannot be held liable for the personal conduct of tutors
            during or outside of sessions. Any concerns about tutor conduct must be reported to us
            immediately via our contact channels and we will investigate promptly.
          </p>
        </section>

        <section>
          <h2>9. Parent and Student Responsibilities</h2>
          <p>
            Parents agree to provide accurate information during registration and booking. For
            physical sessions parents agree to ensure that the session location is safe, accessible,
            and appropriate for the assigned tutor. Parents are responsible for the conduct of their
            children during sessions. BrightMinds Tutors reserves the right to withdraw services
            where a tutor reports consistent disruption or unsafe conditions.
          </p>
        </section>

        <section>
          <h2>10. User Conduct</h2>
          <p>
            Users of this platform agree not to provide false or misleading information, attempt to
            contact tutors outside the platform to circumvent payment, harass or threaten tutors or
            BrightMind staff, use the platform for any unlawful purpose, or attempt to interfere
            with the normal operation of the platform. Violation of any of these may result in
            immediate account termination.
          </p>
        </section>

        <section>
          <h2>11. Intellectual Property</h2>
          <p>
            All content on the BrightMinds Tutors platform including but not limited to the name,
            logo, design, text, and layout is the intellectual property of BrightMinds Tutors. You
            may not copy, reproduce, distribute, or use any part of this platform without our
            express written permission.
          </p>
        </section>

        <section id="liability">
          <h2>12. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law BrightMinds Tutors shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the platform,
            the conduct of any tutor, interruption of service, or any errors or inaccuracies in
            platform content. Our total liability to you in any circumstance shall not exceed the
            amount you paid for the current billing cycle.
          </p>
        </section>

        <section>
          <h2>13. Termination</h2>
          <p>
            BrightMinds Tutors reserves the right to suspend or permanently terminate any account
            that violates these terms, engages in fraudulent activity, or behaves in a manner deemed
            harmful to other users or to the platform. You may also delete your account at any time
            by contacting us directly.
          </p>
        </section>

        <section>
          <h2>14. Changes to These Terms</h2>
          <p>
            BrightMinds Tutors may update these Terms of Use from time to time. Where changes are
            significant we will notify registered users via email. Continued use of the platform
            following notification of changes constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2>15. Governing Law</h2>
          <p>
            These Terms of Use are governed by and construed in accordance with the laws of the
            Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to
            the jurisdiction of Nigerian courts.
          </p>
        </section>

        <section id="contact">
          <h2>16. Contact Us</h2>
          <p>If you have any questions about these Terms of Use please contact us:</p>
          <ul className="contact-list">
            <li>
              Email - <a href="mailto:info@brightmindstutors.com">info@brightmindstutors.com</a>
            </li>
            <li>
              Phone - <a href="tel:+2348092812010">08092812010</a>
            </li>
            <li>
              WhatsApp - <a href="https://wa.me/2348092812010">08092812010</a>
            </li>
          </ul>
          <div className="legal-actions">
            <Link to="/privacy-policy" className="cta-btn blue">
              Read Privacy Policy
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
