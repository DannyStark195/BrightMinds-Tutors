import { collectData, validateEmail, validatePhone, validateFile } from "../utils/formHelpers.js";
import { activateElement, addInactive, deactivateElement, removeInactive } from "../utils/helpers.js";
import { createTutorApplication, uploadFile } from "../api/api.js";
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
			proofName.textContent = truncateText(file.name, 8);
		} else {
			proofName.textContent = 'No file chosen';
		}
	});
}

tutorForm.addEventListener('submit', (e) =>{
	e.preventDefault();
	handleTutorApplication();
});

async function handleTutorApplication() {
	let tutorData = collectData(tutorForm, {
		'subjectsTaught': selectedSubjects
	});

	const tutorProof = tutorData.proofExperience;
	console.log(tutorData);
	const fileError = validateFile(tutorProof);
	const submitBtn = tutorForm.querySelector('button');
	const errorMessages = document.querySelectorAll('.msg.error');
	errorMessages.forEach(errMsg => {
		addInactive(errMsg);
	});
	if(!selectedSubjects.length){
		const errorMesssage = document.querySelector('.msg.error.subject');
        errorMesssage.textContent = 'Select at least one subject';
        removeInactive(errorMesssage);
        return
    }
	if(fileError){
		const errorMesssage = document.querySelector('.msg.error.file');
		console.log(errorMesssage)
		removeInactive(errorMesssage);
		errorMesssage.textContent = fileError;
		return
	}

	submitBtn.textContent = "Loading..." 
	submitBtn.disabled = true
	let {valid, message, secure_url } = await uploadFile(tutorProof);
	
	if(!(valid && secure_url)){
		console.log(message, secure_url)
		const errorMesssage = document.querySelector('.msg.error.file');
		
		removeInactive(errorMesssage);
		errorMesssage.textContent = message
		return
	}
	tutorData = collectData(tutorForm, {
		selectedSubjects,
		secure_url
	});
	
	({valid, message} = await createTutorApplication(tutorData));
	submitBtn.disabled = false
	submitBtn.textContent = "Submit application"
	if(!valid){
		const errorMesssage = document.querySelector('.msg.error.file');
		removeInactive(errorMesssage);
		errorMesssage.textContent = message
		return
	}

	const successMessage = document.querySelector('.msg.file');
	removeInactive(successMessage);
	successMessage.classList.add('success');
	successMessage.textContent = message
	return
}
setupSubjectOptions();
