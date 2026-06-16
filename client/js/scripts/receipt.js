import { formatCurrency,formatDateTime, getQueryParamValue} from "../utils/helpers.js";
import { getReceipt } from "../api/api.js";

const ref = getQueryParamValue('reff')
const receiptDetails = await getReceipt(ref);
const receipt = document.querySelector('.receipt')
const downloadBtn = document.querySelector('.download-btn')
console.log(receiptDetails)
console.log(receiptDetails.amount)
if(receipt){
    receipt.innerHTML = `
    <header class="header">
            <div class="brand">
                <div class="logo">
                    <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                    <p>BrightMinds Tutors</p>
                </div>
                <span class="eyebrow">Payment receipt</span>
            </div>
            <span class="status">Paid</span>
      </header>
      <section class="hero">
            <div>
                <p class="label">Receipt total</p>
                <strong class="amount">NGN ${formatCurrency(receiptDetails.amount)}</strong>
            </div>
            <div>
                <p class="label">Receipt no.</p>
                <span class="reference">${receiptDetails.payment_ref}</span>
            </div>
      </section>
      <section class="grid">
            <div class="box">
                <p class="label">Service</p>
                <h2>${receiptDetails.course} tutoring</h2>
            </div>
            <div class="box">
                <p class="label">Account</p>
                <h3>${receiptDetails.parent_name}</h3>
                <p>BrightMind user account</p>
            </div>
      </section>
      <section class="details">
            <div><span>Payment date</span><strong>${formatDateTime(receiptDetails.paid_at)}</strong></div>
            <div><span>Payment method</span><strong>${receiptDetails.payment_method}</strong></div>
            <div><span>Payment status</span><strong>Paid</strong></div>
      </section>
      <section class="items">
            <div class="row head"><span>Description</span><span>Amount</span></div>
            <div class="row item">
                <span>${receiptDetails.course} tutoring sessions</span><strong>NGN ${formatCurrency(receiptDetails.amount)}</strong>
            </div>
            <div class="row total">
                <span>Total paid</span><strong>NGN ${formatCurrency(receiptDetails.amount)}</strong>
            </div>
      </section>
      <footer class="footer">
            <p>Thank you for learning with BrightMinds Tutors.</p>
            <span><a href="mailto:info@brightmindstutors.com" class="footer-link">info@brightmindtutors.com</a></span>
      </footer>
    `

}
function downloadReceipt(receipt, paymentRef){
    const opt = {
        margin: 10,
        filename: `receipt-${paymentRef}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 11, allowTaint: true, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(receipt).save();
}

downloadBtn.addEventListener('click', ()=>{
    downloadReceipt(receipt, receiptDetails.payment_ref)
});