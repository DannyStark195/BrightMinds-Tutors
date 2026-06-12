import {isAuthenticated, loginRequired} from '../auth/auth.js';
import {calculateFileHash} from '../utils/helpers.js'
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const request = await fetch(`${BASE_URL}upload-file`, {
            method: 'POST',
            headers: {
                // Keep Content-Type omitted so browser declares boundary markers automatically
                'Authorization': `Bearer ${token}`
            },
            body: data,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const response = await request.json();

        if (request.ok) {
            const secure_url = response.secure_url;
            return {valid: true, message:response.message, secure_url:secure_url}
        } else {
            throw new Error(response.error || 'Failed to upload file')
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return {valid: false, message:"Your connection is too slow. Try again later."}
        }
        return {valid: false, message:error.message}
    }
}

export async function changeProfileAvatar(secure_url) {
    const token = localStorage.getItem('brightminds-user-token');
    console.log(secure_url, typeof secure_url);
    
    try {
        const response = await fetch(`${BASE_URL}upload-avatar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({secure_url: secure_url})
        });

        const data = await response.json();

        if (response.ok) {
            const profile_pic_url = data.profile_pic_url;
            return {valid: true, message:response.message, profile_pic_url:profile_pic_url}
        } else {
            throw new Error(response.error || 'Failed to upload file')
        }
    } catch (error) {
        return {valid: false, message:error.message}
    }
}


export async function getBookingsForReview(){
    const token = localStorage.getItem('brightminds-user-token')
    try {
        const request = await fetch(`${BASE_URL}bookings/unreviewed`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
            if (request.status === 401) {
                Logout(); 
            }
                throw new Error(response.error || 'Failed to fetch reviews')
            }
        return response.bookings_for_review
    }
    catch (error) {
        console.log(error.message)
       return null;  
    }
}
export async function getReviewedBookings(){
    const token = localStorage.getItem('brightminds-user-token')
    try {
        const request = await fetch(`${BASE_URL}bookings/reviewed`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
            if (request.status === 401) {
                Logout(); 
            }
                throw new Error(response.error || 'Failed to fetch reviews')
            }
        return response.reviewed_bookings
    }
    catch (error) {
        console.log(error.message)
       return null;  
    }
}

export async function createReview(data){
    const token = localStorage.getItem('brightminds-user-token');
    try{
        const request = await fetch(`${BASE_URL}create-review`, {
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

export async function getFeaturedTestimonials() {

    try {
        const request = await fetch(`${BASE_URL}featured-testimonials`);
        const response = await request.json();

        if (!response.success || !response.testimonials || response.testimonials.length === 0) {
            return;
        }

        return response.testimonials
    } catch (error) {
        console.error("Failed executing homepage testimonials fetch:", error);
        return null
    }
}

export async function createBooking(data){
    const token = localStorage.getItem('brightminds-user-token');
    try{
        const request = await fetch(`${BASE_URL}create-booking`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })

        const response = await request.json();

        if(!request.ok){
            throw new Error(response.error || 'Failed to book tutor');
        }

        return {valid: true, message: response.message}
    }
    catch(error){
        return {valid: false, message:error.message}
    }
}

export async function getBookings() {
    const token = localStorage.getItem('brightminds-user-token')
    try {
        const request = await fetch(`${BASE_URL}bookings`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch bookings')
            }
        return response.bookings
    }
    catch (error) {
        console.log(error.message)
       return null;  
    }
}