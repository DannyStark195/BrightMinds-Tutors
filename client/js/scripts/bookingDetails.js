import { getBookingDetails, getUserProfile } from "../api/api.js";
import { formatDate } from "../utils/helpers.js";
const bookingRef = document.querySelector('#booking-ref');
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
const cancelBookingBtn = document.querySelector('#cancel-booking-btn');


function getBookingId(){
    const params = new URLSearchParams(window.location.search);
    const id= params.get('id')
    console.log(id)
    if(id) return id
}

const id = getBookingId()

const userProfile = await getUserProfile()
const bookingDetails = await getBookingDetails(id)

console.log(userProfile)
console.log(bookingDetails);

// if(!bookingDetails) {
//     return
// }

bookingRef.textContent = bookingDetails.reference_code
bookingTutorImg.src = bookingDetails.tutor.profile_pic || './assets/images/avatar/default_avatar'
bookingSubject.textContent = bookingDetails.course.course_name
bookingTutor.textContent = bookingDetails.tutor.tutor_name
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

bookingCost.textContent = bookingDetails.monthly_price
bookingStatus.textContent = bookingDetails.status