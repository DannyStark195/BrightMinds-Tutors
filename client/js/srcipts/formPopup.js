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
    const formContainers = overlay.querySelectorAll('.signup-container, .login-container');
    formContainers.forEach((form) => {
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