from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify, send_file
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User, Booking, Review, Course, Student, Payment, TutorApplication, TutorProfile, PushSubscription
from app import db
# from app.utils.uploader import upload_profile_image
from app.utils.pricing_model import PRICING_MATRIX
from app.utils.push import send_push_notification
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from app.utils.email import send_booking_confirmation_email


admin_routes = Blueprint('admin_routes', __name__)

@admin_routes.route('/test')
def admin_test():
    return jsonify({'message': 'welcome admin'})

@admin_routes.route('/admin', methods=['GET'])
@jwt_required()
def get_admin():
    current_user_id = get_jwt_identity() # Securely extracted from token
    print(current_user_id)
    user = User.query.get(current_user_id) # Fresh database lookup
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400
    if user.role != 'admin':  # ← this check is critical
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'admin': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
    }), 200

@admin_routes.route('/bookings', methods=['GET'])
@jwt_required()
def get_all_bookings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    bookings = Booking.query.join(User, Booking.parent_id == User.id)\
                .filter(User.role == 'parent')\
                .all()
    return jsonify({'bookings':[b.to_dict() for b in bookings]})

@admin_routes.route('/parents', methods=['GET'])
@jwt_required()
def get_parents():
    try:
        parents = (
            User.query
            .filter(User.role == 'parent')
            .all()
        )
        print(parents)
        return jsonify(
            {
            'parents': [parent.to_dict() for parent in parents],
            'bookings': [[b.to_dict() for b in parent.bookings] for parent in parents],
            'students': [[s.to_dict() for s in parent.children] for parent in parents]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve parents.'}), 500

@admin_routes.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        students = Student.query.all()
    
        return jsonify({'students':[student.to_dict() for student in students]})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve students.'}), 500
    
@admin_routes.route('/tutors', methods=['GET'])
@jwt_required()
def get_tutors():
    try:
        tutors = (
            TutorProfile.query
            .all()
        )
        print(tutors)
        return jsonify(
            {
            'tutors': [tutor.to_dict() for tutor in tutors]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve parents.'}), 500

@admin_routes.route('/tutor-options/<string:course>', methods=['GET'])
@jwt_required()
def get_tutor_options(course):
    try:
        tutors = (
            TutorProfile.query
            .join(TutorProfile.courses)
            .filter(Course.course_name==course)
            .all()
        )
        print(tutors)
        return jsonify(
            {
            'options': [tutor.to_dict() for tutor in tutors]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve tutor options.'}), 500


@admin_routes.route('/tutor-applications', methods=['GET'])
@jwt_required()
def get_tutor_applications():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    applications = TutorApplication.query.order_by(TutorApplication.created_at.desc()).all()
    
    return jsonify({'applications': [application.to_dict() for application in applications]}), 200

@admin_routes.route('/booking-decision/<string:ref>/approve', methods=['POST'])
@jwt_required()
def approveBooking(ref):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    assigned_tutor = data.get('assignedTutor')
    print(data, assigned_tutor)

    if not assigned_tutor:
        return jsonify({'error': 'Please assign a tutor'}), 400

    try:
        booking = Booking.query.filter(Booking.reference_code == ref).first()

        if booking.session_type == 'online' and not booking.meeting_link:
            meeting_link = data.get('meetingLink')
            if not meeting_link:
                return jsonify({'error': 'Please put a meeting link for online session type'}), 400

            booking.meeting_link = meeting_link
        booking.status = 'approved'
        booking.tutor_id = assigned_tutor
        db.session.commit()

        #Send email notification
        print("About to send email...")
        send_booking_confirmation_email(
            booking.parent.email, booking.parent.username, 
            booking.tutor_profile.user.username,
            booking.course.course_name,
            f"{booking.preferred_days}, {booking.time_window}"
            )

        #Send web notification
        send_push_notification(
            user_id=booking.parent_id,
            title="Booking Confirmed ✅",
            body=f"Your booking has been approved. Log in to complete your payment."
        )

        
        return jsonify({'message': f'This booking has been approved!'}), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to change booking status.'}), 500
    
@admin_routes.route('/booking-decision/<string:ref>/reject', methods=['POST'])
@jwt_required()
def rejectBooking(ref):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    rejection_reason = request.get_json() or {}
    print(rejection_reason)

    if not rejection_reason:
        return jsonify({'error': 'Please provide a rejection reason'})
    try:
        booking = Booking.query.filter(Booking.reference_code == ref).first()

        booking.status = 'rejected'
        booking.rejection_reason = rejection_reason
        db.session.commit()
        return jsonify({'message': f'This booking has been rejeced!'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to change booking status.'}), 500
    
@admin_routes.route('/tutor-application-decision/<int:id>/approve', methods=['POST'])
@jwt_required()
def approveTutorApplication(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    try:
        tutorApplication = TutorApplication.query.filter(TutorApplication.id==id).first()

        if not tutorApplication:
            return jsonify({'error': 'This application id does not exist'}), 400
        tutorApplication.status = 'approved'

        if tutorApplication.rejection_reason:
            tutorApplication.rejection_reason = None

        db.session.commit()

        send_push_notification(
        user_id=tutorApplication.user_id,
        title="Application Approved 🎉",
        body="""Congratulations! Your tutor application has been approved.
                Check your email for more information!!"""
    )
        return jsonify({'message': f'This tutor application has been approved!'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to change application status.'}), 500


@admin_routes.route('/tutor-application-decision/<int:id>/reject', methods=['POST'])
@jwt_required()
def rejectTutorApplication(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    rejection_reason = request.get_json() or {}
    print(rejection_reason)

    if not rejection_reason:
        return jsonify({'error': 'Please provide a rejection reason'})
    try:
        tutorApplication = TutorApplication.query.filter(TutorApplication.id==id).first()

        if not tutorApplication:
            return jsonify({'error': 'This application id does not exist'}), 400
        tutorApplication.status = 'rejected'
        tutorApplication.rejection_reason = rejection_reason
        db.session.commit()

        send_push_notification(
        user_id=tutorApplication.user_id,
        title="Application Update",
        body="Your tutor application was unsuccessful. Please check your email for details."
    )
        return jsonify({'message': f'This tutor application has been rejected!'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to change application status.'}), 500
