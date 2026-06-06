import { editUserProfile, getUserProfile } from "../api/api.js";
import { collectData, setupPasswordToggle, validatePhone} from "../utils/formHelpers.js";

// setupPasswordToggle('toggle-new-password', 'new-password', 'new-eye-icon');
const profileAvatarImg = document.querySelector('#profile-avatar-img');
const profileName = document.querySelector('#profile-name');
const profileForm = document.querySelector('#profile-form');
const profileFields = document.querySelector('#profile-fields');
const cancelChangesBtn = document.querySelector('.cancel-changes-btn')
const passwordForm = document.querySelector('#password-form');


const infoAccountStatus = document.querySelector('#info-account-status');
const infoCurrentStatus = document.querySelector('#info-current-plan');

const deleteAccountBtn = document.querySelector('#delete-account-btn');


async function renderUserprofile(){
const userProfile = await getUserProfile();
profileName.textContent = userProfile.username
profileFields.innerHTML = `
    <label class="profile-field">

        <span>Full name</span>
        <input type="text" class="form-control" value="${userProfile.username}" name="username" required>
    </label>
    <label class="profile-field">
        <span>Phone number</span>
        <input type="tel" class="form-control" value="${userProfile.phone || ''}" name="phone" required>
    </label>
    
`
}

renderUserprofile()

profileForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    handleProfileEdit()
    })

async function handleProfileEdit() {
    const data = collectData(profileForm)
    console.log(data);
    const msg = profileForm.querySelector('.msg.error');
    const phoneError = validatePhone(data.phone)

    if(!phoneError){
        msg.textContent = "This phone number is invalid";
        msg.classList.remove('inactive')
        return
    }
    const {valid, message} = await editUserProfile(data);

    if(!valid) {
        msg.textContent = message
        msg.classList.remove('inactive');
        return 
    }

    renderUserprofile()
}


cancelChangesBtn.addEventListener('click', renderUserprofile)