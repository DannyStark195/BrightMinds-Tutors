export function formatCurrency(currency){
    const formattedCurrency = currency.toLocaleString('en-US', {});
    return formattedCurrency
}