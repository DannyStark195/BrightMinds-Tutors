import { collectData, validateEmail, validatePassword } from "../utils/formHelpers.js";
const overlay = document.querySelector('.dark-overlay');
overlay.innerHTML =  `
     <div class="form-container">
                    <div class="cross-btn cancel-form-popup">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                    <div class="signup-form-container form">
                        <div class="top">
                            <div class="logo">
                                <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                            </div>
                            <h2>Sign up</h2>
                            <form action="" class="signup-form">
                                <input type="email" name="email" id="signup-email" placeholder="E-mail address" class="input-error">
                                <div class="password-wrapper">
                                    <input type="password" id="signup-password" name="password" placeholder="Password" class="input-error"/>
                                    <span class="toggle-password" id="toggleSignupPassword">
                                        <i class="fa fa-eye-slash" id="signup-eye-icon"></i>
                                    </span>
                                </div>
                                <p class="error-msg inactive"></p>
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

                    <div class="login-form-container form">
                        <div class="top">
                            <div class="logo">
                                <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                            </div>
                            <h2>Log in</h2>
                            <form action="" class="login-form">
                                <input type="email" name="email" id="signup-email" placeholder="E-mail address" class="input-error">
                                <div class="password-wrapper">
                                    <input type="password" id="login-password" name="password" placeholder="Password" class="input-error"/>
                                    <span class="toggle-password" id="toggleLoginPassword">
                                        <i class="fa fa-eye-slash" id="login-eye-icon"></i>
                                    </span>
                                </div>
                                <a href="" class="forgot-password">Forgot password?</a>
                                <p class="error-msg inactive">The email or password you have entered is incorrect.</p>
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
const signupFormContainer = overlay?.querySelector('.signup-form-container');
const loginFormContainer = overlay?.querySelector('.login-form-container');
const loginForm = overlay?.querySelector('.login-form');
const signupForm = overlay?.querySelector('.signup-form');
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
        const forms = overlay.querySelectorAll('.signup-form-container, .login-form-container');
        forms.forEach((form) => {
            form.classList.remove('active');
        });
}

export function openForm(overlay, form) {
    showOverlay(overlay);
    hideAllPopupForms(overlay);
    if (form) {
        form.classList.add('active');
    }
}

export function closeFormPopup(overlay) {
    hideOverlay(overlay);
}

signupTriggers.forEach((button) => {
    button.addEventListener('click', () => openForm(overlay, signupFormContainer));
});

loginTriggers.forEach((button) => {
    button.addEventListener('click', () => openForm(overlay, loginFormContainer));
});

cancelButtons.forEach((button) => {
    button.addEventListener('click', () => closeFormPopup(overlay));
});

overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closeFormPopup(overlay);
    }
});

function setupPasswordToggle(toggleId, inputId, iconId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
}

setupPasswordToggle('toggleSignupPassword', 'signup-password', 'signup-eye-icon');
setupPasswordToggle('toggleLoginPassword', 'login-password', 'login-eye-icon');

loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    handleLogin();
});
function handleLogin(){
    const data = collectData(loginForm);
    // loginUser(data);
     const {email, password} = data;
    const {userEmail, userPassword} = {'userEmail':'dannystark195@gmail.com', 'userPassword':'password'};
    const errorMesssage = loginFormContainer.querySelector('.error-msg');
    // console.log(userEmail, userPassword);
    if(!((email == userEmail) && (password == userPassword))){
        errorMesssage.classList.remove('inactive');
        return 
    }
    const fakeToken = 'blah20919';
    localStorage.setItem("user-token", fakeToken);
    window.location.href = "dashboard";
}

signupForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    handleSignup()
});

function handleSignup(){
    const data = collectData(signupForm);
    const {email, password} = data;
    const errorMesssage = signupFormContainer.querySelector('.error-msg');
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
     if(emailError){
        errorMesssage.textContent = emailError;
        // activateElement(errorMesssage);
        errorMesssage.classList.remove('inactive')
        return
    }
    if(passwordError){
        errorMesssage.textContent = passwordError;
        // activateElement(errorMesssage);
        errorMesssage.classList.remove('inactive')
        return
    }
     //signupUser(data) called in api.js

     //If error in fetching return error message to be done when i start backend
     openForm(overlay, loginFormContainer);
}