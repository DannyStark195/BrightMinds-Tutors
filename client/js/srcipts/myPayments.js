    const numReciepts = document.querySelector('#no-reciepts');
    const numPendingPayments = document.querySelector('#no-pending-payments');
    const nextBilling = document.querySelector('#next-billing');
    const paymentsList = document.querySelector('.payments-list')
    numReciepts.textContent = '0';
    numPendingPayments.textContent = '0';
    nextBilling.textContent = 'no pending payments'

    // paymentsList.innerHTML = ``