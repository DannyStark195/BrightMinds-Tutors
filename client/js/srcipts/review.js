const reviewForm = document.querySelector('.review-form');
const ratings = document.querySelectorAll('.rating-btn');
const bookings = document.querySelector('#booking');

console.log(bookings);

bookings.innerHTML = `
        <option>Mathematics with Miss Adaeze</option>
        <option>Biology with Mr Tunde</option>
        <option>English with Miss Ngozi</option>
`

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