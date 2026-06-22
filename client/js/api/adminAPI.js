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
        console.log(response);
        if(!request.ok){
        console.log(request.status)
            if (request.status === 401) {
                logoutAdmin(); // Clear data and boot them to login
            }
            throw new Error(response.error || 'Failed to fetch admin profile');
        }
        return response.admin
    }
    catch(error){
        console.log(error.message)
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
        console.log(error.message)
       return null;  
    }
}

export async function getParentsAndBookings() {
    const token = localStorage.getItem('brightminds-user-token')
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
                throw new Error(response.error || 'Failed to fetch bookings')
            }
        return response
    }
    catch (error) {
        console.log(error.message)
       return null;  
    }
}