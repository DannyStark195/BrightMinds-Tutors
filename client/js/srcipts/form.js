const overlay = document.querySelector('.dark-overlay');


overlay.innerHTML =  `
     <div class="form-container">
                    <div class="cross-btn cancel-form-popup">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                    <div class="signup-form form">
                        <div class="top">
                            <div class="logo">
                                <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                            </div>
                            <h2>Sign up</h2>
                            <form action="" class="signup-form">
                                <input type="email" name="" id="signup-email" placeholder="E-mail address" class="input-error">
                                <p class="error-msg">The email address you have entered is invalid.</p>
                                <input type="password" name="" id="signup-password" placeholder="Password" class="input-error">
                                <p class="error-msg">The password you have entered is invalid.</p>
                                <button type="submit" class="cta-btn gold">Sign Up</button>
                                <div>or</div>
                                <button class="oauth-btn">
                                    <div>
                                        <img src="./assets/icons/google.svg" alt="google icon">
                                        Sign up with Google
                                    </div>
                                </button>
                                <button class="oauth-btn">
                                    <div>
                                        <img src="./assets/icons/facebook.svg" alt="facebook icon">
                                        Sign up with Facebook
                                    </div>
                                </button>
                            </form>
                        </div>
                    
                        <div class="bottom">
                            <p>Already have an account?</p>
                            <p class="open-login">Log in</p>
                        </div>
                    </div>

                    <div class="login-form form">
                        <div class="top">
                            <div class="logo">
                                <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                            </div>
                            <h2>Log in</h2>
                            <form action="" class="login-form">
                                <input type="email" name="" id="login-email" placeholder="E-mail address" class="input-error">
                                <input type="password" name="" id="signup-password" placeholder="Password" class="input-error">
                                <a href="" class="forgot-password">Forgot password?</a>
                                <p class="error-msg">The email or password you have entered is incorrect.</p>
                                <button type="submit" class="cta-btn gold">Login</button>
                                <div>or</div>
                                <button class="oauth-btn">
                                    <div>
                                        <img src="./assets/icons/google.svg" alt="google icon">
                                        Log in with Google
                                    </div>
                                </button>
                                <button class="oauth-btn">
                                    <div>
                                        <img src="./assets/icons/facebook.svg" alt="facebook icon">
                                        Log in with Facebook
                                    </div>
                                    
                                </button>
                            </form>
                        </div>
                    
                        <div class="bottom">
                            <p>Don't have an account?</p>
                            <p class="open-signup">Sign up</p>
                        </div>
                    </div>
                
                </div>
`
const signupTriggers = document.querySelectorAll('.open-signup');
const loginTriggers = document.querySelectorAll('.open-login');
const cancelButtons = document.querySelectorAll('.cancel-form-popup');
const signupForm = overlay?.querySelector('.signup-form');
const loginForm = overlay?.querySelector('.login-form');

export function hideOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove('active');
}

export function showOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.add('active');
}

function hideAllPopupForms(overlay) {
    if (!overlay) return;
    const forms = overlay.querySelectorAll('.signup-form, .login-form');
    forms.forEach((form) => {
        form.classList.remove('active');
    });
}

export function openSignupForm(overlay, signupForm) {
    showOverlay(overlay);
    hideAllPopupForms(overlay);
    if (signupForm) {
        signupForm.classList.add('active');
    }
}

export function openLoginForm(overlay, loginForm) {
    showOverlay(overlay);
    hideAllPopupForms(overlay);
    if (loginForm) {
        loginForm.classList.add('active');
    }
}
export function closeFormPopup(overlay) {
    hideOverlay(overlay);
}

signupTriggers.forEach((button) => {
    button.addEventListener('click', () => openSignupForm(overlay, signupForm));
});

loginTriggers.forEach((button) => {
    button.addEventListener('click', () => openLoginForm(overlay, loginForm));
});

cancelButtons.forEach((button) => {
    button.addEventListener('click', () => closeFormPopup(overlay));
});

overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closeFormPopup(overlay);
    }
});

