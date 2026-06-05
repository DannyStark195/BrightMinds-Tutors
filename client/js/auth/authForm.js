import { collectData, validateEmail, validatePassword, setupPasswordToggle } from "../utils/formHelpers.js";
import { loginUser, signupUser, verifyOTPCode } from "../api/api.js";
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
                                <label for="age-confirmation" class="condition age-confirmation">
                                    <input type="checkbox" name="age-confirmation" id="age-confirmation" required>
                                    I agree to the <a href="./terms-of-use.html" target="_blank">Terms of Use</a>
                                </label>
                                <p class="msg error inactive"></p>
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
                                <p class="msg error inactive">The email or password you have entered is incorrect.</p>
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
                    <div class="verify-otp-form-container form">
                        <div class="top">
                            <div class="logo">
                                <img src="./assets/icons/tutor-logo.svg" alt="BrightMind logo">
                            </div>
                            <h2>Verify Code</h2>
                            <form action="" class="verify-otp-form">
                                <p>A verification code has been sent to your email. Please enter the code below to verify your account.</p>
                                <div class="password-wrapper">
                                    <input type="password" id="verify-password" name="code" placeholder="Code" class="input-error"/>
                                    <span class="toggle-password" id="toggleVerifyPassword">
                                        <i class="fa fa-eye-slash" id="verify-eye-icon"></i>
                                    </span>
                                </div>
                                <p class="msg error inactive"></p>
                                <button type="submit" class="cta-btn gold">Verify</button>
                                    
                            </form>
                        </div>
                    
                    </div>
                </div>
`
const signupTriggers = document.querySelectorAll('.open-signup');
const loginTriggers = document.querySelectorAll('.open-login');
const cancelButtons = document.querySelectorAll('.cancel-form-popup');
const signupFormContainer = overlay?.querySelector('.signup-form-container');
const loginFormContainer = overlay?.querySelector('.login-form-container');
const verifyOtpFormContainer = overlay?.querySelector('.verify-otp-form-container');
const loginForm = overlay?.querySelector('.login-form');
const signupForm = overlay?.querySelector('.signup-form');
const verifyOtpForm = overlay?.querySelector('.verify-otp-form');

const signupPassword = document.querySelector('#signup-password');

signupPassword.addEventListener('input', (e) =>{
    const password = e.target.value
    const msg = signupFormContainer.querySelector('.msg.error');
    msg.classList.add('inactive')
    const passwordError = validatePassword(password);
    if(passwordError){
        msg.textContent = passwordError;
        // activateElement(msg);
        msg.classList.remove('inactive')
    }
    
})
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
        const forms = overlay.querySelectorAll('.signup-form-container, .login-form-container', '.verify-otp-form-container');
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


setupPasswordToggle('toggleSignupPassword', 'signup-password', 'signup-eye-icon');
setupPasswordToggle('toggleLoginPassword', 'login-password', 'login-eye-icon');
setupPasswordToggle('toggleVerifyPassword', 'verify-password', 'verify-eye-icon');


loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    handleLogin();
});
async function handleLogin(){
const user = collectData(loginForm);
    const msg = loginFormContainer.querySelector('.msg.error');
    const loginValid = await loginUser(user)
    if(!loginValid){
        msg.classList.remove('inactive');
        return
    }
    const loggedInUser = loginValid
    console.log(loggedInUser)
    // const fakeToken = 'blah20919';
    const token = loggedInUser.token
    console.log(token);
    localStorage.setItem("brightminds-user-token", token);
    window.location.href = "dashboard";
}

signupForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    handleSignup()
});

let registrationToken = "";
async function handleSignup(){
    const data = collectData(signupForm);
    const {email, password} = data;
    const msg = signupFormContainer.querySelector('.msg.error');
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
     if(emailError){
        msg.textContent = emailError;
        // activateElement(msg);
        msg.classList.remove('inactive')
        return
    }
    if(passwordError){
        msg.textContent = passwordError;
        // activateElement(msg);
        msg.classList.remove('inactive')
        return
    }
    const valid = await signupUser(data);

    if(!valid.valid){
        console.log(valid.valid);
        
        msg.textContent = valid.message;
        // activateElement(msg);
        msg.classList.remove('inactive');
        return
    }   
     //If error in fetching return error message to be done when i start backend
    //  openForm(overlay, loginFormContainer);
    registrationToken = valid.registrationToken;
    openForm(overlay, verifyOtpFormContainer);
}

verifyOtpForm.addEventListener('submit', async(e) =>{
    e.preventDefault()
    handleOtpVerification();
});

async function handleOtpVerification(){
    const data = collectData(verifyOtpForm, {'registrationToken' :registrationToken});
    console.log(data);
    
    const msg = verifyOtpFormContainer.querySelector('.msg');
    msg.classList.remove('inactive');
    // msg.classList.add('success')
    const {valid, message} = await verifyOTPCode(data)

    console.log(valid);
    
    if(valid){
        msg.textContent = message
        msg.classList.remove('inactive');
        msg.classList.add('success')
        setTimeout(() => {
            openForm(overlay, loginFormContainer);
        }, 2000);
    }
    msg.innerHTML = message
    msg.classList.remove('inactive');
}
