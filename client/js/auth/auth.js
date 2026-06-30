export function isAuthenticated(){
    const token = localStorage.getItem('brightminds-user-token');
    // const token = true;
    return !!token;
}

export function loginRequired(){
    if(!isAuthenticated()){
        window.location.replace('index?auth=required');
    }
}
export function redirectIfLoggedIn(){
    if(isAuthenticated()) window.location.replace('dashboard');
}

export function isAdminLoggedIn(){
    const token = localStorage.getItem('brightminds-admin-token');
    return !!token;
}
export function adminLoginRequired(){
    if(!isAdminLoggedIn()){
        window.location.replace('admin-login');
    }
}

export function logout(){
    localStorage.removeItem('brightminds-user-token');
    console.log('logout')
    window.location.replace('index')
    
}

export function logoutAdmin(){
    localStorage.removeItem('brightminds-admin-token');
    window.location.replace('admin-login')
}