import { getHourOfDay, formatDate } from "../utils/helpers.js";
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
    const status = booking.status
    const statusHtml = `
        <div class="progress ${booking.status === 'pending'||booking.status==='rejected'?'w-50':booking.status==='approved'?'w-75':'w-100'}"></div>
        <div class="step  ${booking.status === 'pending'||booking.status==='rejected'?'active':booking.status==='approved'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>1</span><p>Submitted</p></div>
        <div class="step ${booking.status === 'pending'||booking.status==='rejected'?'active':booking.status==='approved'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>2</span><p>Review</p></div>
        <div class="step ${booking.status === 'approved'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>3</span><p>Approved</p></div>
        <div class="step ${booking.status === 'active'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>4</span><p>Active</p></div>
    `
    html += `
        <a href="booking-details.html?id=${booking.id}" class="booking-card surface-card">
                                <div class="card-header">
                                    <div>
                                        <span class="card-subject">${booking.course.course_name}</span>
                                        <p>${booking.preferred_days}- ${booking.session_type === 'physical'?booking.address:booking.meeting_link?booking.meeting_link:'meeting link not set yet'}</p>
                                    </div>
                                    <span class="status ${booking.status}">${booking.status}</span>
                                </div>
                                <div class="progress-tracker">
                                    ${statusHtml}
                                </div>
                                <div class="card-footer">
                                    <span class="reference">${booking.reference_code}</span>
                                    ${booking.status === 'approved'?`<a href="payment.html?${booking.reference_code}" class="cta-btn proceed-payment">Proceed to payment <i class="fa-solid fa-arrow-right"></i></a>`:''}
                                    <span class="date">Submitted ${formatDate(booking.created_at)}</span>
                                </div>
                            </a>
    `
});

bookingList.innerHTML = html
// }


// renderUserProfile()