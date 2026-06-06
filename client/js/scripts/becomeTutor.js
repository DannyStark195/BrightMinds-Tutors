import { collectData, validateEmail, validatePhone, validateFile } from "../utils/formHelpers.js";
import { activateElement, addInactive, deactivateElement, removeInactive } from "../utils/helpers.js";
const tutorForm = document.querySelector('.tutor-form');
const proofInput = document.querySelector('#proof-experience');
const proofName = document.querySelector('#proof-name');
let selectedSubjects = [];

function truncateText(text, length){
	if(text.length <= length){
		return text
	}
	const newText = text.substring(0, length) + '...'
	return newText
}

function syncSubjectOptions(){
	const subjectOptions = tutorForm.querySelectorAll('.tutor-subject-option');

	subjectOptions.forEach(option => {
		const input = option.querySelector('.tutor-subject-btn');
		const isSelected = selectedSubjects.includes(input.value);

		input.checked = isSelected;
		if(isSelected){
			activateElement(option);
		}
		else{
			deactivateElement(option);
		}
	});
}

function setupSubjectOptions(){
	const subjectInputs = tutorForm.querySelectorAll('.tutor-subject-btn');

	subjectInputs.forEach(input => {
		input.addEventListener('change', () => {
			selectedSubjects = [...subjectInputs]
				.filter(subjectInput => subjectInput.checked)
				.map(subjectInput => subjectInput.value);

			syncSubjectOptions();
		});
	});
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
	const tutorData = collectData(tutorForm, {
		selectedSubjects,
		tutorSubjects: selectedSubjects
	});
	const tutorEmail = tutorData.tutorEmail;
	const tutorPhone = tutorData.tutorPhone;
	const tutorProof = tutorData.proofExperience;
	console.log(tutorData);
    const emailError = validateEmail(tutorEmail);
	const validPhone= validatePhone(tutorPhone);
	const fileError = validateFile(tutorProof);

	const errorMesssage = document.querySelectorAll('.msg.error');
	errorMesssage.forEach(errMsg => {
		addInactive(errMsg);
	});
	if(!selectedSubjects.length){
		const errorMesssage = document.querySelector('.msg.error.subject');
        errorMesssage.textContent = 'Select at least one subject';
        removeInactive(errorMesssage);
        return
    }
	if(emailError){
		const errorMesssage = document.querySelector('.msg.error.email');
        errorMesssage.textContent = emailError;
        removeInactive(errorMesssage);
        return
    }
	if(!validPhone){
		const errorMesssage = document.querySelector('.msg.error.phone');
		console.log(errorMesssage)
		removeInactive(errorMesssage);
		errorMesssage.textContent = 'This phone number is invalid';
		return
	}
	if(fileError){
		const errorMesssage = document.querySelector('.msg.error.file');
		console.log(errorMesssage)
		removeInactive(errorMesssage);
		errorMesssage.textContent = fileError;
		return
	}
	console.log(tutorData);
	// registerTutor(tutorData) to be implemented in the api.js
});

setupSubjectOptions();
