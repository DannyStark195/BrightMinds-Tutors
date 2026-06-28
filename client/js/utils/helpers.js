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
    // console.log(hour);

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

export function calculateFileHash(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = function(e) {
            const arr = (new Uint8Array(e.target.result)).subarray(0, 5000); // Sample the first 5KB for speed
            let hash = "";
            for (let i = 0; i < arr.length; i++) {
                hash += arr[i].toString(16);
            }
            resolve(hash); // Returns a unique string string representing the file data
        };
        reader.readAsArrayBuffer(file);
    });
}

export function formatDate(date){
    const [year, month, day] = date.split('-');
    const dateObj = new Date(year, month - 1, day); 

    const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
    });

    return formattedDate
}

export function formatDateTime(date){
    const [year, month, day, hour, minute, second] = date.split(/[- :]/);
    const dateObj = new Date(year, month - 1, day, hour, minute, second); 

    const formattedDate = dateObj.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute:'2-digit',
            second: '2-digit'
    });

    return formattedDate
}

export function getQueryParamValue(key){
    const params = new URLSearchParams(window.location.search);
    const value = params.get(key)
    // console.log(value)
    if(value) return value
}

export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}