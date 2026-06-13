from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User, Booking, Review, Course, Student
from app import db
from app.utils.uploader import upload_profile_image
from app.utils.pricing_model import PRICING_MATRIX
from app.utils.reference_generator import generate_reference_code
from datetime import datetime, timedelta
routes = Blueprint('routes',__name__)

@routes.route('/')
def index():
    return jsonify({"message": "Hello World!"})

@routes.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity() # Securely extracted from token
    print(current_user_id)
    user = User.query.get(current_user_id) # Fresh database lookup
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            # 'parent_name': user.parent_name,
            'phone': user.phone,
            'profile_pic': user.profile_pic
        }
    }), 200

@routes.route('/edit-profile', methods=['POST'])
@jwt_required()
def edit_profile():
    data = request.get_json() or {}
    print(data)
    new_username = data.get('username')
    new_phone = data.get('phone')
    print(new_phone)
    current_user_id = get_jwt_identity() 
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Your login session has expired. Please login again.'}), 400

    user.username = new_username
    user.phone = new_phone

    try:
        db.session.commit()
    
        return jsonify({'message': "User profile edited!"}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to edit profile! Please try again.'}), 400

@routes.route('/upload-file', methods=['POST'])
@jwt_required()
def upload_file():
    print('upload file')
    if 'profile_pic' not in request.files:
        return jsonify({'error': 'No file chunk detected in request'}), 400
    file = request.files['profile_pic']
    print(file)
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 1. Ship the image to the cloud using our helper
    secure_url = upload_profile_image(file)
    print(secure_url)
    if not secure_url:
        return jsonify({'error': 'Failed to upload image to cloud storage.'}), 500

    return jsonify({
        'message': 'Profile picture updated successfully!',
        'secure_url': secure_url
    }), 200

@routes.route('/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    print('upload avatar')

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    data = request.get_json()
    secure_url = data.get('secure_url')
    print(secure_url)
    if not secure_url:
        return jsonify({'error': 'Failed to upload image to cloud storage.'}), 500

    # 2. Update the user record in PostgreSQL with the new string URL
    user.profile_pic = secure_url
    db.session.commit()

    return jsonify({
        'message': 'Profile picture updated successfully!',
        'profile_pic_url': secure_url
    }), 200

@routes.route('/bookings/unreviewed', methods=['GET'])
@jwt_required()
def get_bookings_for_review():
    current_user_id = get_jwt_identity()

    try:
        eligible_bookings = (
            Booking.query
            .filter(Booking.parent_id == current_user_id)
            #Business Rule: Must be completed OR (cancelled AND first session actually happened)
            .filter(
                (Booking.status == 'completed') | 
                ((Booking.status == 'cancelled') & (Booking.first_session_held == True))
            )
            .outerjoin(Review, Review.booking_id == Booking.id)
            .filter(Review.id == None)  # Excludes anything already reviewed
            .order_by(Booking.created_at.desc())
            .all()
        )

        print('eligible bookings', eligible_bookings)
        payload = []
        for booking in eligible_bookings:
            tutor_name = "Not Assigned"
            if booking.tutor_profile and booking.tutor_profile.user:
                tutor_name = booking.tutor_profile.user.username

            payload.append({
                'booking_id': booking.id,
                'reference_code': booking.reference_code,
                'grade_level': booking.grade_level,
                'course_name': booking.course.course_name,
                'tutor_name': tutor_name,
                'status': booking.status
            })

        return jsonify({
            'success': True,
            'count': len(payload),
            'bookings_for_review': payload
        }), 200

    except Exception as e:
        return jsonify({'error': 'Server error pulling eligible transactions.'}), 500

@routes.route('/bookings/reviewed', methods=['GET'])
@jwt_required()
def get_reviewed_bookings():
    """
    Returns all historical bookings for the logged-in parent 
    that have already received a completed user review.
    """
    current_user_id = get_jwt_identity()

    try:
        authenticated_user_id = int(current_user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user identity token format.'}), 401

    try:
        reviewed_bookings = (
            Booking.query
            .filter(Booking.parent_id == authenticated_user_id)
            .join(Review, Review.booking_id == Booking.id)
            .order_by(Review.created_at.desc())
            .all()
        )

        payload = []
        for booking in reviewed_bookings:
            tutor_name = "Account Closed"
            tutor_profile_pic = "assets/images/avatars/default_avatar.png" 
            
            # Extract name and profile picture from the relationships safely
            if booking.tutor_profile:
                if booking.tutor_profile.profile_pic:
                    tutor_profile_pic = booking.tutor_profile.profile_pic
                
                if booking.tutor_profile.user:
                    tutor_name = booking.tutor_profile.user.username

            payload.append({
                'booking_id': booking.id,
                'reference_code': booking.reference_code,
                'course_name': booking.course.course_name,
                'grade_level': booking.grade_level,
                'tutor_name': tutor_name,
                'tutor_profile_pic': tutor_profile_pic, # Added attribute
                'booking_status': booking.status,
                'review': {
                    'review_id': booking.review.id,
                    'rating': booking.review.rating,
                    'feedback': booking.review.feedback,
                    'submitted_on': booking.review.created_at.strftime('%Y-%m-%d')
                }
            })

        return jsonify({
            'success': True,
            'count': len(payload),
            'reviewed_bookings': payload
        }), 200

    except Exception as e:
        return jsonify({'error': 'Server error fetching reviewed transaction history.'}), 500

@routes.route('/create-review', methods=['POST'])
@jwt_required()
def create_booking_review():
    """Allows parents to submit a 1-5 star review for a qualified booking transaction"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}

    booking_id = data.get('bookingId')
    rating = data.get('rating')
    feedback= data.get('feedback', '').strip()

    print(booking_id, rating, feedback)
    print(booking_id)
    if not booking_id or not rating or not feedback:
        return jsonify({'error': 'Missing required fields: booking_id, rating, or feedback.'}), 400

    try:
        rating_int = int(rating)
        if not (1 <= rating_int <= 5):
            return jsonify({'error': 'Rating must be an integer between 1 and 5.'}), 400
    except ValueError:
        return jsonify({'error': 'Rating must be a valid integer.'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking transaction record not found.'}), 404
        
    if booking.parent_id != int(current_user_id):
        print(booking.parent_id, current_user_id)
        return jsonify({'error': 'Unauthorized. You can only review your own bookings.'}), 403

    # Ensure booking is in a valid historical state
    if booking.status not in ['completed', 'cancelled'] or (booking.status == 'cancelled' and not booking.first_session_held):
        return jsonify({'error': 'This booking is not eligible for review.'}), 400

    # Prevent double submissions
    existing_review = Review.query.filter_by(booking_id=booking_id).first()
    if existing_review:
        return jsonify({'error': 'You have already submitted a review for this booking.'}), 400

    try:
        new_review = Review(
            booking_id=booking_id,
            rating=rating_int,
            feedback=feedback
        )
        db.session.add(new_review)
        db.session.commit()

        return jsonify({
            'message': 'Review submitted successfully!',
            'review': new_review.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error saving feedback.'}), 500

@routes.route('/featured-testimonials', methods=['GET'])
def get_featured_testimonials():
    try:
        featured_reviews = (
            Review.query
            .filter(Review.rating >= 4)
            .filter(db.func.length(Review.feedback) > 20)
            .order_by(Review.created_at)
            .limit(3)
            .all()
        )
        print(featured_reviews)
        return jsonify({
            'testimonials': [review.to_dict() for review in featured_reviews]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve testimonials.'}), 500

@routes.route('/create-booking', methods=['POST'])
@jwt_required()
def create_booking():
    current_user_id = get_jwt_identity()

    try:
        authenticated_user_id = int(current_user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user identity token format.'}), 401
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'This account does not exist'}), 400
    data = request.get_json() or {}

    subject_name = data.get('subject')
    grade_level = data.get('gradeLevel')
    times_per_week_str = data.get('times')
    hrs_per_session_str = data.get('hrs')
    time_window = data.get('timeWindow')
    start_date_str = data.get('startDate')
    lesson_location = data.get('lessonLocation')
    physical_address = data.get('selectedPhysicalAddress', '').strip()
    notes = data.get('message', '').strip()
    
    # Selected Days array extraction
    selected_days_list = data.get('selectedDays', [])
    preferred_days = ", ".join(selected_days_list)

    # Student Information Info
    student_name = data.get('studentName')
    student_age_str = data.get('studentAge')
    disabilities = data.get('disabilities', '').strip()
    disabilities_or_notes = notes + ', ' + disabilities
    
    required_fields = [subject_name, grade_level, times_per_week_str, hrs_per_session_str, 
                       time_window, start_date_str, lesson_location, student_name, student_age_str]
    
    if any(field is None or str(field).strip() == "" for field in required_fields):
        return jsonify({'error': 'Missing or empty required parameters.'}), 400

    if lesson_location.lower() == 'physical' and not physical_address:
        return jsonify({'error': 'Physical address required for off-screen tutoring.'}), 400

    # Ensure targeted course exists in school system catalog
    course = Course.query.filter_by(course_name=subject_name).first()
    if not course:
        return jsonify({'error': f'Subject "{subject_name}" is not offered right now.'}), 404

    try:
        sessions_per_week = int(times_per_week_str)
        hours_per_session = hrs_per_session_str.replace('hrs', '').strip()
        
        monthly_price = PRICING_MATRIX[sessions_per_week][hours_per_session]
    except KeyError:
        return jsonify({'error': 'Invalid sessions/hours configuration tier selection.'}), 400
    except ValueError:
        return jsonify({'error': 'Numeric formatting conversion errors on chosen parameters.'}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = start_date + timedelta(days=30) 
        next_billing_date = start_date + timedelta(days=30)
    except ValueError:
        return jsonify({'error': 'Invalid date format string structure. Use YYYY-MM-DD.'}), 400

    student = Student.query.filter_by(parent_id=authenticated_user_id, name=student_name).first()
    
    if not student:
        try:
            student = Student(
                parent_id=authenticated_user_id,
                name=student_name,
                age=int(student_age_str),
                disabilities_or_notes=disabilities_or_notes if disabilities_or_notes else None
            )
            db.session.add(student)
            db.session.flush() # Yields the student.id without committing transaction pipeline yet
        except Exception:
            print('Error generating student demographic entity.')
            return jsonify({'error': 'Error generating student demographic entity.'}), 500

    # Update Parent Profile phone metadata dynamically if missing
    parent_user = User.query.get(authenticated_user_id)
    if parent_user and not parent_user.phone:
        parent_user.phone = data.get('phone')
    # if parent_user and not 

    try:
        new_booking = Booking(
            reference_code=generate_reference_code(),
            parent_id=authenticated_user_id,
            student_id=student.id,
            course_id=course.id,
            
            tutor_id=None,
            assigned_at=None,
            meeting_link=None,
            rejection_reason=None,
            # next_billing_date=None,
            
            grade_level=grade_level,
            preferred_days=preferred_days,
            time_window=time_window,
            session_type=lesson_location,
            address=physical_address if lesson_location.lower() == 'physical' else None,
            # notes=notes,
            
            monthly_price=monthly_price,
            start_date=start_date,
            end_date=end_date,
            next_billing_date=next_billing_date,
            sessions_per_week=sessions_per_week,
            hours_per_session=hours_per_session,
            
            status='pending',
            first_session_held=False,
            auto_renew=True
        )

        db.session.add(new_booking)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '🎉 Tutoring booking request logged successfully!',
            'reference_code': new_booking.reference_code,
            'calculated_monthly_cost': float(new_booking.monthly_price),
            'status': new_booking.status
        }), 201

    except Exception as e:
        db.session.rollback()
        print(e, 'Critical server database transaction failure logging order.')
        return jsonify({'error': 'Critical server database transaction failure logging order.'}), 500


@routes.route('/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    current_user_id = get_jwt_identity()

    try:
        authenticated_user_id = int(current_user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user identity token format.'}), 401
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'This account does not exist'}), 400
    
    try:
        bookings = (
                        Booking.query
                        .filter(Booking.parent_id==authenticated_user_id)
                        .filter(Booking.status != 'cancelled')
                        .order_by(Booking.created_at.desc())
                        .all()
        )
        print(bookings)
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
    
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve bookings.'}), 500


@routes.route('/booking-details/<int:id>', methods=["GET"])
@jwt_required()
def get_booking_details(id):
    current_user_id = get_jwt_identity()

    try:
        authenticated_user_id = int(current_user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user identity token format.'}), 401
    
    user = User.query.get(authenticated_user_id)
    if not user:
        return jsonify({'error': 'This account does not exist'}), 400

    try:
        booking = (
                            Booking.query
                            .filter(Booking.id==id)
                            .first()
            )
        print(booking)
        return jsonify({
                'bookings': booking.to_dict()
            }), 200
    
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to retrieve booking details.'}), 500
