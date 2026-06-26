import { editUserProfile, getUserProfile, uploadFile, changeProfileAvatar } from "../api/api.js";
import { collectData, setupPasswordToggle, validatePhone} from "../utils/formHelpers.js";
import { renderHeader } from "../components/dNavMenu.js";
import { showLoading, hideLoading } from "../components/loadingState.js";

// setupPasswordToggle('toggle-new-password', 'new-password', 'new-eye-icon');
const profileAvatarImg = document.querySelector('#profile-avatar-img');
const profileAvatar = document.querySelector('.profile-avatar');
const profileAvatarLoader = document.querySelector('.profile-avatar-loader');
const changeProfileAvatarBtn = document.querySelector('.change-profile-avatar-btn');
const profileAvatarInput = document.querySelector('.profile-avatar-input');
const profileName = document.querySelector('#profile-name');
const profileForm = document.querySelector('#profile-form');
const profileFields = document.querySelector('#profile-fields');
const cancelChangesBtn = document.querySelector('.cancel-changes-btn')
const passwordForm = document.querySelector('#password-form');
const infoAccountStatus = document.querySelector('#info-account-status');
const infoCurrentStatus = document.querySelector('#info-current-plan');
const deleteAccountBtn = document.querySelector('#delete-account-btn');

changeProfileAvatarBtn.addEventListener('click', () => {
    profileAvatarInput.click();
});
let currentAvatarImgMeta = "";

async function handleAvatarUpload(inputElement){
    console.log(currentAvatarImgMeta);
    const file = inputElement.files[0];
    if (!file) return;
    const msg = document.querySelector('.msg.error.avatar-upload-error');
    msg.textContent = "";
    msg.classList.add('inactive');
    profileAvatar.classList.add('is-uploading');
    profileAvatarLoader.classList.remove('inactive');
    changeProfileAvatarBtn.disabled = true;

    try{
        console.log(file);
        const selectedFileMeta = `${file.name}-${file.size}-${file.lastModified}`;
        console.log(selectedFileMeta)
        console.log('');
        console.log(currentAvatarImgMeta);
        
        if (selectedFileMeta === currentAvatarImgMeta) {
            return
        }
        const {valid, message, secure_url } = await uploadFile(file);
        
        if(!(valid && secure_url)){
            console.log(message)
            msg.textContent = message;
            // activateElement(msg);
            msg.classList.remove('inactive');
            return
        }
        const avatarResponse = await changeProfileAvatar(secure_url);
        if(!(avatarResponse.valid && avatarResponse.profile_pic_url)){
            console.log(avatarResponse.message);
            msg.textContent = avatarResponse.message;
            // activateElement(msg);
            msg.classList.remove('inactive');
            return
        }
        
        profileAvatarImg.src = avatarResponse.profile_pic_url
        currentAvatarImgMeta = selectedFileMeta;
        const username = profileName.textContent
        localStorage.setItem(`brightminds_currentAvatar_meta_${username}`, currentAvatarImgMeta)
    }catch(error){
        console.error(error);
        msg.textContent = "Avatar upload failed. Please try again.";
        msg.classList.remove('inactive');
    }finally{
        profileAvatar.classList.remove('is-uploading');
        profileAvatarLoader.classList.add('inactive');
        changeProfileAvatarBtn.disabled = false;
        inputElement.value = "";
    }
    await renderHeader();
}

profileAvatarInput.addEventListener('change', ()=>{
    handleAvatarUpload(profileAvatarInput);
});

async function renderUserprofile(){
    const userProfile = await getUserProfile();
    profileName.textContent = userProfile.username
    profileAvatarImg.src = userProfile.profile_pic
    console.log(userProfile.profile_pic);
    profileAvatarImg.alt = `${userProfile.username} profile picture` || "user's profile picture"
    profileFields.innerHTML = `
        <label class="profile-field">
            <span>Full name</span>
            <input type="text" class="form-control" value="${userProfile.username}" name="username" required>
        </label>
        <label class="profile-field">
            <span>Phone number</span>
            <input type="tel" class="form-control" value="${userProfile.phone || ''}" name="phone" required>
        </label>
         <label class="profile-field">
            <span>Bio</span>
            <input type="tel" class="form-control" value="${userProfile.bio || ''}" name="bio">
        </label>
    `
    currentAvatarImgMeta = localStorage.getItem(`brightminds_currentAvatar_meta_${userProfile.username}`)
    console.log(currentAvatarImgMeta);
}

async function initPage() {
    showLoading()
    try {  
        await renderHeader()
        renderUserprofile()
    } catch (error) {
        console.log('Failed to load page data', 'error');
        return
    } finally {
        hideLoading();
    }
}

initPage()


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
