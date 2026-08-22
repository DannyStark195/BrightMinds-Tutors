# BrightMinds Tutors
A full-stack tutoring platform for a Nigerian tutoring agency.

## Features
- Parent booking system with escrow-style approval flow
- Admin dashboard for managing bookings and tutor applications
- Simulated payment system with refund logic
- JWT authentication for parents and admins
- Cloudinary file uploads for profile pictures and tutor CVs
- PDF receipt generation and download
- Email notifications via Brevo
- Web notifications 
- Oauth with Google and Facebook

## Tech Stack
**Frontend:** ReactJs, Tailwind CSS v4  
**Backend:** Python Flask, SQLAlchemy  
**Database:** PostgreSQL (Supabase)  
**Storage:** Cloudinary  
**Deployment:** Vercel (frontend), Render (backend)

## Live Demo
- Frontend: https://brightminds-tutors.vercel.app/
- Backend API: https://brightminds-tutors.onrender.com/api/

## Setup (Local Development)
**Backend:**
1. Clone the repo
2. cd server
3. Create virtual environment
4. pip install -r requirements.txt
5. Create .env with DATABASE_URL, JWT_SECRET, CLOUDINARY credentials
6. python seed.py
7. python run.py

**Frontend:**
1. cd client
2. Update BASE_URL in js/api/api.js to your backend URL
3. Open with Live Server

## Author
- Daniel Okafor
- Github — https://github.com/DannyStark195
