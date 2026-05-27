import { activateElement, deactivateElement, removeInactive } from "../utils/helpers.js";
import { collectData } from "../utils/formHelpers.js"
const bookingForm = document.querySelector('.booking-form');
const bookingProgress = document.querySelector('.booking-progress');
const backBtn = bookingForm.querySelector('.back-btn');
const continueBtn = bookingForm.querySelector('.continue-btn');
let selectedSubject = null;
let selectedLevel = null;
let selectedTime = null;
let selectedHr = null;
let selectedDays = []
let selectedTimeWindow = null;  
let selectedLocation = null;
let selectedStartDate = null;

const timeWindowsByHr = {
            "2hrs": ['9.am - 11.am', '12.pm - 2.pm', '4.pm - 6.pm'],
            "4hrs": ['9.am - 12.pm', '12.pm - 3.pm', '3.pm - 6.pm']
}

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
    console.log('updatstep');
}

function validateStep(currentStep){
   if(currentStep === 1){
        return validateStep1()
   }
   if(currentStep === 2){
        return validateStep2()
   }
   if(currentStep === 3){
        return validateStep3()
   }
//    if(currentStep === 4){
//         return validateStep4()
//    }
}

function setBookingFlow(){
    console.log('booking-flow');
    
    const step1 = bookingForm.querySelector('.step-1');
    const bookSubjects = step1.querySelector('.book-subjects');
    const subjectOptions = bookSubjects.querySelectorAll('.sub');
    
    subjectOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            subjectOptions.forEach(option => deactivateElement(option));
            activateElement(option);

            const subjectBtn = option.querySelector('.subject-btn');
            console.log(subjectBtn);
            
                if(subjectBtn.checked){
                    selectedSubject = subjectBtn.value;
                }
                console.log(subjectBtn.checked)
        });
    });
   
    const gradeLevels = step1.querySelector('.levels');
    const gradeLevelOptions = gradeLevels.querySelectorAll('.level');
    gradeLevelOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            gradeLevelOptions.forEach(option => deactivateElement(option));
            activateElement(option);

            const gradeLevelBtn = option.querySelector('.grade-btn');
                if(gradeLevelBtn.checked){
                    selectedLevel = gradeLevelBtn.value;
                }
        });
    });

    const times = step1.querySelector('.times');
    const timeOptions = times.querySelectorAll('.time');
    timeOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            timeOptions.forEach(option => deactivateElement(option));
            activateElement(option);

            const timeBtn = option.querySelector('.times-btn');
                if(timeBtn.checked){
                    selectedTime = timeBtn.value;
                }
        });
    });
    

    const hrs = step1.querySelector('.hrs');
    const hrOptions = hrs.querySelectorAll('.hr');
    hrOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            hrOptions.forEach(option => deactivateElement(option));
            activateElement(option);
            const hrBtn = option.querySelector('.hrs-btn');
                if(hrBtn.checked){
                    selectedHr = hrBtn.value;
                }
        });
    });

    const step2 = bookingForm.querySelector('.step-2');
    const dayOptions = step2.querySelectorAll('.day');
    dayOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            option.classList.toggle('active');
            const dayValue = option.querySelector('.days-btn').value;
            if(selectedDays.includes(dayValue)){
                selectedDays = selectedDays.filter(day => day !== day);
            }else{
                selectedDays.push(dayValue);
            }
        });
    });

    const timeWindows = step2.querySelector('.time-windows');
    timeWindows.innerHTML =`
       <label class="option-card window">
            ${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][0]: timeWindowsByHr["4hrs"][0]}
            <input type="radio" name="timeWindow" value="${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][0]: timeWindowsByHr["4hrs"][0]}" class="hidden-radio window-btn">
        </label>
        <label class="option-card window">
            ${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][1]: timeWindowsByHr["4hrs"][1]}
            <input type="radio" name="timeWindow" value="${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][1]: timeWindowsByHr["4hrs"][1]}" class="hidden-radio window-btn">
        </label>
        <label class="option-card window active">
            ${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][2]: timeWindowsByHr["4hrs"][2]}
            <input type="radio" name="timeWindow" value="${selectedHr === '2hrs'? timeWindowsByHr["2hrs"][2]: timeWindowsByHr["4hrs"][2]}" class="hidden-radio window-btn">
        </label> 
    `
    const windowOptions = timeWindows.querySelectorAll('.window');
    windowOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            windowOptions.forEach(option => deactivateElement(option));
            activateElement(option);
            const windowBtn = option.querySelector('.window-btn');
            if(windowBtn.checked){
                selectedTimeWindow = windowBtn.value;
            }
        });
    });
    
    const startDate = step2.querySelector('.start-date');
    startDate.addEventListener('change', ()=>{
        selectedStartDate = startDate.value;
    });

    const step3 = bookingForm.querySelector('.step-3');
    const locationOptions = step3.querySelectorAll('.location');
    locationOptions.forEach(option =>{
        option.addEventListener('click', ()=>{
            locationOptions.forEach(option => deactivateElement(option));
            activateElement(option);
        });
    });
    const locationBtns = step3.querySelectorAll('.location-btn');
    locationBtns.forEach(locationBtn =>{
        if(locationBtn.checked){
            selectedLocation = locationBtn.value;
        }
    });
    if(selectedLocation === 'physical'){
        const physicalLocationInput = step3.querySelector('.address-field');
        removeInactive(physicalLocationInput);
        physicalLocationInput.addEventListener('input', ()=>{
            selectedLocation = physicalLocationInput.value;
        });
    }

    const step4 = bookingForm.querySelector('.step-4');
}

function validateStep1(){
    console.log(selectedSubject, selectedLevel, selectedTime, selectedHr);
    
    if(!selectedSubject || !selectedLevel || !selectedTime || !selectedHr){
        // alert('Please select a subject, grade level, time and hours per session to continue');
        return false;
    }
    return true;
}
function validateStep2(){
    console.log(selectedDays, selectedTimeWindow, selectedStartDate)
    if(selectedDays.length === 0 || !selectedTimeWindow || !selectedStartDate){
        return false;
    }
    return true;
}
function validateStep3(){
    if(!selectedLocation){
        return false;
    }
    return true;
}
function validateStep4(){
    return true;
}

setBookingFlow();
updateStepDisplay(1);
continueBtn.addEventListener('click', () => {
       const valid = validateStep(currentStep);
        if(!valid){
            return
        }
        currentStep+=1
        updateStepDisplay(currentStep);
    });

backBtn.addEventListener('click', () => {
        currentStep-=1
        updateStepDisplay(currentStep);
    });

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = collectData(bookingForm);
    console.log(data);
});