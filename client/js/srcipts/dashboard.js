const numPayments = document.querySelector('#no-payments');
const numBookings = document.querySelector('#no-bookings');
const numReviews = document.querySelector('#no-reviews');

numBookings.textContent = '0';
numPayments.textContent = '0';
numReviews.textContent = '0';

const nextLessonDescription = document.querySelector('#next-lesson-desc');
const nextLessonDate = document.querySelector('#next-lesson-date');
const paymentStatusDescription = document.querySelector('#payment-status-desc');
const paymentStatusBalance = document.querySelector('#payment-status-balance');

const bookingList = document.querySelector('booking-list');