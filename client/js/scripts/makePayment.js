// payment.js - handles tabs, card brand detect, copy, countdown and simulated payments
import { getQueryParamValue, formatCurrency } from "../utils/helpers.js";
import { getPaymentDetails, makePayment } from "../api/api.js";


const reff = getQueryParamValue('reff');
const paymentDetails = await getPaymentDetails(reff);
console.log(paymentDetails)
const paymentAmount = formatCurrency(paymentDetails.monthly_price)
const paymentAmountHtml = document.querySelector('.amount');
const bankTab = document.querySelector('#bank');
bankTab.innerHTML = `
<div class="bank-card surface-card">
                                    <div class="bank-row"><span class="label">Bank</span><span class="value">Stark Bank</span></div>
                                    <div class="bank-row">
                                        <span class="label">Account Number</span>
                                        <span class="value">
                                            <span id="account-number">0105401010</span>
                                            <button id="copy-account" class="mini-btn">Copy</button>
                                        </span>
                                    </div>
                                    <div class="bank-row"><span class="label">Account Name</span><span class="value">BrightMind Tutors</span></div>
                                    <div class="bank-row"><span class="label">Amount</span><span class="value">₦${paymentAmount}</span></div>
                                    <div class="bank-row"><span class="label">Reference</span><span class="value" id="bank-ref">${paymentDetails.reference_code}</span></div>
                                    <div class="bank-row"><span class="label">Expires in</span><span class="value"><span id="countdown">29:47</span></span></div>
                                </div>
                                <p class="muted">Once you complete the transfer your booking will be confirmed automatically.</p>
`
paymentAmountHtml.textContent = paymentAmount;




















const TABS = document.querySelectorAll('.tab-btn');
const PANELS = document.querySelectorAll('.tab-panel');

function switchTab(tabId){
  PANELS.forEach(panel => panel.classList.add('inactive'));
  TABS.forEach(tab=> tab.classList.remove('active'));
  const panel = document.getElementById(tabId);
  const btn = Array.from(TABS).find(b=>b.dataset.tab===tabId);
  if(panel) panel.classList.remove('inactive');
  if(btn) btn.classList.add('active');
}

TABS.forEach(tabBtn=>{
  tabBtn.addEventListener('click', ()=> switchTab(tabBtn.dataset.tab));
});

// Card brand detection and formatting
const cardNumberInput = document.getElementById('card-number');
const cardBrand = document.getElementById('card-brand');
if(cardNumberInput){
  cardNumberInput.addEventListener('input', e=>{
    const raw = e.target.value.replace(/\D/g,'');
    // format as 4-digit groups
    const parts = raw.match(/.{1,4}/g) || [];
    e.target.value = parts.join(' ');
    // detect brand
    const brand = detectCardBrand(raw);
    setBrandIcon(brand);
    const cardNumberError = document.querySelector('.msg.error.card-number-error');
    cardNumberError.classList.add('inactive')
    if(e.target.value.length<16){
      cardNumberError.classList.remove('inactive');
      cardNumberError.textContent ='Card number should be greater than 16'
      return
    }
  });
}

function detectCardBrand(number){
  if(!number) return 'unknown';
  if(/^4/.test(number)) return 'visa';
  if(/^(5[1-5]|2[2-7])/.test(number)) return 'mastercard';
  if(/^(506|650|)/.test(number)) return 'verve';
  return 'unknown';
}

function setBrandIcon(brand){
  if(!cardBrand) return;
  let src = '';
  if(brand==='visa') src = './assets/icons/visa.svg';
  else if(brand==='mastercard') src = './assets/icons/mastercard.svg';
  else if(brand==='verve') src = './assets/icons/verve.svg';
  else src = './assets/icons/credit-card.svg';
  // set img if available
  cardBrand.innerHTML = `<img src="${src}" alt="${brand}">`;
}

// expiry formatting
const expiry = document.getElementById('card-expiry');
if(expiry){
  expiry.addEventListener('input', e=>{
    let v = e.target.value.replace(/\D/g,'').slice(0,4);
    if(v.length>2) v = v.slice(0,2) + '/' + v.slice(2);
    e.target.value = v;
  });
}

// Payment success
const success = document.getElementById('payment-success');
const txRef = document.getElementById('tx-ref');
const viewReceiptBtn = document.querySelector('#view-receipt-btn')
function displayPaymentSucess(){
  // hide panels and show success
  document.querySelectorAll('.tab-panels, .payment-tabs, .payment-header').forEach(el=> el.classList.add('inactive'));
  if(success) success.classList.remove('inactive');

}
const alert = document.querySelector('.alert')
function displayPaymentError(message){
    alert.classList.remove('inactive');
    alert.innerHTML = `
        <div class="alert__hero">
            <div class="hero-content">
                <p class="eyebrow">Payment Error</p>
                <h2 style="color: var(--Danger);">Error</h2>
                <p style="color: var(--Danger);">${message}</p>
                <div class="hero-actions">
                    <a href="dashboard.html" class="cta-btn gold">
                        Back to dashboard
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
            <div class="alert__icon">
                <img src="./assets/icons/error.svg" alt="BrightMind tutor">
            </div>
        </div>
    `
}
// Card pay button
const cardForm = document.querySelector('#card-form');
const payBtn = document.querySelector('#pay-btn')
console.log(cardForm)
if(cardForm) {
  cardForm.addEventListener('submit', (e)=>{
      e.preventDefault()
      handleCardPayment()
  });
}

async function handleCardPayment(){
   // payBtn.disabled = true;
  const cardNumberError = document.querySelector('.msg.error.card-number-error');
  cardNumberError.classList.add('inactive')
  if(cardNumberInput.value.length<16){
    cardNumberError.classList.remove('inactive');
    cardNumberError.textContent ='Card number should be greater than 16'
    return
  }
  const data = {payment_method: 'card', reference_code: paymentDetails.reference_code}
  const {valid, message, reference} = await makePayment(data)
  payBtn.textContent = 'Processing...';
   if(!valid){
      displayPaymentError(message)
  }
  viewReceiptBtn.href = `receipt.html?reff=${reference}`
  if(txRef) txRef.textContent = reference;
  setTimeout(()=>{
    displayPaymentSucess();
  }, 700);
}

// Paystack simulation
const payPaystack = document.getElementById('pay-paystack');
if(payPaystack) payPaystack.addEventListener('click', ()=>{
  payPaystack.disabled = true;
  payPaystack.textContent = 'Opening...';

  handlePaystackPayment(); 
});

async function handlePaystackPayment() {
  const data = {payment_method: 'paystack', reference_code: paymentDetails.reference_code}
  const {valid,message, reference} = await makePayment(data);
  if(!valid) displayPaymentError(message)
  viewReceiptBtn.href = `receipt.html?reff=${reference}`
  if(txRef) txRef.textContent = reference;
  setTimeout(()=> displayPaymentSucess(), 700);
}
const copyBtn = document.getElementById('copy-account');
const acctEl = document.getElementById('account-number');
if(copyBtn && acctEl){
  copyBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(acctEl.textContent.trim());
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1500);
    }catch(e){
      console.warn('copy failed', e);
    }
  });
}

// Countdown timer for bank transfer (start at 29:47)
const countdownEl = document.getElementById('countdown');
let countdownSeconds = 29*60 + 47;
let countdownTimer = null;
function startCountdown(){
  if(!countdownEl) return;
  function tick(){
    if(countdownSeconds <= 0){
      countdownEl.textContent = 'Expired';
      clearInterval(countdownTimer);
      return;
    }
    const m = Math.floor(countdownSeconds/60);
    const s = countdownSeconds % 60;
    countdownEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    countdownSeconds -= 1;
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}
startCountdown();


// Initialize brand icon to generic
setBrandIcon('unknown');
