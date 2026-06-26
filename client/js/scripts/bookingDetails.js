import { getBookingDetails, getUserProfile, toggleFirstSessionHeld } from "../api/api.js";
import { formatDate, formatCurrency, getQueryParamValue } from "../utils/helpers.js";
import { showLoading, hideLoading } from "../components/loadingState.js";
const bookingRef = document.querySelector('#booking-ref');
const bookingStatusBadge = document.querySelector('#status-badge');
const bookingTutorImg = document.querySelector('#booking-tutor-img');
const bookingSubject = document.querySelector('#booking-subject');
const bookingTutor = document.querySelector('#booking-tutor');
const bookingSchedule = document.querySelector('#booking-schedule');
const bookingLocation = document.querySelector('#booking-location');
const bookingStartDate= document.querySelector('#booking-start-date');
const bookingNextBillingDate = document.querySelector('#booking-next_billing');
const bookingStudentName = document.querySelector('#booking-student-name');
const bookingParentName = document.querySelector('#booking-parent-name');
const bookingParentNumber = document.querySelector('#booking-parent-number');
const bookingParentEmail = document.querySelector('#booking-parent-email');
const bookingSessionLength = document.querySelector('#booking-session-length');
const bookingSessionWeekly= document.querySelector('#booking-session-weekly');
const bookingNextLesson = document.querySelector('#booking-next-lesson');
const bookingCost= document.querySelector('#booking-cost');
const bookingStatus = document.querySelector('#booking-status');
const bookingStatusMessage = document.querySelector('#booking-status-message')
const cancelBookingBtn = document.querySelector('#cancel-booking-btn');
const completeBookingBtn = document.querySelector('#complete-booking-btn');
const firstSessionHeld = document.querySelector('.first-session');
const firstSessionHeldBtn = document.querySelector('.first-session-held-btn')
const completedCard = document.querySelector('.completed-card');
const cancelCard = document.querySelector('.cancel-card');


async function initPage() {
    showLoading()
    
    try {
        const [userProfile, reff, bookingDetails] = await Promise.all([
            getUserProfile(),
            getQueryParamValue('reff'),
            getBookingDetails(reff),
        ]);

        console.log(userProfile)
        console.log(bookingDetails);

        bookingRef.textContent = bookingDetails.reference_code
        bookingStatusBadge.classList.add(bookingDetails.status)
        bookingStatusBadge.textContent = bookingDetails.status
        bookingTutorImg.src = './assets/images/avatars/default_avatar.png'
        bookingTutor.textContent = 'Not assigned yet';

        if(bookingDetails.tutor){
        bookingTutorImg.src = bookingDetails.tutor.profile_pic?bookingDetails.tutor.profile_pic : './assets/images/avatar/default_avatar.png'
        bookingTutor.textContent = bookingDetails.tutor.tutor_name?bookingDetails.tutor.tutor_name : 'Not assigned yet'
        }
        bookingSubject.textContent = bookingDetails.course.course_name
        bookingSchedule.textContent = bookingDetails.preferred_days+ ' · '+ bookingDetails.time_window
        bookingLocation.textContent = bookingDetails.session_type === 'physical'? (
                bookingDetails.session_type + ' | '+ bookingDetails.address
            ): bookingDetails.session_type + ' | '  + (bookingDetails.meeting_link?bookingDetails.meeting_link: 'meeting link not set yet')
        bookingStartDate.textContent = formatDate(bookingDetails.start_date)
        bookingNextBillingDate.textContent = formatDate(bookingDetails.next_billing_date)
        bookingStudentName.textContent = bookingDetails.student.name
        bookingParentName.textContent = userProfile.username
        bookingParentNumber.textContent = userProfile.phone
        bookingParentEmail.textContent = userProfile.email

        bookingSessionLength.textContent = bookingDetails.hours_per_session 
        bookingSessionWeekly.textContent = bookingDetails.sessions_per_week

        bookingCost.textContent = formatCurrency(bookingDetails.monthly_price)
        bookingStatus.textContent = bookingDetails.status
        bookingStatus.classList.add(bookingDetails.status)

        if(bookingDetails.status === 'pending'){
            bookingStatusMessage.textContent = 'Your request has been confirmed and the tutor will be assigned shortly.'
        }
        else if(bookingDetails.status === 'approved'){
            bookingStatusMessage.innerHTML= `
                Your request has been approved, please make your payment and activate your booking. When this booking reaches auto-renew, the plan will update and you can renew it directly.
                <a href="make-payment?reff=${bookingDetails.reference_code}" class="cta-btn proceed-payment">Proceed to payment</a>
                `
        }
        else if(bookingDetails.status === 'renew'){
            bookingStatusMessage.innerHTML= `
                Renew your plan to continue lessons!.
                <a href="make-payment?reff=${bookingDetails.reference_code}" class="cta-btn proceed-payment">Renew Booking</a>
                `
        }
        else if(bookingDetails.status === 'active'){
            bookingStatusMessage.textContent = 'Your booking is now active!'
        }
        else if(bookingDetails.status === 'rejected' && bookingDetails.rejection_reason){
            bookingStatusMessage.textContent = 'Your request has been rejected for the following reasons: ' + bookingDetails.rejection_reason
        }
        else if(bookingDetails.status === 'completed'){
            bookingStatusMessage.textContent = 'You have completed this booking! Thank you for appreciating our service.'
            cancelCard.classList.add('inactive')
        }

        if(bookingDetails.status === 'renew'){
            completedCard.classList.remove('inactive')
            cancelCard.classList.add('inactive')
        }

        if(bookingDetails.status !== 'renew' && bookingDetails.status==='active'){
            cancelCard.classList.remove('inactive')
        }

        if(bookingDetails.status === 'rejected'){
            completedCard.classList.add('inactive')
            cancelCard.classList.add('inactive')
        }

        if(bookingDetails.status === 'active'){
            firstSessionHeld.classList.remove('inactive')
        }

        firstSessionHeldBtn.classList.toggle('on', bookingDetails.first_session_held)
        firstSessionHeldBtn.addEventListener('click', async ()=>{
            firstSessionHeldBtn.classList.toggle('on');
            const fstSessionHeld = firstSessionHeldBtn.classList.contains('on');
            console.log(fstSessionHeld)
            const data = {'booking_ref': bookingDetails.reference_code, 'first_session_held': fstSessionHeld}
            await toggleFirstSessionHeld(data);
            
        })
            
    } catch (error) {
        console.log('Failed to load page data', 'error');
        return
    } finally {
        hideLoading();
    }
}

initPage();
// const reff = getQueryParamValue('reff')

// const userProfile = await getUserProfile()
// const bookingDetails = await getBookingDetails(reff)
