const reviewForm = document.querySelector('.review-form');

reviewForm.addEventListener('submit', (e) =>{
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEnteries(formData);

        console.log(data)

})