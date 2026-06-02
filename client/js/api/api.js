const BASE_URL = "http://127.0.0.1:5000/api/"
export function loginUser(data){
    const {email, password} = data;
    const {userEmail, userPassword} = {'userEmail':'dannystark195@gmail.com', 'userPassword':'password'};
    const errorMesssage = loginFormContainer.querySelector('.error-msg');
    // console.log(userEmail, userPassword);
    if(!((email == userEmail) && (password == userPassword))){
        // errorMesssage.classList.remove('inactive');
        return 
    }
    const fakeToken = 'blah20919';
    localStorage.setItem("user-token", fakeToken);
    window.location.href = "dashboard";
}

export async function signupUser(data){
    try{
            const request = await fetch(`${BASE_URL}auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const response = await request.json();
        console.log(response);
        if(!request.ok){
            throw new Error(response.error || 'Signup failed');
        }
        return null
    }
    catch(error){
        console.log(error.message)
       return error.message;  
    }
}
export function logoutUser(){
}

export async function testAPI(){
    const request = await fetch(`${BASE_URL}`)
    const response = request.json()
    console.log(response);
}
