import { getBookingsForReview, createReview } from "../api/api.js";
import { collectData } from "../utils/formHelpers.js";

const reviewForm = document.querySelector('.review-form');
const ratings = document.querySelectorAll('.rating-btn');
const bookings = document.querySelector('#booking');
 const msg = reviewForm.querySelector('.msg.error');
console.log(bookings);

const bookingsForReview = await getBookingsForReview()

console.log(bookingsForReview)

bookingsForReview.forEach(booking =>{
        const html = `<option class="" value="${booking.booking_id}">${booking.course_name} with ${booking.tutor_name}  (<span class="${booking.status}">${booking.status}</span>)</option>`
        bookings.innerHTML += html
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