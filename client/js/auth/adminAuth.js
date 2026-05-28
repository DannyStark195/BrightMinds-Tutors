import { adminLoginRequired, isAdminLoggedIn } from "../auth/auth.js";
import { collectData } from "../utils/formHelpers.js";
import { addInactive, removeInactive } from "../utils/helpers.js";

const adminLoginForm = document.querySelector('.admin-login-form');
const validAdmin = {
    'adminName': 'Daniel Stark',
    'adminPassword': 'admin123'
};

function handleAdminLogin(){
    const data = collectData(adminLoginForm);
    const errorMessage = adminLoginForm.querySelector('.error-msg');
    const adminName = data.adminName.trim();
    const adminPassword = data.adminPassword.trim();

    addInactive(errorMessage);

    if(adminName !== validAdmin.adminName || adminPassword !== validAdmin.adminPassword){
        removeInactive(errorMessage);
        return;
    }

    localStorage.setItem('admin-token', 'brightmind-admin-token');
    window.location.href = 'admin.html';
}

if(adminLoginForm){
    if(isAdminLoggedIn()){
        window.location.replace('admin.html');
    }

    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleAdminLogin();
    });
}
else{
    adminLoginRequired();
}
