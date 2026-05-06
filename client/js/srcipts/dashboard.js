import { openNavMenu, closeNavMenu, openMoreLinks } from "./navaMenu.js";

const dashboardNavMenu = document.querySelector('.dashboard-navbar');
const dashboardNavMenuBtn = document.querySelector('.dashboard-nav-btn');
const closeDashboardNavBtn = document.querySelector('.dashboard-close-nav-btn');


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