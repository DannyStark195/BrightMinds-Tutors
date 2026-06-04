from app import db
from datetime import datetime

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
    
    # Critical Profile Additions from Signup/Profile Page
    parent_name = db.Column(db.String(150), nullable=True)  # Full name of parent
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    children = db.relationship('Student', backref='parent', lazy=True)
    bookings = db.relationship('Booking', backref='parent_booker', lazy=True)
    applications = db.relationship('TutorApplication', backref='applicant', lazy=True)

    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(6), nullable=True)
    code_expires_at = db.Column(db.DateTime, nullable=True)


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
    teaching_preference = db.Column(db.String(50), nullable=False)  # Physical / Online / Both
    cv_url = db.Column(db.String(255), nullable=False)              # Cloudinary Storage Link
    
    # Queue Management Statuses
    status = db.Column(db.String(20), default='pending')            # pending, approved, rejected
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class TutorProfile(db.Model):
    __tablename__ = 'tutor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    is_approved = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='tutor_profile', lazy=True)
    
    # Relationships
    bookings = db.relationship('Booking', backref='assigned_tutor', lazy=True)


# Junction table for Tutors teaching Multiple Courses
tutor_courses = db.Table('tutor_courses',
    db.Column('tutor_id', db.Integer, db.ForeignKey('tutor_profiles.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True)
)


class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), unique=True, nullable=False)
    
    # Many-to-Many Connection
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
    
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutor_profiles.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)
    
    # Step-by-Step Frontend Booking Form Additions
    grade_level = db.Column(db.String(50), nullable=False)          # Primary/JSS/SS/University
    preferred_days = db.Column(db.Text, nullable=False)             # Stored as comma-separated: "Monday,Wednesday"
    time_window = db.Column(db.String(50), nullable=False)          # Morning/Afternoon/Evening
    session_type = db.Column(db.String(50), nullable=False)         # Physical / Online
    address = db.Column(db.Text, nullable=True)                     # Only filled if session_type is Physical
    notes = db.Column(db.Text, nullable=True)                       # Extra messages from parent
    
    # Pricing & Fulfillment
    monthly_price = db.Column(db.Numeric(10, 2), nullable=False)
    meeting_link = db.Column(db.String(255), nullable=True)         # Admin updates this for online classes
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    sessions_per_week = db.Column(db.Integer, nullable=False)
    hours_per_session = db.Column(db.Numeric(4, 2), nullable=False)
    
    status = db.Column(db.String(20), default='pending')            # pending, approved, rejected, confirmed, completed
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)