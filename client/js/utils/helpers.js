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