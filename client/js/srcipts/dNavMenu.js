import { activateElement, deactivateElement } from "../utils/activateDeactivate.js";
const dashboardNavMenu = document.querySelector('.dashboard-navbar');
const dashboardNavMenuBtn = document.querySelector('.dashboard-nav-btn');
const closeDashboardNavBtn = document.querySelector('.dashboard-close-nav-btn');
const overlay = document.querySelector('.overlay');

function closeDashboardMenu() {
    deactivateElement(overlay);
    deactivateElement(dashboardNavMenu);
    deactivateElement(closeDashboardNavBtn);
    activateElement(dashboardNavMenuBtn);
}

dashboardNavMenuBtn.addEventListener('click', () =>{
    activateElement(dashboardNavMenu);
    activateElement(closeDashboardNavBtn);
    deactivateElement(dashboardNavMenuBtn);
    activateElement(overlay);
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
