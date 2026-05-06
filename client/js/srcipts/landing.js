import { closeFormPopup, openLoginForm, openSignupForm } from "./formPopup.js";
import { openNavMenu, closeNavMenu, openMoreLinks } from "./navaMenu.js";
const overlay = document.querySelector('.dark-overlay');
const signupTriggers = document.querySelectorAll('.open-signup');
const loginTriggers = document.querySelectorAll('.open-login');
const cancelButtons = document.querySelectorAll('.cancel-form-popup');
const navMenu = document.querySelector('.navbar');
const openNavMenuBtn = document.querySelector('.nav-btn');
const moreLinks = document.querySelector('.more-links')
const closeNavMenuBtn = document.querySelector('.close-nav-btn')
const signupFormContainer = overlay?.querySelector('.signup-container');
const loginFormContainer = overlay?.querySelector('.login-container');

signupTriggers.forEach((button) => {
    button.addEventListener('click', () => openSignupForm(overlay, signupFormContainer));
});

loginTriggers.forEach((button) => {
    button.addEventListener('click', () => openLoginForm(overlay, loginFormContainer));
});

cancelButtons.forEach((button) => {
    button.addEventListener('click', () => closeFormPopup(overlay));
});

overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closeFormPopup(overlay);
    }
});



openNavMenuBtn.addEventListener('click', () =>{
    openNavMenu(navMenu)
    openMoreLinks(moreLinks)
});

closeNavMenuBtn.addEventListener('click', ()=>{
    closeNavMenu(navMenu)
});

