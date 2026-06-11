import { openForm } from "../auth/authForm.js";
import { getFeaturedTestimonials } from "../api/api.js";
const overlay = document.querySelector('.dark-overlay');
const loginFormContainer = overlay?.querySelector('.login-form-container');


document.addEventListener('DOMContentLoaded', ()=>{
    const params = new URLSearchParams(window.location.search);
    if(params.get('auth') === 'required'){
        openForm(overlay, loginFormContainer);
    }

});

const testimonialList = document.querySelector('.testimonial-list');

async function renderFeaturedTestimonals(){
    const testimonials = await getFeaturedTestimonials();
    console.log(testimonials);
    
    if(!testimonials || testimonials.length === 0) return
    let html = ""
    testimonials.forEach((testimonial, index) => {
        let starHtml = "";
                const rating = testimonial.rating;
                console.log(rating)
                for(let i = 0; i < rating; i++){
                        starHtml += '<i class="fa-solid fa-star"></i>'
                }
                for(let i = 0; i< 5 - rating; i++){
                        starHtml += '<i class="fa-regular fa-star"></i>'
                }
        html+= `
            <li>
                <div class="testimonial ${index === 1? "white-bg": index ===2? "gold-bg":"dark-blue-bg"}">
                    <div class="details">
                        <div class="avatar">
                            <img src="${testimonial.parent_avatar}" alt="testimonial avatar">
                        </div>
                        <div class="infos">
                            <p class="name">${testimonial.parent_name}</p>
                            <p class="desc">${testimonial.parent_bio}</p>
                        </div>
                    </div>

                    <p class="comment">"My son was struggling with Physics for two terms and I was really worried about his WAEC. After just six weeks with Mr. Emeka, his confidence completely changed. He's now the one explaining things to his classmates."</p>
                    <div class="stars" data-star="5.0">
                       ${starHtml}
                    </div>
                </div>
            </li>
        `
    });
}

renderFeaturedTestimonals()
