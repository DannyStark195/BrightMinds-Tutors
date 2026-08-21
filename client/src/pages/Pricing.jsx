import { useState } from 'react'
import { Link } from 'react-router-dom'

import PublicLayout from '../components/PublicLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatCurrency } from '../utils/helpers.js'

/**
 * Plans — the `prices` array from the original js/scripts/pricing.js, verbatim
 * apart from camelCased keys. `sessionsPerMonth` was `"sessions-per-week"` in
 * the original, whose value ("8 sessions per month") never matched the key.
 */
const PLANS = [
  {
    id: 1,
    title: 'Light',
    price: { 2: 8000, 3: 12000 },
    timesPerWeek: '2x per week',
    sessionsPerMonth: '8 sessions per month',
  },
  {
    id: 2,
    title: 'Standard',
    price: { 2: 12000, 3: 16000 },
    timesPerWeek: '3x per week',
    sessionsPerMonth: '12 sessions per month',
    mostPopular: true,
  },
  {
    id: 3,
    title: 'Intensive',
    price: { 2: 18000, 3: 25000 },
    timesPerWeek: '5x per week',
    sessionsPerMonth: '20 sessions per month',
  },
]

export default function Pricing() {
  useDocumentTitle('BrightMinds Tutors')

  /*
    The original held the selected session length nowhere: it re-rendered the
    cards from the click handler, nudged `.toggle-slide` with inline left/right
    styles, and moved the `active` class by hand. All three now derive from this
    one value (2 or 3 hours per session).
  */
  const [hours, setHours] = useState(2)

  return (
    <PublicLayout className="pricing-page white-bg">
      <main>
        <section className="pricing-hero">
          <div className="pricing-header">
            <h2>Simple, Transparent Pricing.</h2>
            <p>
              No hidden fees. Pay monthly, cancel anytime. One flat rate regardless of subject
              or tutor.
            </p>
          </div>

          <div className="price-toggle">
            {/* Positioned with inline styles exactly as the original click
                handlers did — 5%/50% for 2 hours, 50%/5% for 3. */}
            <div
              className="toggle-slide"
              style={hours === 2 ? { left: '5%', right: '50%' } : { left: '50%', right: '5%' }}
            ></div>
            <button
              className={`toggle-btn toggle-2hrs${hours === 2 ? ' active' : ''}`}
              onClick={() => setHours(2)}
            >
              2 Hours
            </button>
            <button
              className={`toggle-btn toggle-3hrs${hours === 3 ? ' active' : ''}`}
              onClick={() => setHours(3)}
            >
              3 Hours
            </button>
          </div>
        </section>

        <section className="prices">
          <div className="price-cards">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`price-card ${plan.mostPopular ? 'most-popular' : ''}`}
              >
                <h3 className="price-title">{plan.title}</h3>
                <p className="price">
                  ₦{formatCurrency(plan.price[hours])}
                  <small>/month</small>
                </p>
                <ul className="why-choose-us">
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    {plan.timesPerWeek}
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    {plan.sessionsPerMonth}
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    Qualified vetted tutor
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    Physical or online sessions
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    Flexible scheduling
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    Progress updates to parent
                  </li>
                  <li className="prop">
                    <i className="fa-solid fa-check"></i>
                    WhatsApp support
                  </li>
                  {/* The original keyed this extra perk off the plan title. */}
                  {plan.title === 'Intensive' && (
                    <li className="prop">
                      <i className="fa-solid fa-check"></i>
                      Group sessions
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="comparison-table">
            <div className="comparison-table-container">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Starter</th>
                    <th>Standard</th>
                    <th>Intensive</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sessions per week</td>
                    <td>2x</td>
                    <td>3x</td>
                    <td>5x</td>
                  </tr>
                  <tr>
                    <td>Sessions per month</td>
                    <td>8</td>
                    <td>12</td>
                    <td>20</td>
                  </tr>
                  <tr>
                    <td>2hr price</td>
                    <td>₦8,000</td>
                    <td>₦12,000</td>
                    <td>₦18,000</td>
                  </tr>
                  <tr>
                    <td>3hr price</td>
                    <td>₦12,000</td>
                    <td>₦16,000</td>
                    <td>₦25,000</td>
                  </tr>
                  <tr>
                    <td>Physical sessions</td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                  </tr>
                  <tr>
                    <td>Online sessions</td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td>
                      <i className="fa-solid fa-check"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div style={{ paddingInline: '16px' }}>
          <div className="disclaimer">
            <h3>Disclaimer</h3>
            <p>
              All plans are billed monthly and renew automatically. Same tutor, same schedule,
              every month. Cancel anytime by notifying us at least 48 hours before your next
              billing date.
            </p>
          </div>
          <section className="faq">
            <h2>FAQ</h2>
            <div className="question-card">
              <p className="question">When do I pay?</p>
              <p className="answer">
                Payment is made monthly at the start of each cycle after your booking is
                confirmed.
              </p>
            </div>
            <div className="question-card">
              <p className="question">Can I change my plan?</p>
              <p className="answer">
                Yes, contact us and we&apos;ll adjust your schedule for the next month.
              </p>
            </div>
            <div className="question-card">
              <p className="question">What if a session is missed?</p>
              <p className="answer">We reschedule missed sessions at no extra charge.</p>
            </div>
          </section>
          <section className="cta-banner">
            <h2>Ready to Book?</h2>
            <Link to="/book" className="cta-btn gold">
              Book a Tutor Today
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </section>
        </div>
      </main>
    </PublicLayout>
  )
}
