import { openForm } from "../auth/authForm.js";
const overlay = document.querySelector('.dark-overlay');
const loginForm = overlay?.querySelector('.login-form');


document.addEventListener('DOMContentLoaded', ()=>{
    const params = new URLSearchParams(window.location.search);
    if(params.get('auth') === 'required'){
        openForm(overlay, loginForm);
    }

});
