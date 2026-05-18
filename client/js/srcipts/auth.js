function isAuthentictaed(){
    const token = localStorage.getItem('user-token');
    // const token = true;
    return !!token;
}

export function loginRequired(){
    if(!isAuthentictaed()){
        window.location.replace('index?auth=required');
    }
}
export function redirectIfLoggedIn(){
    window.location.replace('dashboard.html');
}