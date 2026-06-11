from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import (User, Student, Course, TutorProfile, 
                   Booking, TutorApplication, tutor_courses)
from datetime import date

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # --- HASH PASSWORD ---
        password = generate_password_hash("test1234", method='pbkdf2:sha256')

        # --- USERS ---
        admin = User(
            username="admin",
            email="admin@brightminds.com",
            password_hash=password,
            role="admin",
            parent_name="BrightMinds Admin",
            phone="08092812010"
        )

        parent = User(
            username="test_parent",
            email="parent@test.com",
            password_hash=password,
            role="parent",
            profile_pic="default_avatar.png",
            bio="Mother of SS2 student",
            parent_name="Mrs. Blessing Okon",
            phone="+2348012345678"
        )

        tutor_user = User(
            username="Tutor John",
            email="john@test.com",
            password_hash=password,
            role="tutor",
            profile_pic="default_avatar.png"
        )

        db.session.add_all([admin, parent, tutor_user])
        db.session.commit()

        # --- STUDENT ---
        student = Student(
            parent_id=parent.id,
            name="Chidi Okon",
            age=15
        )
        db.session.add(student)

        # --- COURSES ---
        courses = [
            Course(course_name="Mathematics"),
            Course(course_name="English"),
            Course(course_name="Physics"),
            Course(course_name="Chemistry"),
            Course(course_name="Biology"),
            Course(course_name="Computer Science"),
        ]
        db.session.add_all(courses)
        db.session.commit()

        # --- TUTOR PROFILE ---
        tutor_profile = TutorProfile(
            user_id=tutor_user.id,
            bio="Experienced tutor with 4 years teaching SS students.",
            is_approved=True,
            profile_pic="default_avatar.png"
        )
        db.session.add(tutor_profile)
        db.session.commit()

        # Link tutor to Mathematics and Physics
        tutor_profile.courses.append(courses[0])  # Mathematics
        tutor_profile.courses.append(courses[2])  # Physics
        db.session.commit()

        # --- BOOKINGS ---
        booking_a = Booking(
            reference_code="BM-0001",
            parent_id=parent.id,
            student_id=student.id,
            course_id=courses[0].id,
            tutor_id=tutor_profile.id,
            grade_level="SS2",
            preferred_days="Monday,Wednesday,Friday",
            time_window="Afternoon",
            session_type="Physical",
            address="10 Admiralty Way, Lekki",
            monthly_price=30000.00,
            start_date=date(2026, 5, 1),
            end_date=date(2026, 5, 31),
            sessions_per_week=3,
            hours_per_session=2.0,
            status="completed",
            first_session_held=True,
            auto_renew=False
        )

        booking_b = Booking(
            reference_code="BM-0002",
            parent_id=parent.id,
            student_id=student.id,
            course_id=courses[0].id,
            tutor_id=tutor_profile.id,
            grade_level="SS2",
            preferred_days="Tuesday,Thursday",
            time_window="Evening",
            session_type="Online",
            monthly_price=22000.00,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 30),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="cancelled",
            first_session_held=True,
            auto_renew=False
        )

        booking_c = Booking(
            reference_code="BM-0003",
            parent_id=parent.id,
            student_id=student.id,
            course_id=courses[2].id,
            tutor_id=tutor_profile.id,
            grade_level="SS1",
            preferred_days="Friday",
            time_window="Morning",
            session_type="Online",
            monthly_price=22000.00,
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 31),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="cancelled",
            first_session_held=False,
            auto_renew=False
        )

        booking_d = Booking(
            reference_code="BM-0004",
            parent_id=parent.id,
            student_id=student.id,
            course_id=courses[1].id,
            tutor_id=None,
            grade_level="SS3",
            preferred_days="Monday,Wednesday",
            time_window="Morning",
            session_type="Physical",
            address="5 Adeola Odeku Street, VI",
            monthly_price=15000.00,
            start_date=date(2026, 6, 10),
            end_date=date(2026, 7, 10),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="pending",
            first_session_held=False,
            auto_renew=True
        )

        db.session.add_all([booking_a, booking_b, booking_c, booking_d])
        db.session.commit()

        print("✅ Database seeded successfully")
        print(f"   Admin:  admin@brightminds.com / test1234")
        print(f"   Parent: parent@test.com / test1234")
        print(f"   Tutor:  john@test.com / test1234")

if __name__ == '__main__':
    seed()