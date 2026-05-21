import { collectData, validateEmail, validatePhone } from "../utils/formHelpers.js";
import { addInactive, removeInactive } from "../utils/helpers.js";
const tutorForm = document.querySelector('.tutor-form');
const certInput = document.querySelector('#certifications');
const certName = document.querySelector('#certifications-name');

if (certInput && certName) {
	certInput.addEventListener('change', (e) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			certName.textContent = file.name;
		} else {
			certName.textContent = 'No file chosen';
		}
	});
}

tutorForm.addEventListener('submit', (e) =>{
	e.preventDefault();
	const tutorData = collectData(tutorForm);
	const tutorEmail = tutorData.tutorEmail;
	const tutorPhone = tutorData.tutorPhone;
	console.log(tutorData, tutorPhone);
    const emailError = validateEmail(tutorEmail);
	const validPhone= validatePhone(tutorPhone);
	const errorMesssage = document.querySelectorAll('.error-msg');
	errorMesssage.forEach(errMsg => {
		addInactive(errMsg);
	});
	if(emailError){
		const errorMesssage = document.querySelector('.error-msg.email');
        errorMesssage.textContent = emailError;
        removeInactive(errorMesssage);
        return
    }
	if(!validPhone){
		const errorMesssage = document.querySelector('.error-msg.phone');
		console.log(errorMesssage)
		removeInactive(errorMesssage);
		errorMesssage.textContent = 'This phone number is invalid';
		return
	}
	// registerTutor(tutorData) to be implemented in the api.js
});


