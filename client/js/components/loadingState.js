export function showLoading(){
    const loadingState = document.querySelector('.loading-state');
    loadingState.classList.remove('inactive');

    console.log(loadingState)
}
export function hideLoading(){
    const loadingState = document.querySelector('.loading-state');
    loadingState.classList.add('inactive')
}