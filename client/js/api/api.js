export function loginUser(data){
    const {email, password} = data;
    const {userEmail, userPassword} = {'userEmail':'dannystark195@gmail.com', 'userPassword':'password'};
    // const errorMesssage = loginFormContainer.querySelector('.error-msg');
    // console.log(userEmail, userPassword);
    if(!((email == userEmail) && (password == userPassword))){
        // errorMesssage.classList.remove('inactive');
        return 
    }
    const fakeToken = 'blah20919';
    localStorage.setItem("user-token", fakeToken);
    window.location.href = "dashboard";
}

export function logoutUser(){
    localStorage.removeItem("user-token");
    window.location.href = "index.html";
}