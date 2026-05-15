function isAuthentictaed(){
    const token = localStorage.getItem('admin-token');
    return !!token;
}
function loginRequired(){
    if(!isAuthentictaed()){
        window.location.replace('admin-login.html');
    }
}

loginRequired()