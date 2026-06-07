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
            throw new Error(response.error || 'Failed to fetch user profile');
        }
        return response.user
    }
    catch(error){
        console.log(error.message)
       return null;
    }
}


export async function editUserProfile(data){
    const token = localStorage.getItem('brightminds-user-token');
    try{
        const request = await fetch(`${BASE_URL}edit-profile`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })

        const response = await request.json();

        if(!request.ok){
            throw new Error(response.error || 'Failed to edit user profile');
        }

        return {valid: true, message: response.message}
    }
    catch(error){
        return {valid: false, message:error.message}
    }
}

export async function uploadFile(file){
    const token = localStorage.getItem('brightminds-user-token');
    const data = new FormData();
    data.append('profile_pic', file);
    try {
        const response = await fetch('http://localhost:5000/upload-file', {
            method: 'POST',
            headers: {
                // Keep Content-Type omitted so browser declares boundary markers automatically
                'Authorization': `Bearer ${token}`
            },
            body: data
        });

        const data = await response.json();

        if (response.ok) {
            // 🎉 SUCCESS: Inject Cloudinary's dynamic URL string directly into DOM source attributes
            avatarDisplay.src = data.profile_pic_url;
            
            statusLabel.innerText = "✅ Profile picture updated!";
            statusLabel.style.color = "#28a745";
        } else {
            statusLabel.innerText = data.error || "Could not process image update.";
            statusLabel.style.color = "#dc3545";
        }
    } catch (networkError) {
        statusLabel.innerText = "❌ Network connection dropped.";
        statusLabel.style.color = "#dc3545";
    } finally {
        // Clean up interactive visual settings regardless of endpoint results
        editButton.style.pointerEvents = "auto";
        avatarDisplay.style.opacity = "1";
        
        // Clear the raw value wrapper so the user can select the same exact file again if they want
        inputElement.value = "";
    }
}