import { activateElement, deactivateElement } from "../utils/activateDeactivate.js";
const navMenu = document.querySelector('.navbar');
const openNavMenuBtn = document.querySelector('.nav-btn');
const moreLinks = document.querySelector('.more-links')
const closeNavMenuBtn = document.querySelector('.close-nav-btn')


openNavMenuBtn.addEventListener('click', () =>{
    activateElement(navMenu)
    activateElement(moreLinks)
});

closeNavMenuBtn.addEventListener('click', ()=>{
    deactivateElement(navMenu)
});

