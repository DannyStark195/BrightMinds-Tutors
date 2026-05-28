function isAuthentictaed(){
    const token = localStorage.getItem('user-token');
    // const token = true;
    return !!token;
}

export function loginRequired(){
    if(!isAuthentictaed()){
        window.location.replace('index.html?auth=required');
    }
}
export function redirectIfLoggedIn(){
    window.location.replace('dashboard.html');
}

export function isAdminLoggedIn(){
    const token = localStorage.getItem('admin-token');
    return !!token;
}
export function adminLoginRequired(){
    if(!isAdminLoggedIn()){
        window.location.replace('admin-login.html');
    }
}