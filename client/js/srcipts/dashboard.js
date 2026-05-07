import { openNavMenu, closeNavMenu, openMoreLinks } from "./navaMenu.js";
import { hideOverlay, showOverlay } from "./formPopup.js";
const dashboardNavMenu = document.querySelector('.dashboard-navbar');
const dashboardNavMenuBtn = document.querySelector('.dashboard-nav-btn');
const closeDashboardNavBtn = document.querySelector('.dashboard-close-nav-btn');
const overlay = document.querySelector('.overlay');

function closeDashboardMenu() {
    hideOverlay(overlay);
    closeNavMenu(dashboardNavMenu);
    closeNavMenu(closeDashboardNavBtn);
    openNavMenu(dashboardNavMenuBtn);
}

dashboardNavMenuBtn.addEventListener('click', () =>{
    openNavMenu(dashboardNavMenu);
    openNavMenu(closeDashboardNavBtn);
    closeNavMenu(dashboardNavMenuBtn);
    showOverlay(overlay)
});

closeDashboardNavBtn.addEventListener('click', ()=>{
    closeDashboardMenu();
});

overlay?.addEventListener('click', () => {
    closeDashboardMenu();
});

document.addEventListener('click', (event) => {
    const clickedInsideDashboardNav = event.target.closest('.nav-btn-wrapper');

    if (!clickedInsideDashboardNav && dashboardNavMenu.classList.contains('active')) {
        closeDashboardMenu();
    }
});
