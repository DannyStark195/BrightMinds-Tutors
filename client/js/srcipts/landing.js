import { openForm } from "./form.js";
const overlay = document.querySelector('.dark-overlay');
// const signupForm = overlay?.querySelector('.signup-form');
const loginForm = overlay?.querySelector('.login-form');


document.addEventListener('DOMContentLoaded', ()=>{
    const params = new URLSearchParams(window.location.search);

    if(params.get('auth') === 'required'){
        openForm(overlay, loginForm);
    }

});
