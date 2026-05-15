const overlay = document.querySelector('.dark-overlay');
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