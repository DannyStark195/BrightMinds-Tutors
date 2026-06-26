import { getPayments } from "../api/api.js";
import { formatCurrency, formatDateTime } from "../utils/helpers.js";
const numReciepts = document.querySelector('#no-reciepts');
const numPendingPayments = document.querySelector('#no-pending-payments');
const nextBilling = document.querySelector('#next-billing');
const paymentsList = document.querySelector('.payments-list')
// numReciepts.textContent = '0';
// numPendingPayments.textContent = '0';
// nextBilling.textContent = 'no pending payments'

const payments = await getPayments();

console.log(payments)
let html = ""
payments.forEach(payment => {
    html+= `
        <article class="receipt-card">
            <div class="receipt-main">
                <div class="receipt-title">
                    <h3>${payment.course}</h3>
                    <span class="status ${payment.payment_status}">${payment.payment_status}</span>
                </div>
                <div class="receipt-meta">
                    <span class="receipt-reference">${payment.payment_ref}</span>
                    <span>${formatDateTime(payment.paid_at)}</span>
                    <span>${payment.payment_method}</span>
                </div>
                <div class="receipt-actions">
                    <a href="receipt?reff=${payment.payment_ref}" class="cta-btn gold" id="view-receipt">
                        View receipt
                    </a>
                </div>
            </div>
            <p class="receipt-amount">NGN ${formatCurrency(payment.amount)}</p>
        </article>
    
    `
});
paymentsList.innerHTML = html