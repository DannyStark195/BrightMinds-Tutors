import { getUserProfile } from "../api/api.js";
import { collectData, setupPasswordToggle, validatePhone} from "../utils/formHelpers.js";

// setupPasswordToggle('toggle-new-password', 'new-password', 'new-eye-icon');
const profileAvatarImg = document.querySelector('#profile-avatar-img');
const profileName = document.querySelector('#profile-name');
const profileForm = document.querySelector('#profile-form');
const profileFields = document.querySelector('#profile-fields');

const passwordForm = document.querySelector('#password-form');


const infoAccountStatus = document.querySelector('#info-account-status');
const infoCurrentStatus = document.querySelector('#info-current-plan');

const deleteAccountBtn = document.querySelector('#delete-account-btn');

profileForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const data = collectData(profileForm)
    console.log(data);
    
    const phoneError = validatePhone(data.profilePhone)
    const emailError = validateEmail(data.profileEmail)
})
async function renderUserprofile(){
    const userProfile = await getUserProfile();

profileFields.innerHTML = `
    <label class="profile-field">
        <span>Full name</span>
        <input type="text" class="form-control" value=${userProfile.username} name="profileName">
    </label>
    <label class="profile-field">
        <span>Phone number</span>
        <input type="tel" class="form-control" value="${userProfile.phone || ''}" name="profilePhone">
    </label>
    
`
}

renderUserprofile()