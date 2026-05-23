export function activateElement(element){
    element.classList.add('active');
}

export function deactivateElement(element) {
    element.classList.remove('active');
}


export function formatCurrency(currency){
    const formattedCurrency = currency.toLocaleString('en-US', {});
    return formattedCurrency
}

export function removeInactive(element){
    element.classList.remove('inactive');
}
export function addInactive(element){
    element.classList.add('inactive');
}

export function getHourOfDay(){
    const hour = new Date().getHours();
    console.log(hour);

    if(hour > 0 && hour < 12){
        return "morning";
    }
    else if(hour > 12 && hour < 18){
        return "afternoon";
    }
    else{
        return "evening";
    }
}