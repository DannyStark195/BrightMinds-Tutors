import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getPayments } from '../api/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatCurrency, formatDateTime } from '../utils/helpers.js'

/**
 * My payments — ported from the original client's my-payments.html plus
 * js/scripts/myPayments.js.
 *
 * DashboardLayout renders the signed-in header and the `.overlay` backdrop, and
 * no footer, exactly as the original page did. Auth is handled by
 * ProtectedRoute, which replaced the page's `js/auth/dAuth.js` script.
 *
 * Notes on the original's behaviour that is deliberately reproduced:
 *  - No loading state. myPayments.js was the one dashboard script that never
 *    imported loadingState.js: the page painted immediately and the receipt
 *    list simply appeared once the fetch resolved. Adding <LoadingState /> here
 *    would put a full-screen white panel where the original had none.
 *  - No empty state. The original built its markup by string concatenation
 *    starting from `let html = ""`, so zero payments meant an empty
 *    `.payments-list` under the "Recent payments" heading — no message, no
 *    placeholder card.
 */
export default function MyPayments() {
  useDocumentTitle('My Payments | BrightMinds Tutors')

  const [payments, setPayments] = useState([])

  useEffect(() => {
    let current = true

    getPayments().then((result) => {
      if (!current) return
      // getPayments() resolves to null on a failed request, which made the
      // original throw on `payments.forEach` and abort the script. The user saw
      // an empty list either way, so that is what an empty list renders as.
      setPayments(result || [])
    })

    return () => {
      current = false
    }
  }, [])

  return (
    <DashboardLayout className="payments-page page-shell">
      <main className="payments-main page-main">
        <section className="payments-hero page-hero surface-card">
          <div>
            <p className="eyebrow">My payments</p>
            <h1>Payment receipts</h1>
            <p>
              View completed payments, download receipts, and keep track of upcoming
              tutoring billing.
            </p>
          </div>
          <Link to="/dashboard">
            <button className="cta-btn blue" type="button">
              Dashboard
            </button>
          </Link>
        </section>

        {/* The three summary cards (total receipts, pending payments, next billing)
            are commented out in the original markup, and the ids myPayments.js
            looked up were commented out too. The section itself stays: it is what
            supplies `.payments-summary`'s 24px bottom margin above the panel. */}
        <section className="payments-summary summary-grid" aria-label="Payment summary"></section>

        <section className="content-layout">
          <section className="payments-panel surface-card">
            <div className="section-heading">
              <p className="eyebrow">Receipts</p>
              <h2>Recent payments</h2>
              <p>Your confirmed payment receipts are listed below.</p>
            </div>

            <div className="payments-list">
              {payments.map((payment) => (
                <article className="receipt-card" key={payment.payment_ref}>
                  <div className="receipt-main">
                    <div className="receipt-title">
                      <h3>{payment.course}</h3>
                      <span className={`status ${payment.payment_status}`}>
                        {payment.payment_status}
                      </span>
                    </div>
                    <div className="receipt-meta">
                      <span className="receipt-reference">{payment.payment_ref}</span>
                      <span>{formatDateTime(payment.paid_at)}</span>
                      <span>{payment.payment_method}</span>
                    </div>
                    <div className="receipt-actions">
                      {/* The original carried `id="view-receipt"` on this link, once
                          per card — duplicate ids that no CSS or JS ever read. The
                          class list, which is what styles it, is unchanged. */}
                      <Link to={`/receipt?reff=${payment.payment_ref}`} className="cta-btn gold">
                        View receipt
                      </Link>
                    </div>
                  </div>
                  <p className="receipt-amount">NGN {formatCurrency(payment.amount)}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="payments-side">
            <article className="payments-side-card surface-card">
              <i className="fa-solid fa-circle-info icon-badge"></i>
              <h2>Payment help</h2>
              <p>
                Contact support if a receipt is missing or a transfer has not been
                confirmed.
              </p>
              <a href="https://wa.me/2348092812010" className="cta-btn blue">
                Chat on WhatsApp
              </a>
            </article>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  )
}
