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

tutorForm.addEventListener

