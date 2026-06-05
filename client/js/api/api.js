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
        console.log(response.reg_token);
        
        return {valid: true, registrationToken: response.reg_token}
    }
    catch(error){
        console.log(error.message)
       return {valid: false, message:error.message};
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
            throw new Error(response.error || 'Login failed');
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

export async function verifyOTPCode(data){
    const {email, code, registrationToken } = data
    
    console.log(data, registrationToken)
    try{
        const request = await fetch(`${BASE_URL}auth/verify-code` , {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, code: code, reg_token: registrationToken})
                });
        const response = await request.json();
        
        if(request.ok){
            return {'valid': true, 'message': response.message};
        }
        throw new Error(response.error || 'Verification failed.');
    }
    catch(error){
        return {'valid': false, 'message': error.message};
    }
}

export async function forgotPassword(data){
    const {email} = data

    try{
        const request = await fetch(`${BASE_URL}auth/forgot-password` , {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email})
                });
        const response = await request.json();

        if(request.ok){
            return {'valid': true, 'message': response.message, 'registrationToken': response.reg_token};
        }
        throw new Error(response.error || 'Password reset request failed.');
    }
    catch(error){
        return {'valid': false, 'message': error.message};
    }
}

export async function resetPassword(data){
    const {email, code, newPassword, registrationToken} = data
    
    console.log(data)
    try{
        const request = await fetch(`${BASE_URL}auth/reset-password` , {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, code: code, new_password: newPassword, reg_token: registrationToken})
                });
        const response = await request.json();
        
        if(request.ok){
            return {'valid': true, 'message': response.message};
        }
        throw new Error(response.error || 'Password reset failed.');
    }
    catch(error){
        return {'valid': false, 'message': error.message};
    }
}
