import { getBookingsForReview } from "../api/api.js";

const reviewForm = document.querySelector('.review-form');
const ratings = document.querySelectorAll('.rating-btn');
const bookings = document.querySelector('#booking');

console.log(bookings);

const bookingsForReview = await getBookingsForReview()

console.log(bookingsForReview)

bookingsForReview.forEach(booking =>{
        const html = `<option class="">${booking.course_name} with ${booking.tutor_name}  (<span class="${booking.status}">${booking.status}</span>)</option><span class="${booking.status}">${booking.status}</span>`
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
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log(data);
})