import { activateElement, deactivateElement } from "../utils/helpers.js";
import { collectData } from "../utils/formHelpers.js"
const bookingForm = document.querySelector('.booking-form');
const bookingProgress = document.querySelector('.booking-progress');
const backBtn = bookingForm.querySelector('.back-btn');
const continueBtn = bookingForm.querySelector('.continue-btn');

let currentStep = 1;

function updateStepDisplay(currentStep) {
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

}

function validateStep(currentStep){
   if(currentStep === 1){
        validateStep1()
   }
   if(currentStep === 2){
        validateStep2()
   }
   if(currentStep === 3){
        validateStep3()
   }
   if(currentStep === 4){
        validateStep4()
   }


}

function validateStep1(){
    const step = bookingForm.querySelector('.step-1');
    
    const bookSubjects = step.querySelector('.book-subjects');

    const options = bookSubjects.querySelectorAll('.option-card');

    options.forEach(option =>{
        option.addEventListener('click', ()=>{
            options.forEach(option => deactivateElement(option));
            activateElement(option);
        });

    });
}
function validateStep2(){
    
}
function validateStep3(){
    
}

function validateStep4(){
    
}

 continueBtn.addEventListener('click', () => {
        validateStep(currentStep);
        currentStep+=1
        // updateStepDisplay(currentStep);
    });

backBtn.addEventListener('click', () => {
        currentStep-=1
        updateStepDisplay(currentStep);
    });

updateStepDisplay(1);

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = collectData(bookingForm);
    console.log(data);
});