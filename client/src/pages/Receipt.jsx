import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { downloadReceipt, getReceipt } from '../api/api.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatCurrency, formatDateTime } from '../utils/helpers.js'

/**
 * Printable payment receipt — ported from the original client's receipt.html
 * plus js/scripts/receipt.js.
 *
 * This page is standalone by design: the original loaded none of the shared
 * stylesheets and rendered no header, nav or footer of the site's own, so it
 * uses neither PublicLayout nor DashboardLayout. All of its styling came from an
 * inline <style> block, which now lives in src/styles/receipt.css.
 *
 * Four class names are renamed with a `receipt-` prefix — `header`, `logo`,
 * `status` and `footer` (plus `footer-link` dropped). In the original those were
 * safe: this page loaded no shared CSS. Here index.css is always loaded, and
 * those exact names mean something completely different in it — `.header` is the
 * site's sticky blurred nav bar, `.footer` and the bare `footer` selector are
 * the dark-blue site footer, `.status` is an uppercase pill. Sixteen shared
 * declarations reach this page's elements otherwise, including one
 * (`.header .logo { flex; min-width }`) that no amount of same-name overriding
 * catches cleanly. Renaming ends that whole class of bug; nothing outside this
 * page and its stylesheet ever referenced these names, so the rendered result
 * is unchanged. `.eyebrow` is deliberately NOT renamed: index.css defines it
 * with the same six declarations and the same values.
 *
 * It is also not behind ProtectedRoute, because the original loaded no auth
 * script. getReceipt() still needs a token, so a signed-out visitor gets null
 * back; that is handled the same way the original handled it, by leaving the
 * receipt card empty (the original threw while building its template string and
 * never reached the download listener, so the button did nothing either).
 *
 * PDF export: receipt.html pulled in html2pdf.bundle.min.js from a CDN, but
 * receipt.js never touches html2pdf — the button calls downloadReceipt(), which
 * fetches a PDF the server renders. That script tag was dead weight, so no
 * html2pdf dependency is added here.
 */
export default function Receipt() {
  useDocumentTitle('Receipt | BrightMinds Tutors')

  const [searchParams] = useSearchParams()
  const [receipt, setReceipt] = useState(null)

  const reff = searchParams.get('reff')

  useEffect(() => {
    let current = true

    getReceipt(reff).then((details) => {
      if (!current) return
      setReceipt(details)
    })

    return () => {
      current = false
    }
  }, [reff])

  return (
    <div className="receipt-page">
      <div className="receipt">
        {receipt && (
          <>
            <header className="receipt-header">
              <div className="brand">
                <div className="receipt-logo">
                  <img src="/assets/icons/tutor-logo.svg" alt="BrightMind logo" />
                  <p>BrightMinds Tutors</p>
                </div>
                <span className="eyebrow">Payment receipt</span>
              </div>
              <span className="receipt-status">Paid</span>
            </header>
            <section className="hero">
              <div>
                <p className="label">Receipt total</p>
                <strong className="amount">NGN {formatCurrency(receipt.amount)}</strong>
              </div>
              <div>
                <p className="label">Receipt no.</p>
                <span className="reference">{receipt.payment_ref}</span>
              </div>
            </section>
            <section className="grid">
              <div className="box">
                <p className="label">Service</p>
                <h2>{receipt.course} tutoring</h2>
              </div>
              <div className="box">
                <p className="label">Account</p>
                <h3>{receipt.parent_name}</h3>
                <p>BrightMind user account</p>
              </div>
            </section>
            <section className="details">
              <div>
                <span>Payment date</span>
                <strong>{formatDateTime(receipt.paid_at)}</strong>
              </div>
              <div>
                <span>Payment method</span>
                <strong>{receipt.payment_method}</strong>
              </div>
              <div>
                <span>Payment status</span>
                <strong>Paid</strong>
              </div>
            </section>
            <section className="items">
              <div className="row head">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="row item">
                <span>{receipt.course} tutoring sessions</span>
                <strong>NGN {formatCurrency(receipt.amount)}</strong>
              </div>
              <div className="row total">
                <span>Total paid</span>
                <strong>NGN {formatCurrency(receipt.amount)}</strong>
              </div>
            </section>
            <footer className="receipt-footer">
              <p>Thank you for learning with BrightMinds Tutors.</p>
              <span>
                {/* The href and the visible text disagree in the original
                    ("brightmindstutors" vs "brightmindtutors"); both kept. */}
                <a href="mailto:info@brightmindstutors.com">info@brightmindtutors.com</a>
              </span>
            </footer>
          </>
        )}
      </div>
      {/* "reciept" is the original's typo, kept because it is visible text. */}
      <button
        className="download-btn"
        onClick={() => receipt && downloadReceipt(receipt.payment_ref)}
      >
        Download reciept{' '}
        <i className="fa-solid fa-download"></i>
      </button>
    </div>
  )
}
