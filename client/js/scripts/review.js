import { getBookingsForReview, getReviewedBookings, createReview } from "../api/api.js";
import { collectData } from "../utils/formHelpers.js";

const reviewForm = document.querySelector('.review-form');
const ratings = document.querySelectorAll('.rating-btn');
const bookings = document.querySelector('#booking');
const reviewList = document.querySelector('.review-list');
 const msg = reviewForm.querySelector('.msg.error');
console.log(bookings);

const bookingsForReview = await getBookingsForReview()
const reviewedBookings = await getReviewedBookings()
console.log(bookingsForReview)
console.log(reviewedBookings)

bookingsForReview.forEach(booking =>{
        const html = `<option class="" value="${booking.booking_id}">${booking.course_name} with ${booking.tutor_name}  (<span class="${booking.status}">${booking.status}</span>)</option>`
        bookings.innerHTML += html
})
reviewedBookings.forEach(booking =>{
        let starHtml = "";
        const rating = booking.review.rating;
        console.log(rating)
        for(let i = 0; i < rating; i++){
                starHtml += '<i class="fa-solid fa-star"></i>'
        }
        for(let i = 0; i< 5 - rating; i++){
                starHtml += '<i class="fa-regular fa-star"></i>'
        }
        const [year, month, day] = booking.review.submitted_on.split('-');
        const dateObj = new Date(year, month - 1, day); 
        
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
        });
        const html = `
                <article class="review-card surface-card">
                        <div class="review-card-header">
                                <img src="${booking.tutor_profile_pic}" alt="${booking.tutor_name}">
                                <div>
                                        <h3>${booking.tutor_name}</h3>
                                        <p>${booking.course_name} tutor</p>
                                </div>
                        </div>
                        <div class="stars">
                                ${starHtml}
                        </div>
                        <p>${booking.review.feedback}</p>
                        <span>${formattedDate}</span>
                </article>
        `
        
        reviewList.innerHTML+= html;
})

console.log(ratings);
let currentRating = 0;
ratings.forEach(ratingBtn =>{
        ratingBtn.addEventListener('click', ()=>{
                const rating = Number(ratingBtn.dataset.star);
                console.log(rating);
                currentRating = rating;
                ratings.forEach(ratingBtn =>{
                        const rating = Number(ratingBtn.dataset.star);
                        const ratingIcon = ratingBtn.previousElementSibling;
                        ratingIcon.classList.remove('fa-solid');
                        if(rating <= currentRating){
                                ratingIcon.classList.add('fa-solid');
                        }
                })
        })
})

reviewForm.addEventListener('submit', (e) =>{
        e.preventDefault();
        handleCreateReview()
})

async function handleCreateReview(){
        const data = collectData(reviewForm);
        console.log(data)
        const {valid, message} = await createReview(data)

        if(!valid){
                msg.textContent = message
                msg.classList.remove('inactive')
                return
        }

        msg.classList.remove('error');
        msg.textContent = message
        msg.classList.add('success');

}