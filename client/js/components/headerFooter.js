const headerHtml = document.querySelector('.header');
const footerHtml = document.querySelector('.footer');
headerHtml.innerHTML = `
                <div class="logo">
                    <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                    <p>BrightMinds Tutors</p>
                </div>

                <nav class="navbar">
                    <div class="cross-btn close-nav-btn">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                    <button class="gold open-signup phone-active"><div></div>Get Started</button>
                    <button class="open-login phone-active"><div></div>Log In</button>

                    <div class="more-links">
                        <a href="become-tutor.html"><button><div></div>Become a tutor</button></a>
                        <a href="pricing.html"><button><div></div>See Pricing</button></a>
                        <div class="call-container">
                            <p>Prefer to speak with us?</p>
                            <a href="tel:+2348092812010" class="call-btn">
                                <i class="fa-solid fa-phone"></i>
                                <div>
                                    <p>Call Now:</p>
                                    <p>08092812010</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </nav>

                <div class="nav-btn">
                    <img src="./assets/icons/menu.svg" alt="menu icon">
                </div>
`
footerHtml.innerHTML = `
    <div class="footer-top">
                    <div class="footer-left">
                        <div class="logo">
                            <img src="./assets/icons/tutor-logo-white.svg" alt="BrightMind logo">
                            <p>BrightMinds Tutors</p>
                        </div>
                        <p>Qualified, vetted tutors with transparent pricing, bookable without knowing anybody.</p>
                    </div>
                    <div class="footer-middle">
                        <ul>
                            <li><a href="./index.html" class="footer-link">Home</a></li>
                            <li><a href="./pricing.html" class="footer-link">Pricing</a></li>
                            <li><a href="./terms-of-use.html" class="footer-link">Terms of Use</a></li>
                            <li><a href="./privacy-policy.html" class="footer-link">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div class="footer-right">
                        <p>Phone - 08092812010</p>
                        <p>Email - <a href="mailto:support@brightmindstutors.com" class="footer-link">info@brightmind-tutors.com</a></p>
                        <p><a href="https://wa.me/2348092812010" class="footer-link">Chat Us on Whatsapp</a></p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p class="copyright">© 2026 BrightMinds Tutors</p>
                    <p class="attribution">Coded by <a href="https://github.com/DannyStark195" class="footer-link">Danny Stark</a>.</p>
                </div>
`