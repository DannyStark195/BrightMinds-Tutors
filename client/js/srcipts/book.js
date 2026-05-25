import { activateElement, deactivateElement } from "../utils/helpers.js";
const bookingForm = document.querySelector('.booking-form');
const bookingProgress = document.querySelector('.booking-progress');
const backBtn = bookingForm.querySelector('.back-btn');
const continueBtn = bookingForm.querySelector('.continue-btn');
function updateStep(currentStep) {
    if(currentStep > 4){
        continueBtn.type = "submit";
    }
    if(currentStep < 1 || currentStep > 4) return;
    const steps = bookingForm.querySelectorAll('.booking-step');
    const progressSteps = bookingProgress.querySelectorAll('.progress-step');

    steps.forEach(step => {
        deactivateElement(step);

        if(step.classList.contains(`step-${currentStep}`)){
            activateElement(step);
        }
    });

    continueBtn.addEventListener('click', () => {
        updateStep(currentStep + 1);
    });
    backBtn.addEventListener('click', () => {
        updateStep(currentStep - 1);
    });
}

updateStep(1);

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = collectData(bookingForm);
    console.log(data);
});