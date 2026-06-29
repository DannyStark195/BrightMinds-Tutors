import { getHourOfDay, formatDate } from "../utils/helpers.js";
import { getUserProfile, getReviewedBookings, getBookings, getPayments } from "../api/api.js";
import { showLoading, hideLoading } from "../components/loadingState.js";
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

const params = new URLSearchParams(window.location.search);
const token = params.get('token');
console.log(token)

if (token) {
    localStorage.setItem("brightminds-user-token", token);
    // clean the URL so token isn't visible
    window.history.replaceState({}, document.title, window.location.pathname);
}

async function initPage() {
    showLoading()
    
    try {
        const [userProfile, reviews, bookings, payments] = await Promise.all([
            getUserProfile(),
            getReviewedBookings(),
            getBookings(),
            getPayments()
        ]);

        const hour = getHourOfDay()
        greeting.innerHTML = `Good ${hour}`
        numPayments.textContent = payments?payments.length:'0';
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
                <div class="progress ${booking.status === 'pending'||booking.status==='rejected'?'w-50':booking.status==='approved'||booking.status==='renew'?'w-75':'w-100'}"></div>
                <div class="step  ${booking.status === 'pending'||booking.status==='rejected'?'active':booking.status==='approved'||booking.status==='renew'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>1</span><p>Submitted</p></div>
                <div class="step ${booking.status === 'pending'||booking.status==='rejected'?'active':booking.status==='approved'||booking.status==='renew'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>2</span><p>Review</p></div>
                <div class="step ${booking.status === 'approved'||booking.status==='renew'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>3</span><p>Approved</p></div>
                <div class="step ${booking.status === 'active'||booking.status==='active'||booking.status==='completed'?'active':''}"><span>4</span><p>Active</p></div>
            `
            html += `
                <a href="booking-details?reff=${booking.reference_code}" class="booking-card surface-card">
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
                        ${booking.status === 'approved'?`<a href="make-payment?reff=${booking.reference_code}" class="cta-btn proceed-payment">Proceed to payment <i class="fa-solid fa-arrow-right"></i></a>`:''}
                        ${booking.status === 'renew'?`<a href="make-payment?reff=${booking.reference_code}" class="cta-btn proceed-payment">Renew Booking<i class="fa-solid fa-arrow-right"></i></a>`:''}
                        <span class="date">Submitted ${formatDate(booking.created_at)}</span>
                    </div>
                </a>
            `
        });
        
        bookingList.innerHTML = html    
    } catch (error) {
        console.log('Failed to load page data', 'error');
        return
    } finally {
        hideLoading();
    }
}

initPage();
