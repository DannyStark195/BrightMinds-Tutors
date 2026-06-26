import { adminLoginRequired, isAdminLoggedIn } from "../auth/auth.js";
import { collectData } from "../utils/formHelpers.js";
import { loginUser } from "../api/adminAPI.js";

const adminLoginForm = document.querySelector('.admin-login-form');

async function handleAdminLogin(){
    const data = collectData(adminLoginForm);
    const msg = adminLoginForm.querySelector('.msg.error');
    
    const loginValid = await loginUser(data)
        if(!loginValid){
            msg.classList.remove('inactive');
            return
        }

        const loggedInUser = loginValid
        // console.log(loggedInUser)
        const token = loggedInUser.token
        // console.log(token);
        localStorage.setItem("brightminds-admin-token", token);
        window.location.href = "admin";
}


adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAdminLogin();
    });

