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

    # parent_name = db.Column(db.String(150), nullable=True)  
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    children = db.relationship('Student', back_populates='parent', lazy=True, cascade="all, delete-orphan", foreign_keys='Student.parent_id')

    applications = db.relationship('TutorApplication', backref='applicant', lazy=True)

    def to_dict(self):
        children_data = []
        if self.children:
            children_data = [{
                "id": child.id,
                "name": child.name,
                "age": child.age
            } for child in self.children]
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'profile_pic': self.profile_pic,
            "bio": self.bio,
            "created_at": self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            "children": children_data
        }

class Review(db.Model):
    __tablename__ = 'tutor_reviews'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), unique=True, nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    feedback = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship('Booking', backref=db.backref('review', uselist=False))
    
    def to_dict(self):
        parent_user = self.booking.parent 
        
        tutor_name = "Not Assigned"
        if self.booking.tutor_profile and self.booking.tutor_profile.user:
            tutor_name = self.booking.tutor_profile.user.username

        return {
            'review_id': self.id,
            'booking_id': self.booking_id,
            'rating': self.rating,
            'feedback': self.feedback,
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
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    disabilities = db.Column(db.Text, nullable=True)

    parent = db.relationship('User', back_populates='children', foreign_keys=[parent_id])
    def to_dict(self):
        parent_data = None
        if(self.parent):
            parent_data = {
                'parent_id': self.parent_id,
                'parent_name': self.parent.username,
                'parent_email': self.parent.email,
                'parent_phone': self.parent.phone
            }
        return {
                'id': self.id,
                'name': self.name,
                'age': self.age,
                "disabilities": self.disabilities if self.disabilities else "None",
                "parent": parent_data
            }

# ==========================================
# 2. TUTOR & APPLICATION MODELS
# ==========================================

class TutorApplication(db.Model):
    __tablename__ = 'tutor_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    teaching_experience = db.Column(db.Text, nullable=False)
    qualification = db.Column(db.String(150), nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)
    teaching_preference = db.Column(db.String(50), nullable=False)  
    level_taught = db.Column(db.String(50), nullable=False)          
    subjects_taught = db.Column(db.Text, nullable=False)
    experience_proof_url = db.Column(db.String(255), nullable=True)              
    
    status = db.Column(db.String(20), default='pending')            
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'applicant_name': self.applicant.username,
            'applicant_email': self.applicant.email,
            'teaching_experience': self.teaching_experience,
            'qualification': self.qualification,
            'experience_years': self.experience_years,
            'teaching_preference': self.teaching_preference,
            'level_taught': self.level_taught,
            'subjects_taught': self.subjects_taught,
            'experience_proof_url': self.experience_proof_url,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.strftime('%Y-%m-%d') if self.created_at else None
        }


class TutorProfile(db.Model):
    __tablename__ = 'tutor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    profile_pic = db.Column(db.String(255), nullable=True, default='default_avatar.png')
    
    user = db.relationship('User', backref='tutor_profile', lazy=True)

    def to_dict(self):
        return {
            'tutor_id': self.id,
            'tutor_name': self.user.username if self.user else 'Unknown',
            'profile_pic': self.profile_pic,
            'bio': self.bio,
            'courses': [c.course_name for c in self.courses.all()],
        }

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
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutor_profiles.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)
    
    grade_level = db.Column(db.String(50), nullable=False)          
    preferred_days = db.Column(db.Text, nullable=False)             
    time_window = db.Column(db.String(50), nullable=False)          
    session_type = db.Column(db.String(50), nullable=False)         
    address = db.Column(db.Text, nullable=True)                     
    # notes = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
                          
    
    monthly_price = db.Column(db.Numeric(10, 2), nullable=False)
    meeting_link = db.Column(db.String(255), nullable=True)         
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    sessions_per_week = db.Column(db.Integer, nullable=False)
    hours_per_session = db.Column(db.Numeric(4, 2), nullable=False)
    
    status = db.Column(db.String(20), default='pending')            # pending, approved, rejected, active, completed, cancelled
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    first_session_held = db.Column(db.Boolean, default=False)
    auto_renew = db.Column(db.Boolean, default=True)
    next_billing_date = db.Column(db.Date, nullable=True)

    parent = db.relationship('User', foreign_keys=[parent_id], backref=db.backref('bookings', lazy=True))
    course = db.relationship('Course', backref=db.backref('bookings', lazy=True))
    tutor_profile = db.relationship('TutorProfile', foreign_keys=[tutor_id], backref=db.backref('assigned_bookings', lazy=True))
    student = db.relationship('Student', foreign_keys=[student_id], backref=db.backref('bookings', lazy=True))

    def to_dict(self):
        parent_data = {
            "id": self.id,
            "name": self.parent.username,
            "phone": self.parent.phone,
            "bio": self.parent.bio
        }
        student_data = None
        if self.student:
            student_data = {
                "id": self.student.id,
                "name": self.student.name,
                "age": self.student.age,
               
            }

        course_data = None
        if self.course:
            course_data = {
                "id": self.course.id,
                "course_name": self.course.course_name
            }

        tutor_data = None
        if self.tutor_profile:
            tutor_data = {
                "tutor_profile_id": self.tutor_profile.id,
                "tutor_name": self.tutor_profile.user.username if self.tutor_profile.user else "Account Closed",
                "profile_pic": self.tutor_profile.profile_pic or "assests/images/avatars/default_avatar.png"
            }

        return {
            "id": self.id,
            "reference_code": self.reference_code,
            "parent_id": self.parent_id,
            "status": self.status,
            "grade_level": self.grade_level,
            "preferred_days": self.preferred_days,
            "time_window": self.time_window,
            "session_type": self.session_type,
            "address": self.address,
            "meeting_link": self.meeting_link,
            # "notes": self.notes,
            "notes": self.notes,
            "rejection_reason": self.rejection_reason,
            "first_session_held": self.first_session_held,
            "auto_renew": self.auto_renew,
            
            "monthly_price": float(self.monthly_price) if self.monthly_price else 0.00,
            "sessions_per_week": self.sessions_per_week,
            "hours_per_session": self.hours_per_session,
            
            "start_date": self.start_date.strftime('%Y-%m-%d') if self.start_date else None,
            "end_date": self.end_date.strftime('%Y-%m-%d') if self.end_date else None,
            "next_billing_date": self.next_billing_date.strftime('%Y-%m-%d') if self.next_billing_date else None,
            "assigned_at": self.assigned_at.strftime('%Y-%m-%d') if self.assigned_at else None,
            "created_at": self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            "parent": parent_data,
            "student": student_data,
            "course": course_data,
            "tutor": tutor_data
        }

# ==========================================
# 4. PAYMENT & TRANSACTION MODEL
# ==========================================

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    reference = db.Column(db.String(100), unique=True, nullable=False) #transaction reference
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='pending')               # paid, refunded
    payment_method = db.Column(db.String(50), nullable=True)           # card, bank_transfer, ussd
    
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)
    # created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    booking = db.relationship('Booking', backref=db.backref('payments', lazy=True))

    def to_dict(self):
        return {
            'payment_id': self.id,
            'payment_ref': self.reference,
            'payment_status': self.status,
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'paid_at': self.paid_at.strftime('%Y-%m-%d %H:%M:%S'),
            # Booking details
            'booking_ref': self.booking.reference_code,
            'parent_name': self.booking.parent.username,
            'student_name': self.booking.student.name,
            'course': self.booking.course.course_name,
            'tutor': self.booking.tutor_profile.user.username if self.booking.tutor_id else 'Not assigned',
            'sessions_per_week': self.booking.sessions_per_week,
            'hours_per_session': float(self.booking.hours_per_session),
            'booking_status': self.booking.status
        }
