import { activateElement, deactivateElement } from "../utils/helpers.js";
const headerHtml = document.querySelector('.header');
headerHtml.innerHTML = `
                    <div class="logo">
                        <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                        <p>BrightMind Tutors</p>
                    </div>
                    <div class="nav-btn-wrapper">
                        <div class="cross-btn dashboard-close-nav-btn">
                            <i class="fa-solid fa-xmark"></i>
                        </div>
                        <div class="dashboard-nav-btn active">
                            <img src="./assets/icons/menu.svg" alt="menu icon">
                        </div>
                        <nav class="navbar dashboard-navbar">
                                <div class="profile">
                                    <div class="profile-img">
                                        <img src="./assets/images/avatars/profiles/vector-flat-illustration-grayscale-avatar-600nw-2264922221.webp" alt="user profile picture">
                                    </div>
                                    <div class="profile-info">
                                        <p class="profile-name">Daniel</p>
                                        <a href="profile.html">
                                            My profile 
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                                <div class="more-links d">
                                    <div class="link">
                                        <i class="fa-solid fa-book"></i>
                                        <a href="book.html"><button class="">Book a tutor</button></a>
                                    </div>
                                    <div class="link">
                                        <i class="fa-solid fa-receipt"></i>
                                        <a href="./my-payments.html"><button class="">My payments</button></a>
                                    </div>
                                    <div class="link">
                                        <i class="fa-solid fa-star"></i>
                                        <a href="review.html"><button class="">Review</button></a>
                                    </div>
                                    <div class="link">
                                        <i class="fa-solid fa-graduation-cap"></i>
                                        <a href="become-tutor.html"><button class="">Become a tutor</button></a>
                                    </div>
                                </div>
                                <a href="logout" class="logout-btn"><button type="submit" class="cta-btn gold">Log out</button></a>

                        </nav>
                    </div>
`
const dashboardNavMenu = document.querySelector('.dashboard-navbar');
const dashboardNavMenuBtn = document.querySelector('.dashboard-nav-btn');
const closeDashboardNavBtn = document.querySelector('.dashboard-close-nav-btn');
const overlay = document.querySelector('.overlay');
const moreLinks = document.querySelector('.more-links')

function closeDashboardMenu() {
    deactivateElement(overlay);
    deactivateElement(dashboardNavMenu);
    deactivateElement(closeDashboardNavBtn);
    activateElement(dashboardNavMenuBtn);
}

dashboardNavMenuBtn.addEventListener('click', () =>{
    activateElement(dashboardNavMenu);
    activateElement(closeDashboardNavBtn);
    activateElement(moreLinks)
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
