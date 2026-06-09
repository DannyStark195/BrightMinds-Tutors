from app import db
from datetime import datetime, timezone

# ==========================================
# 1. USER & PROFILE MODELS
# ==========================================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='parent')  # 'parent', 'tutor', 'admin'
    profile_pic = db.Column(db.String(255), nullable=True, default='default_avatar.png')
    bio = db.Column(db.String(150), nullable=True)

    parent_name = db.Column(db.String(150), nullable=True)  
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    children = db.relationship('Student', backref='parent', lazy=True)
    applications = db.relationship('TutorApplication', backref='applicant', lazy=True)
    reviews = db.relationship('Review', backref='author', lazy=True, cascade="all, delete-orphan")


class Review(db.Model):
    __tablename__ = 'tutor_reviews'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), unique=True, nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship linking back to your system's Booking model
    booking = db.relationship('Booking', backref=db.backref('review', uselist=False))
    
    def to_dict(self):
        # ✅ Using 'parent' matches the relationship defined in the Booking model perfectly now
        parent_user = self.booking.parent 
        
        # Safely extractions through the Booking -> TutorProfile -> User relationship paths
        tutor_name = "Not Assigned"
        if self.booking.tutor_profile and self.booking.tutor_profile.user:
            tutor_name = self.booking.tutor_profile.user.username

        return {
            'review_id': self.id,
            'booking_id': self.booking_id,
            'rating': self.rating,
            'comment': self.comment,
            'date': self.created_at.strftime('%Y-%m-%d'),
            'parent_name': parent_user.username,
            'parent_avatar': parent_user.profile_pic,
            'parent_bio': parent_user.bio if parent_user.bio else "Parent",
            
            'tutor_name': tutor_name, 
            'course_name': self.booking.course.course_name 
        }

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    disabilities_or_notes = db.Column(db.Text, nullable=True)


# ==========================================
# 2. TUTOR & APPLICATION MODELS
# ==========================================

class TutorApplication(db.Model):
    __tablename__ = 'tutor_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    qualification = db.Column(db.String(150), nullable=False)
    institution = db.Column(db.String(150), nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)
    teaching_preference = db.Column(db.String(50), nullable=False)  
    cv_url = db.Column(db.String(255), nullable=False)              
    
    status = db.Column(db.String(20), default='pending')            
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class TutorProfile(db.Model):
    __tablename__ = 'tutor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    is_approved = db.Column(db.Boolean, default=False)
    profile_pic = db.Column(db.String(255), nullable=True, default='default_avatar.png')
    
    user = db.relationship('User', backref='tutor_profile', lazy=True)


# Junction table for Tutors teaching Multiple Courses
tutor_courses = db.Table('tutor_courses',
    db.Column('tutor_id', db.Integer, db.ForeignKey('tutor_profiles.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True)
)


class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), unique=True, nullable=False)
    
    tutors = db.relationship('TutorProfile', secondary=tutor_courses, backref=db.backref('courses', lazy='dynamic'), lazy='subquery')

# ==========================================
# 3. BOOKING ENGINE MODEL
# ==========================================

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    reference_code = db.Column(db.String(50), unique=True, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Points to tutor_profiles table as designed
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutor_profiles.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)
    
    grade_level = db.Column(db.String(50), nullable=False)          
    preferred_days = db.Column(db.Text, nullable=False)             
    time_window = db.Column(db.String(50), nullable=False)          
    session_type = db.Column(db.String(50), nullable=False)         
    address = db.Column(db.Text, nullable=True)                     
    notes = db.Column(db.Text, nullable=True)                       
    
    monthly_price = db.Column(db.Numeric(10, 2), nullable=False)
    meeting_link = db.Column(db.String(255), nullable=True)         
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    sessions_per_week = db.Column(db.Integer, nullable=False)
    hours_per_session = db.Column(db.Numeric(4, 2), nullable=False)
    
    status = db.Column(db.String(20), default='pending')            
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Clean relationships resolved with no backref conflicts
    parent = db.relationship('User', foreign_keys=[parent_id], backref=db.backref('bookings', lazy=True))
    course = db.relationship('Course', backref=db.backref('bookings', lazy=True))
    tutor_profile = db.relationship('TutorProfile', foreign_keys=[tutor_id], backref=db.backref('assigned_bookings', lazy=True))