import { closeFormPopup, openLoginForm, openSignupForm } from "./formPopup.js";
import { openNavMenu, closeNavMenu, openMoreLinks } from "./navaMenu.js";
const overlay = document.querySelector('.dark-overlay');
const signupTriggers = document.querySelectorAll('.signup-popup, .open-signup');
const loginTriggers = document.querySelectorAll('.login-popup, .open-login');
const cancelButtons = document.querySelectorAll('.cancel-form-popup');
const navMenu = document.querySelector('.navbar');
const openNavMenuBtn = document.querySelector('.nav-btn');
const moreLinks = document.querySelector('.more-links')
const closeNavMenuBtn = document.querySelector('.close-nav-btn')
const dashboardNavMenu = document.querySelector('.dashboard-navbar');
const dashboardNavMenuBtn = document.querySelector('.dashboard-nav-btn');
const closeDashboardNavBtn = document.querySelector('.dashboard-close-nav-btn');
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

dashboardNavMenuBtn.addEventListener('click', () =>{
    openNavMenu(dashboardNavMenu);
    openNavMenu(closeDashboardNavBtn);
    closeNavMenu(dashboardNavMenuBtn)
});

closeDashboardNavBtn.addEventListener('click', ()=>{
    closeNavMenu(dashboardNavMenu);
    closeNavMenu(closeDashboardNavBtn);
    openNavMenu(dashboardNavMenuBtn);
});