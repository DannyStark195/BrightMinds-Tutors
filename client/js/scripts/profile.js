import { setupPasswordToggle} from "../utils/formHelpers.js";

setupPasswordToggle('toggle-new-password', 'new-password', 'new-eye-icon');
const profileAvatarImg = document.querySelector('#profile-avatar-img');
const profileName = document.querySelector('#profile-name');
const profileForm = document.querySelector('#profile-form');
const profileFields = document.querySelector('#profile-fields');

const passwordForm = document.querySelector('#password-form');
profileFields.innerHTML = `
    <label class="profile-field">
        <span>Full name</span>
        <input type="text" class="form-control" value="Daniel Stark">
    </label>
    <label class="profile-field">
        <span>Email address</span>
        <input type="email" class="form-control" value="daniel@example.com">
     </label>
    <label class="profile-field">
        <span>Phone number</span>
        <input type="tel" class="form-control" value="08092812010">
    </label>
    
`
const infoAccountStatus = document.querySelector('#info-account-status');
const infoCurrentStatus = document.querySelector('#info-current-plan');

const deleteAccountBtn = document.querySelector('#delete-account-btn');
