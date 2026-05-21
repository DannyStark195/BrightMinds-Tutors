import { collectData, validateEmail, validatePhone, validateFile } from "../utils/formHelpers.js";
import { addInactive, removeInactive } from "../utils/helpers.js";
const tutorForm = document.querySelector('.tutor-form');
const proofInput = document.querySelector('#proof-experience');
const proofName = document.querySelector('#proof-name');

function truncateText(text, length){
	if(text<=length){
		return text
	}
	const newText = text.substring(0, length) + '...'
	return newText
}

if (proofInput && proofName) {
	proofInput.addEventListener('change', (e) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			proofName.textContent = truncateText(file.name, 20);
		} else {
			proofName.textContent = 'No file chosen';
		}
	});
}

tutorForm.addEventListener('submit', (e) =>{
	e.preventDefault();
	const tutorData = collectData(tutorForm);
	const tutorEmail = tutorData.tutorEmail;
	const tutorPhone = tutorData.tutorPhone;
	const tutorProof = tutorData.proofExperience;
	console.log(tutorData, tutorPhone, tutorProof);
    const emailError = validateEmail(tutorEmail);
	const validPhone= validatePhone(tutorPhone);
	const fileError = validateFile(tutorProof);

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
	if(fileError){
		const errorMesssage = document.querySelector('.error-msg.file');
		console.log(errorMesssage)
		removeInactive(errorMesssage);
		errorMesssage.textContent = fileError;
		return
	}
	// registerTutor(tutorData) to be implemented in the api.js
});


