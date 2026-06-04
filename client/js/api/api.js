import {isAuthenticated, loginRequired} from '../auth/auth.js';
const BASE_URL = "http://127.0.0.1:5000/api/"

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
export async function loginUser(user){
    try{
        const request = await fetch(`${BASE_URL}auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        const response = await request.json();
        console.log(response);
        if(!request.ok){
            throw new Error(response.error || 'Signup failed');
        }
        return response
    }
    catch(error){
        console.log(error.message)
       return null;
    }
}

export async function testAPI(){
    const request = await fetch(`${BASE_URL}`)
    const response = request.json()
    console.log(response);
}

async function Logout(){
    await localStorage.removeItem('brightminds_token');
    window.location.replace('index.html?auth=required');
}
export async function getUserProfile(){
    try{
        const token = localStorage.getItem('brightminds-user-token');
        const request = await fetch(`${BASE_URL}profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const response = await request.json();
        console.log(response);
        if(!request.ok){
        console.log(request.status)
            if (request.status === 401) {
                Logout(); // Clear data and boot them to login
            }
            throw new Error(response.msg || 'Failed to fetch user profile');
        }
        return response.user
    }
    catch(error){
        console.log(error.message)
       return null;
    }
}