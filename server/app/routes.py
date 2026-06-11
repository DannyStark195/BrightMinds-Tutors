from flask import Blueprint, render_template, redirect, request, url_for, current_app, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models import User, Booking, Review
from app import db
from app.utils.uploader import upload_profile_image
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
            'parent_name': user.parent_name,
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
            # 🔐 Business Rule: Must be completed OR (cancelled AND first session actually happened)
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
        return jsonify({'success': False, 'error': 'Server error pulling eligible transactions.'}), 500

@routes.route('/bookings/reviewed', methods=['GET'])
@jwt_required()
def get_reviewed_bookings():
    """
    Returns all historical bookings for the logged-in parent 
    that have already received a completed user review.
    """
    current_user_id = get_jwt_identity()

    try:
        # Enforce integer type casting safely to protect comparisons
        authenticated_user_id = int(current_user_id)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'error': 'Invalid user identity token format.'}), 401

    try:
        reviewed_bookings = (
            Booking.query
            .filter(Booking.parent_id == authenticated_user_id)
            .join(Review, Review.booking_id == Booking.id) # Inner join filters out unreviewed items
            .order_by(Review.created_at.desc())
            .all()
        )

        payload = []
        for booking in reviewed_bookings:
            tutor_name = "Account Closed"
            tutor_profile_pic = "./assests/images/avatar/default_avatar.png" # Safe baseline default
            
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
        return jsonify({'success': False, 'error': 'Server error fetching reviewed transaction history.'}), 500

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
            .order_by(Review.created_at.desc())
            .limit(3)
            .all()
        )

        return jsonify({
            'success': True,
            'testimonials': [review.to_dict() for review in featured_reviews]
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Failed to retrieve testimonials.'}), 500