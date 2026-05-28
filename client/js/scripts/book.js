import { activateElement, addInactive, deactivateElement, removeInactive } from "../utils/helpers.js";
import { collectData } from "../utils/formHelpers.js";

const bookingForm = document.querySelector('.booking-form');
const backBtn = bookingForm.querySelector('.back-btn');
const continueBtn = bookingForm.querySelector('.continue-btn');

let currentStep = 1;
let selectedSubject = null;
let selectedLevel = null;
let selectedTime = null;
let selectedHr = null;
let selectedDays = [];
let selectedTimeWindow = null;
let selectedLocation = null;
let selectedPhysicalAddress = '';
let selectedStartDate = null;

const timeWindowsByHr = {
    "2hrs": ['9.am - 11.am', '12.pm - 2.pm', '4.pm - 6.pm'],
    "4hrs": ['9.am - 1.pm', '11.pm - 3.pm', '2.pm - 6.pm']
};

function getTimesAWeek(){
    return Number.parseInt(selectedTime, 10);
}

function updateStepDisplay(){
    if(currentStep < 1){
        window.location.href = 'dashboard';
        return;
    }

    continueBtn.type = 'button';
    continueBtn.innerHTML = currentStep === 4
        ? 'Submit'
        : 'Continue <i class="fa-solid fa-arrow-right"></i>';

    const steps = bookingForm.querySelectorAll('.booking-step');
    steps.forEach(step => {
        deactivateElement(step);
        if(step.classList.contains(`step-${currentStep}`)){
            activateElement(step);
        }
    });

    updateBookingProgress();
}

function updateBookingProgress(){
    const bookingProgress = document.querySelector('.booking-progress');
    const progress = bookingProgress.querySelector('.progress');

    progress.classList.remove('w-0', 'w-25', 'w-50', 'w-75', 'w-100');
    progress.classList.add(`w-${(currentStep / 4) * 100}`);

    const bookingProgressSteps = bookingProgress.querySelectorAll('.step');
    bookingProgressSteps.forEach(step =>{
        deactivateElement(step);
        const stepNumber = Number(step.dataset.step);

        if(stepNumber <= currentStep){
            activateElement(step);
        }
    });

    if(currentStep === 2){
        updateStep2();
    }
}

function setupSingleChoice(containerSelector, optionSelector, inputSelector, onSelect){
    const container = bookingForm.querySelector(containerSelector);
    const options = container.querySelectorAll(optionSelector);

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(option => deactivateElement(option));
            activateElement(option);

            const input = option.querySelector(inputSelector);
            input.checked = true;
            onSelect(input.value);
        });
    });
}

function syncDayOptions(){
    const step2 = bookingForm.querySelector('.step-2');
    const dayOptions = step2.querySelectorAll('.day');

    dayOptions.forEach(option => {
        const dayBtn = option.querySelector('.days-btn');
        const isSelected = selectedDays.includes(dayBtn.value);

        dayBtn.checked = isSelected;
        option.classList.toggle('active', isSelected);
    });
}

function updateTimeWindows(){
    const step2 = bookingForm.querySelector('.step-2');
    const timeWindows = step2.querySelector('.time-windows');
    const windows = timeWindowsByHr[selectedHr] || [];

    if(!windows.includes(selectedTimeWindow)){
        selectedTimeWindow = null;
    }

    timeWindows.innerHTML = windows.map(window => `
        <label class="option-card window${selectedTimeWindow === window ? ' active' : ''}">
            ${window}
            <input
                type="radio"
                name="timeWindow"
                value="${window}"
                class="hidden-radio window-btn"
                ${selectedTimeWindow === window ? 'checked' : ''}
            >
        </label>
    `).join('');
}

function updateStep2(){
    const timesAWeek = getTimesAWeek();

    if(selectedDays.length > timesAWeek){
        selectedDays = selectedDays.slice(0, timesAWeek);
    }

    updateTimeWindows();
    syncDayOptions();

    const startDate = bookingForm.querySelector('.start-date');
    startDate.value = selectedStartDate || '';
}

function resetScheduleForTime(nextTime){
    if(!selectedTime || selectedTime === nextTime){
        return;
    }

    const timesAWeek = Number.parseInt(nextTime, 10);
    selectedDays = selectedDays.slice(0, timesAWeek);
    syncDayOptions();
}

function resetScheduleForHours(nextHr){
    if(selectedHr && selectedHr !== nextHr){
        selectedTimeWindow = null;
    }
}

function setupStep2(){
    const step2 = bookingForm.querySelector('.step-2');
    const dayOptions = step2.querySelectorAll('.day');

    dayOptions.forEach(option => {
        option.addEventListener('click', () => {
            const dayValue = option.querySelector('.days-btn').value;
            const isSelected = selectedDays.includes(dayValue);
            const timesAWeek = getTimesAWeek();

            if(isSelected){
                selectedDays = selectedDays.filter(day => day !== dayValue);
            }
            else if(selectedDays.length < timesAWeek){
                selectedDays.push(dayValue);
            }

            syncDayOptions();
        });
    });

    const timeWindows = step2.querySelector('.time-windows');
    timeWindows.addEventListener('click', event => {
        const option = event.target.closest('.window');
        if(!option || !timeWindows.contains(option)){
            return;
        }

        const windowOptions = timeWindows.querySelectorAll('.window');
        windowOptions.forEach(option => deactivateElement(option));
        activateElement(option);

        const windowBtn = option.querySelector('.window-btn');
        windowBtn.checked = true;
        selectedTimeWindow = windowBtn.value;
    });

    const startDate = step2.querySelector('.start-date');
    startDate.addEventListener('change', () => {
        selectedStartDate = startDate.value;
    });
}

function setupLocationStep(){
    const step3 = bookingForm.querySelector('.step-3');
    const locationOptions = step3.querySelectorAll('.location');
    const addressField = step3.querySelector('.address-field');
    const physicalLocationInput = addressField.querySelector('.physical-location-input');

    locationOptions.forEach(option => {
        option.addEventListener('click', () => {
            locationOptions.forEach(option => deactivateElement(option));
            activateElement(option);

            const locationBtn = option.querySelector('.location-btn');
            locationBtn.checked = true;
            selectedLocation = locationBtn.value;

            if(selectedLocation === 'physical'){
                removeInactive(addressField);
                selectedPhysicalAddress = physicalLocationInput.value.trim();
            }
            else{
                addInactive(addressField);
            }
        });
    });

    physicalLocationInput.addEventListener('input', () => {
        selectedPhysicalAddress = physicalLocationInput.value.trim();
    });
}

function setBookingFlow(){
    setupSingleChoice('.book-subjects', '.sub', '.subject-btn', value => {
        selectedSubject = value;
    });

    setupSingleChoice('.levels', '.level', '.grade-btn', value => {
        selectedLevel = value;
    });

    setupSingleChoice('.times', '.time', '.times-btn', value => {
        resetScheduleForTime(value);
        selectedTime = value;
    });

    setupSingleChoice('.hrs', '.hr', '.hrs-btn', value => {
        resetScheduleForHours(value);
        selectedHr = value;
    });

    setupStep2();
    setupLocationStep();
}

function validateStep(step){
    if(step === 1){
        return validateStep1();
    }
    if(step === 2){
        return validateStep2();
    }
    if(step === 3){
        return validateStep3();
    }
    if(step === 4){
        return validateStep4();
    }
    return false;
}

function validateStep1(){
    return Boolean(selectedSubject && selectedLevel && selectedTime && selectedHr);
}

function validateStep2(){
    const timesAWeek = getTimesAWeek();
    return selectedDays.length === timesAWeek && Boolean(selectedTimeWindow && selectedStartDate);
}

function validateStep3(){
    if(selectedLocation === 'physical'){
        return Boolean(selectedPhysicalAddress);
    }

    return selectedLocation === 'online';
}

function validateStep4(){
    const step4 = bookingForm.querySelector('.step-4');
    const details = step4.querySelectorAll('.detail');
    const termsCheckbox = step4.querySelector('.terms-checkbox');
    const allDetailsFilled = [...details].every(detail => detail.value.trim());

    return allDetailsFilled && termsCheckbox.checked;
}

setBookingFlow();
updateStepDisplay();

continueBtn.addEventListener('click', () => {
    if(!validateStep(currentStep)){
        return;
    }

    if(currentStep === 4){
        bookingForm.requestSubmit();
        return;
    }

    currentStep += 1;
    updateStepDisplay();
});

backBtn.addEventListener('click', () => {
    currentStep -= 1;
    updateStepDisplay();
});

bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    const data = collectData(bookingForm, {
        selectedDays,
        selectedLocation,
        selectedPhysicalAddress
    });

    console.log(data);
});
