// payment.js - handles tabs, card brand detect, copy, countdown and simulated payments
const TABS = document.querySelectorAll('.tab-btn');
const PANELS = document.querySelectorAll('.tab-panel');
const AMOUNT = 12000;

function switchTab(targetId){
  PANELS.forEach(p=> p.classList.add('inactive'));
  TABS.forEach(b=> b.classList.remove('active'));
  const panel = document.getElementById(targetId);
  const btn = Array.from(TABS).find(b=>b.dataset.target===targetId);
  if(panel) panel.classList.remove('inactive');
  if(btn) btn.classList.add('active');
}

TABS.forEach(btn=>{
  btn.addEventListener('click', ()=> switchTab(btn.dataset.target));
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

function showSuccess(){
  const ref = 'BM-' + Math.floor(1000 + Math.random()*9000);
  if(txRef) txRef.textContent = ref;
  // hide panels and show success
  document.querySelectorAll('.tab-panels, .payment-tabs, .payment-header').forEach(el=> el.classList.add('inactive'));
  if(success) success.classList.remove('inactive');
}

// Card pay button
const payCardBtn = document.getElementById('pay-card');
if(payCardBtn) payCardBtn.addEventListener('click', ()=>{
  payCardBtn.disabled = true;
  payCardBtn.textContent = 'Processing...';
  setTimeout(()=>{
    showSuccess();
  }, 900);
});

// Paystack simulation
const payPaystack = document.getElementById('pay-paystack');
if(payPaystack) payPaystack.addEventListener('click', ()=>{
  payPaystack.disabled = true;
  payPaystack.textContent = 'Opening...';
  // simulate popup and success
  setTimeout(()=> showSuccess(), 700);
});

// Copy account number
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

// Download receipt
const downloadBtn = document.getElementById('download-receipt');
if(downloadBtn){
  downloadBtn.addEventListener('click', ()=>{
    const ref = txRef ? txRef.textContent : 'BM-0000';
    const content = `BrightMind Tutors - Payment Receipt\nReference: ${ref}\nAmount: ₦${AMOUNT.toLocaleString()}\nThank you for your payment.`;
    const blob = new Blob([content],{type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `receipt-${ref}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
}

// Initialize brand icon to generic
setBrandIcon('unknown');
