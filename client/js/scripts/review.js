import { getBookingsForReview, getReviewedBookings, createReview } from "../api/api.js";
import { collectData } from "../utils/formHelpers.js";


const reviewForm = document.querySelector('.review-form');
function renderReviewForm(){
        reviewForm.innerHTML = `
                <label for="booking">
                                Booking
                                <select class="form-control" name="bookingId" id="booking">
                                    
                                </select>
                            </label>
                            <label>
                                Rating
                                <div class="rating-picker">
                                    <label class="rating" id="star-1">
                                        <i class="fa-regular fa-star"></i>
                                        <input type="radio" name="rating" value="1" class="hidden-radio rating-btn" data-star="1" required>
                                    </label>
                                    <label class="rating" id="star-2">
                                        <i class="fa-regular fa-star"></i>
                                        <input type="radio" name="rating" value="2" class="hidden-radio rating-btn" data-star="2">
                                    </label>
                                    <label class="rating" id="star-3">
                                        <i class="fa-regular fa-star"></i>
                                        <input type="radio" name="rating" value="3" class="hidden-radio rating-btn" data-star="3">
                                    </label>
                                    <label class="rating" id="star-4">
                                        <i class="fa-regular fa-star"></i>
                                        <input type="radio" name="rating" value="4" class="hidden-radio rating-btn" data-star="4">
                                    </label>
                                    <label class="rating" id="star-5">
                                        <i class="fa-regular fa-star"></i>
                                        <input type="radio" name="rating" value="5" class="hidden-radio rating-btn" data-star="5">
                                    </label>
                                </div>
                            </label>
                            <label for="feedback">
                                Feedback
                                <textarea class="form-control" placeholder="Tell us what worked well and what could be better." id="feedback" name="feedback" required></textarea>
                            </label>
                            <p class="msg error inactive"></p>
                            <button class="cta-btn gold" type="submit">
                                Submit review
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
        `
}

renderReviewForm()
const msg = reviewForm.querySelector('.msg.error');

let bookingsForReview = await getBookingsForReview()
let reviewedBookings = await getReviewedBookings()
console.log(bookingsForReview)
console.log(reviewedBookings)

async function renderReviewedBookings(){
const reviewList = document.querySelector('.review-list');
        let html = ""
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
                html += `
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
                                <span>Reviewed ${formattedDate}</span>
                        </article>
                `
                
        });
        
        reviewList.innerHTML = html;
}

renderReviewedBookings();

async function renderUnReviewedBookings(){
        const bookings = document.querySelector('#booking');
        let html = "";
                bookingsForReview.forEach(booking =>{
                html += `<option class="" value="${booking.booking_id}">${booking.course_name} with ${booking.tutor_name}  (<span class="${booking.status}">${booking.status}</span>)</option>`
                
        });
        bookings.innerHTML = html;
}

renderUnReviewedBookings();

function initStarPickers(){
const ratings = document.querySelectorAll('.rating-btn');
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
}
initStarPickers()
reviewForm.addEventListener('submit', (e) =>{
        e.preventDefault();
        handleCreateReview()
})

async function handleCreateReview(){
        if(bookingsForReview.length === 0){
                msg.textContent = 'No more bookings to review';
                 msg.classList.remove('inactive');
                return
        }
        const data = collectData(reviewForm);
        console.log(data)
        const {valid, message} = await createReview(data)

        if(!valid){
                msg.textContent = message
                msg.classList.remove('inactive')
                return
        }

        msg.classList.remove('error');
        msg.classList.remove('inactive')
        msg.textContent = message
        msg.classList.add('success');

        bookingsForReview = await getBookingsForReview();
        reviewedBookings = await getReviewedBookings();
        renderReviewForm();
        initStarPickers()
        renderUnReviewedBookings()
        renderReviewedBookings();
}