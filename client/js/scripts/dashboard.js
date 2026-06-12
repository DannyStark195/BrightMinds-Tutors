import { getHourOfDay } from "../utils/helpers.js";
import { getUserProfile, getReviewedBookings, getBookings } from "../api/api.js";
const greeting = document.querySelector('#greeting');
const profileName = document.querySelector('#profileName');
const numPayments = document.querySelector('#no-payments');
const numBookings = document.querySelector('#no-bookings');
const numReviews = document.querySelector('#no-reviews');
const nextLessonDescription = document.querySelector('#next-lesson-desc');
const nextLessonDate = document.querySelector('#next-lesson-date');
const paymentStatusDescription = document.querySelector('#payment-status-desc');
const paymentStatusBalance = document.querySelector('#payment-status-balance');
const bookingList = document.querySelector('.booking-list');

// async function renderUserProfile(){
const userProfile = await getUserProfile();
const reviews = await getReviewedBookings();
const bookings = await getBookings()

const hour = getHourOfDay()
greeting.innerHTML = `Good ${hour}`
numPayments.textContent = '0';
numReviews.textContent = reviews?reviews.length: '0';
numBookings.textContent = bookings?bookings.length: '0';
profileName.textContent = userProfile.username? userProfile.username: '';

if(!bookings){
    bookingList.innerHTML = '<p>No bookings yet<p>'
}
let html = ""
bookings.forEach(booking => {
    html += `
        <a href="booking-details.html" class="booking-card surface-card">
                                <div class="card-header">
                                    <div>
                                        <span class="card-subject">Mathematics</span>
                                        <p>Mon, Wed, Fri - Physical - Lekki</p>
                                    </div>
                                    <span class="status confirmed">Confirmed</span>
                                </div>
                                <div class="progress-tracker">
                                    <div class="progress w-100"></div>
                                    <div class="step active"><span>1</span><p>Submitted</p></div>
                                    <div class="step active"><span>2</span><p>Review</p></div>
                                    <div class="step active"><span>3</span><p>Assigned</p></div>
                                    <div class="step active"><span>4</span><p>Confirmed</p></div>
                                </div>
                                <div class="card-footer">
                                    <span class="reference">BM-2847</span>
                                    <span class="date">Submitted 3 May 2026</span>
                                </div>
                            </a>
    `
});

bookingList.innerHTML = html
// }


// renderUserProfile()