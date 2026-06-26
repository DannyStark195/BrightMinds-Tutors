import { logoutAdmin } from "../auth/auth.js";

const BASE_URL = "http://127.0.0.1:5000/api/admin/"

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
        // console.log(response);
        if(!request.ok){
            throw new Error(response.error || 'Login failed');
        }
        return response
    }
    catch(error){
        // console.log(error.message)
       return null;
    }
}

export async function getAdmin(){
    try{
        const token = localStorage.getItem('brightminds-admin-token');
        const request = await fetch(`${BASE_URL}admin`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const response = await request.json();
        // console.log(response);
        if(!request.ok){
        // console.log(request.status)
            if (request.status === 401) {
                logoutAdmin(); // Clear data and boot them to login
            }
            throw new Error(response.error || 'Failed to fetch admin profile');
        }
        return response.admin
    }
    catch(error){
        // console.log(error.message)
       return null;
    }
}

export async function getBookings() {
    const token = localStorage.getItem('brightminds-admin-token')
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
        // console.log(error.message)
       return null;  
    }
}

export async function getParentsAndBookings() {
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}parents`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch parents and bookings')
            }
        return response
    }
    catch (error) {
        // console.log(error.message)
       return null;  
    }
}

export async function getStudents() {
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}students`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch students')
            }
        return response.students
    }
    catch (error) {
        // console.log(error.message)
       return null;  
    }
}

export async function getTutors() {
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}tutors`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch tutors')
            }
        return response.tutors
    }
    catch (error) {
        // console.log(error.message)
       return null;  
    }
}

export async function getTutorApplications() {
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}tutor-applications`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch tutor applications')
            }
        return response.applications
    }
    catch (error) {
        // console.log(error.message)
       return null;  
    }
}

export async function getTutorOptions(course) {
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}tutor-options/${course}`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const response = await request.json()
        if(!request.ok){
                throw new Error(response.error || 'Failed to fetch tutor ')
            }
        return response.options
    }
    catch (error) {
        // console.log(error.message)
       return null;  
    }
}

export async function bookingDecision(ref, action, data){
    const token = localStorage.getItem('brightminds-admin-token');
    // console.log(`${BASE_URL}${ref}/${action}`)
    try {
        const request = await fetch(`${BASE_URL}booking-decision/${ref}/${action}`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const response = await request.json()
       if(!request.ok){
            throw new Error(response.error || 'Failed to update admin decision');
        }

        return {valid: true, message: response.message}
    }
    catch(error){
        return {valid: false, message:error.message}
    }
}

export async function tutorApplicationDecision(applicationId, action, reason){
    const token = localStorage.getItem('brightminds-admin-token')
    try {
        const request = await fetch(`${BASE_URL}tutor-application-decision/${applicationId}/${action}`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reason)
        });

        const response = await request.json()
        if(!request.ok){
            throw new Error(response.error || 'Failed to update admin decision');
        }

        return {valid: true, message: response.message}
    }
    catch(error){
        return {valid: false, message:error.message}
    }
}