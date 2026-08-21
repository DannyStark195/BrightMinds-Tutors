import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getPaymentDetails, makePayment } from '../api/api.js'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatCurrency } from '../utils/helpers.js'

/**
 * Checkout for one booking — ported from the original client's make-payment.html
 * plus js/scripts/makePayment.js. `?reff=` selects the booking to pay for.
 *
 * DashboardLayout renders the signed-in header and the `.overlay` backdrop; like
 * the original this page has no footer and no loading overlay.
 *
 * Two things about the original worth knowing before reading on:
 *
 *  - makePayment.js awaited getPaymentDetails at module top level, so nothing on
 *    the page was interactive until the fetch resolved, and if it failed the
 *    module threw and the page stayed frozen on the placeholder figures that
 *    shipped in the HTML (₦30,000, ref BM-2847). Those placeholders are kept as
 *    the pre-load fallback here; submitting is blocked until the details land,
 *    which is the part of that behaviour that mattered.
 *  - The card fields are collected and validated but never sent. The payload is
 *    two fields — payment_method and reference_code — and Flask is unchanged, so
 *    that is exactly what still goes over the wire.
 */

const TABS = [
  { id: 'card', label: 'Card', icon: '/assets/icons/card.svg' },
  { id: 'bank', label: 'Bank Transfer', icon: '/assets/icons/bank.svg' },
  { id: 'ussd', label: 'USSD', icon: '/assets/icons/mobile-phone.svg' },
  { id: 'paystack', label: 'Paystack', icon: '/assets/icons/paystack-icon.svg' },
]

/* Hardcoded in the original, amount included: the codes say 12000 whatever the
   booking actually costs. */
const USSD_CODES = [
  { bank: 'GTBank', code: '*737*000*12000#' },
  { bank: 'Access', code: '*901*000*12000#' },
  { bank: 'Zenith', code: '*966*000*12000#' },
  { bank: 'First Bank', code: '*894*000*12000#' },
  { bank: 'UBA', code: '*919*000*12000#' },
]

const BRAND_ICONS = {
  visa: '/assets/icons/visa.svg',
  mastercard: '/assets/icons/mastercard.svg',
  verve: '/assets/icons/verve.svg',
  unknown: '/assets/icons/credit-card.svg',
}

const ACCOUNT_NUMBER = '0105401010'
const CARD_NUMBER_ERROR = 'Card number should be greater than 16'

/* The bank transfer window: 29:47, as the original's markup and its timer both
   started from. */
const COUNTDOWN_START = 29 * 60 + 47

/**
 * Kept verbatim from the original, including the empty alternative in the verve
 * pattern — `/^(506|650|)/` matches any string, so every card that is not Visa
 * or Mastercard reads as Verve and the final 'unknown' return is unreachable
 * once a digit has been typed.
 */
function detectCardBrand(number) {
  if (!number) return 'unknown'
  if (/^4/.test(number)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'mastercard'
  if (/^(506|650|)/.test(number)) return 'verve'
  return 'unknown'
}

function formatCountdown(seconds) {
  if (seconds <= 0) return 'Expired'
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export default function MakePayment() {
  useDocumentTitle('Payment | BrightMinds Tutors')

  const [searchParams] = useSearchParams()
  const reff = searchParams.get('reff')

  const [paymentDetails, setPaymentDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('card')

  const [cardNumber, setCardNumber] = useState('')
  const [cardBrand, setCardBrand] = useState('unknown')
  const [expiry, setExpiry] = useState('')

  /* null is the original's initial DOM: the <p> is empty but not yet carrying
     `inactive`, so it still contributes its 4px margins to the form row. '' is
     "validated, nothing to say" — that is when the class goes on. */
  const [cardNumberError, setCardNumberError] = useState(null)

  const [processing, setProcessing] = useState(false)
  const [openingPaystack, setOpeningPaystack] = useState(false)
  const [reference, setReference] = useState(null)
  const [error, setError] = useState(null)
  const [panelsHidden, setPanelsHidden] = useState(false)

  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)

  useEffect(() => {
    let current = true

    // Resolves to null rather than throwing, so there is nothing to catch here.
    getPaymentDetails(reff).then((details) => {
      if (current) setPaymentDetails(details)
    })

    return () => {
      current = false
    }
  }, [reff])

  /* One-second tick that stops at zero, as the original's cleared interval did.
     It runs from mount whether or not the bank tab is on screen — again as
     before, since the countdown node was always in the document. */
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const amount = paymentDetails ? formatCurrency(paymentDetails.monthly_price) : '30,000'
  const bankReference = paymentDetails ? paymentDetails.reference_code : 'BM-2847'

  function handleCardNumberChange(event) {
    const raw = event.target.value.replace(/\D/g, '')
    // Regroup into 4-digit blocks.
    const formatted = (raw.match(/.{1,4}/g) || []).join(' ')

    setCardNumber(formatted)
    setCardBrand(detectCardBrand(raw))

    /* Kept exactly as the original measured it: the check is on the *formatted*
       string, spaces included, so 13 digits ("4242 4242 4242 4") already passes
       a message that talks about 16. Same rule, same wording, same off-by-three
       on both the input and the submit path below. */
    setCardNumberError(formatted.length < 16 ? CARD_NUMBER_ERROR : '')
  }

  function handleExpiryChange(event) {
    let value = event.target.value.replace(/\D/g, '').slice(0, 4)
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`
    }
    setExpiry(value)
  }

  async function handleCopyAccount() {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (copyError) {
      console.warn('copy failed', copyError)
    }
  }

  /**
   * The one call both payment methods make. `payment_method` and
   * `reference_code` are the field names Flask expects.
   *
   * On failure the original showed the error hero *and* still ran the success
   * reveal 700ms later — `document.querySelector('.alert')` matched the success
   * panel itself, so the hero simply took that panel's place. Reproduced: the
   * panel is revealed either way, and `error` decides what it contains.
   */
  async function submitPayment(paymentMethod) {
    const result = await makePayment({
      payment_method: paymentMethod,
      reference_code: paymentDetails.reference_code,
    })

    if (!result.valid) {
      setError(result.message)
    }
    setReference(result.reference)
    setTimeout(() => setPanelsHidden(true), 700)
  }

  async function handleCardPayment(event) {
    event.preventDefault()

    // Nothing to pay against until the booking's details have arrived — the
    // original page was wholly inert until then.
    if (!paymentDetails) return

    if (cardNumber.length < 16) {
      setCardNumberError(CARD_NUMBER_ERROR)
      return
    }
    setCardNumberError('')

    await submitPayment('card')
    // The original relabelled the button only after the response came back.
    setProcessing(true)
  }

  async function handlePaystackPayment() {
    if (!paymentDetails) return

    setOpeningPaystack(true)
    await submitPayment('paystack')
  }

  const alertVisible = Boolean(error) || panelsHidden

  return (
    <DashboardLayout className="payment-page page-shell">
      <main className="page-main">
        <div className="payment-main">
          <section className="payment-section surface-card">
            <div className="section-heading">
              <p className="eyebrow">Payment details</p>
              <h2>Complete Payment</h2>
              <p className="secure-note">
                <i className="fa-solid fa-lock"></i> Secured by Paystack
              </p>
            </div>

            {/* `inactive` lands here on success exactly as it did in the
                original — and, exactly as in the original, it does not hide
                anything: `.payment-tabs { display: flex }` outranks the shared
                one-class `.inactive`, so the button row stays on screen while
                `.tab-panels` (which has no display rule of its own) goes. */}
            <div className={`payment-tabs${panelsHidden ? ' inactive' : ''}`} role="tablist">
              {TABS.map((tab) => (
                <button
                  className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  key={tab.id}
                >
                  {/* Every one of these read alt="card icon" in the original. */}
                  <img src={tab.icon} alt="card icon" className="tab-icon" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={`tab-panels${panelsHidden ? ' inactive' : ''}`}>
              {/* Card */}
              <div className={`tab-panel${activeTab === 'card' ? '' : ' inactive'}`} id="card">
                <form id="card-form" className="payment-form" onSubmit={handleCardPayment}>
                  <div className="form-row">
                    <label>Cardholder name</label>
                    <input
                      id="card-name"
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-row card-number-row">
                    <label>Card number</label>
                    <div className="card-input-wrap">
                      <input
                        id="card-number"
                        className="form-control"
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        maxLength="19"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required
                      />
                      <div className="card-brand" id="card-brand">
                        <img src={BRAND_ICONS[cardBrand]} alt={cardBrand} />
                      </div>
                    </div>
                    <p
                      className={`msg error card-number-error${
                        cardNumberError === '' ? ' inactive' : ''
                      }`}
                    >
                      {cardNumberError}
                    </p>
                  </div>
                  <div className="form-row two-cols">
                    <div>
                      <label>Expiry</label>
                      <input
                        id="card-expiry"
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={expiry}
                        onChange={handleExpiryChange}
                        required
                      />
                    </div>
                    <div>
                      <label>CVV</label>
                      <input
                        id="card-cvv"
                        className="form-control"
                        placeholder="123"
                        maxLength="4"
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                  {/* The nested `.payment-amount` is the original's markup: the
                      inner one inherits the row's border-top and padding. */}
                  <div className="payment-amount">
                    <p>Total amount</p>
                    <div className="payment-amount">
                      <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/material-outlined/24/naira.png"
                        alt="naira"
                        className="currency-icon"
                      />
                      <span className="amount">{amount}</span>
                    </div>
                  </div>
                  <button id="pay-btn" className="cta-btn gold full" type="submit">
                    {processing ? (
                      'Processing...'
                    ) : (
                      <>
                        Pay
                        <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Bank Transfer — the original replaced this panel's innerHTML on
                  load with the same markup, only to drop the amount and the
                  reference in. Here the values are just interpolated. */}
              <div className={`tab-panel${activeTab === 'bank' ? '' : ' inactive'}`} id="bank">
                <div className="bank-card surface-card">
                  <div className="bank-row">
                    <span className="label">Bank</span>
                    <span className="value">Stark Bank</span>
                  </div>
                  <div className="bank-row">
                    <span className="label">Account Number</span>
                    <span className="value">
                      <span id="account-number">{ACCOUNT_NUMBER}</span>{' '}
                      <button id="copy-account" className="mini-btn" onClick={handleCopyAccount}>
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </span>
                  </div>
                  <div className="bank-row">
                    <span className="label">Account Name</span>
                    <span className="value">BrightMind Tutors</span>
                  </div>
                  <div className="bank-row">
                    <span className="label">Amount</span>
                    <span className="value">₦{amount}</span>
                  </div>
                  <div className="bank-row">
                    <span className="label">Reference</span>
                    <span className="value" id="bank-ref">
                      {bankReference}
                    </span>
                  </div>
                  <div className="bank-row">
                    <span className="label">Expires in</span>
                    <span className="value">
                      <span id="countdown">{formatCountdown(countdown)}</span>
                    </span>
                  </div>
                </div>
                <p className="muted">
                  Once you complete the transfer your booking will be confirmed
                  automatically.
                </p>
              </div>

              {/* USSD */}
              <div className={`tab-panel${activeTab === 'ussd' ? '' : ' inactive'}`} id="ussd">
                <div className="ussd-list">
                  {USSD_CODES.map(({ bank, code }) => (
                    <div className="ussd-row" key={bank}>
                      <strong>{bank}</strong>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
                <p className="muted">
                  Dial your bank's code on your phone to complete payment. Your booking
                  will be confirmed once payment is received.
                </p>
              </div>

              {/* Paystack */}
              <div
                className={`tab-panel${activeTab === 'paystack' ? '' : ' inactive'}`}
                id="paystack"
              >
                <div className="paystack-wrap">
                  <button
                    id="pay-paystack"
                    className="cta-btn blue full"
                    onClick={handlePaystackPayment}
                    disabled={openingPaystack}
                  >
                    {openingPaystack ? 'Opening...' : 'Pay with Paystack'}
                  </button>
                </div>
              </div>
            </div>

            {/* Success state, inactive by default — and the container the error
                hero takes over on failure. */}
            <div
              id="payment-success"
              className={`alert payment-success${alertVisible ? '' : ' inactive'}`}
            >
              {error ? (
                <div className="alert__hero">
                  <div className="hero-content">
                    <p className="eyebrow">Payment Error</p>
                    <h2 style={{ color: 'var(--Danger)' }}>Error</h2>
                    <p style={{ color: 'var(--Danger)' }}>{error}</p>
                    <div className="hero-actions">
                      <Link to="/dashboard" className="cta-btn gold">
                        Back to dashboard
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="alert__icon">
                    <img src="/assets/icons/error.svg" alt="BrightMind tutor" />
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src="/assets/icons/icon-checkbox-check.svg"
                    alt="card icon"
                    className="payment-success-icon"
                  />
                  <h2>Payment Successful</h2>
                  <p className="muted">
                    Transaction ref: <span id="tx-ref">{reference}</span>
                  </p>
                  <p>Your tutor will contact you before your first session</p>
                  <div className="success-actions">
                    <Link to="/dashboard" className="cta-btn blue">
                      Go to Dashboard
                    </Link>
                    <Link
                      to={`/receipt?reff=${reference}`}
                      id="view-receipt-btn"
                      className="cta-btn gold"
                    >
                      View Receipt
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Empty in the original and never touched by its script — the
                error branch above is the `.alert` its querySelector found. */}
            <div className="alert payment-pending inactive"></div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
