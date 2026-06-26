from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import User, Student, Course, TutorProfile, Booking, TutorApplication, Payment, Review
from datetime import date, datetime
import random
import string


def generate_reference(prefix):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{timestamp}-{random_chars}"


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        password = generate_password_hash("#IAmAwes@me1", method='pbkdf2:sha256')

        # --- USERS ---
        admin = User(
            username="admin",
            email="admin@brightminds.com",
            password_hash=password,
            role="admin",
            phone="0810183183"
        )

        parent1 = User(
            username="Mrs Blessing Okon",
            email="blessing@test.com",
            password_hash=password,
            role="parent",
            profile_pic="default_avatar.png",
            bio="Mother of two",
            phone="+2348012345678"
        )

        parent2 = User(
            username="Mr Tunde Akin",
            email="tunde@test.com",
            password_hash=password,
            role="parent",
            profile_pic="default_avatar.png",
            bio="Father of one",
            phone="+2348098765432"
        )

        tutor_user1 = User(
            username="Mr Emeka Obi",
            email="emeka@test.com",
            password_hash=password,
            role="tutor",
            profile_pic="default_avatar.png",
            bio="Experienced Mathematics and Physics tutor"
        )

        tutor_user2 = User(
            username="Miss Adaeze Nwosu",
            email="adaeze@test.com",
            password_hash=password,
            role="tutor",
            profile_pic="default_avatar.png",
            bio="Chemistry and Biology specialist"
        )

        db.session.add_all([admin, parent1, parent2, tutor_user1, tutor_user2])
        db.session.commit()

        # --- STUDENTS ---
        student1 = Student(
            parent_id=parent1.id,
            name="Chidi Okon",
            age=15,
            disabilities="None"
        )

        student2 = Student(
            parent_id=parent1.id,
            name="Amara Okon",
            age=13,
            disabilities="Mild dyslexia"
        )

        student3 = Student(
            parent_id=parent2.id,
            name="Tope Akin",
            age=16,
            disabilities=None
        )

        db.session.add_all([student1, student2, student3])
        db.session.commit()

        # --- COURSES ---
        mathematics = Course(course_name="Mathematics")
        english = Course(course_name="English")
        physics = Course(course_name="Physics")
        chemistry = Course(course_name="Chemistry")
        biology = Course(course_name="Biology")
        computer_science = Course(course_name="Computer Science")

        db.session.add_all([mathematics, english, physics, chemistry, biology, computer_science])
        db.session.commit()

        # --- TUTOR PROFILES ---
        tutor_profile1 = TutorProfile(
            user_id=tutor_user1.id,
            bio="5 years teaching SS Mathematics and Physics. WAEC and JAMB specialist.",
            profile_pic="default_avatar.png"
        )

        tutor_profile2 = TutorProfile(
            user_id=tutor_user2.id,
            bio="Chemistry and Biology tutor with 3 years experience in secondary education.",
            profile_pic="default_avatar.png"
        )

        db.session.add_all([tutor_profile1, tutor_profile2])
        db.session.commit()

        # Link tutors to courses via junction table
        tutor_profile1.courses.append(mathematics)
        tutor_profile1.courses.append(physics)
        tutor_profile2.courses.append(chemistry)
        tutor_profile2.courses.append(biology)
        db.session.commit()

        # --- TUTOR APPLICATIONS ---
        application1 = TutorApplication(
            user_id=tutor_user1.id,
            teaching_experience="5 years teaching SS Mathematics and Physics in Lagos secondary schools.",
            qualification="B.Sc Mathematics",
            experience_years=5,
            teaching_preference="Physical",
            level_taught="ss",
            subjects_taught="Mathematics, Physics",
            experience_proof_url="https://res.cloudinary.com/example/raw/upload/cv_emeka.pdf",
            status="approved"
        )

        application2 = TutorApplication(
            user_id=tutor_user2.id,
            teaching_experience="3 years teaching Chemistry and Biology.",
            qualification="B.Sc Chemistry",
            experience_years=3,
            teaching_preference="Physical and online",
            level_taught="ss",
            subjects_taught="Chemistry, Biology",
            experience_proof_url="https://res.cloudinary.com/example/raw/upload/cv_adaeze.pdf",
            status="approved"
        )

        application3 = TutorApplication(
            user_id=parent2.id,
            teaching_experience="2 years private tutoring experience.",
            qualification="B.Ed English",
            experience_years=2,
            teaching_preference="Online",
            level_taught="jss",
            subjects_taught="English",
            experience_proof_url="https://res.cloudinary.com/example/raw/upload/cv_tunde.pdf",
            status="pending"
        )

        db.session.add_all([application1, application2, application3])
        db.session.commit()

        # --- BOOKINGS ---

        # Booking A - completed, first session held, review eligible
        booking_a = Booking(
            reference_code="BM-0001",
            parent_id=parent1.id,
            student_id=student1.id,
            course_id=mathematics.id,
            tutor_id=tutor_profile1.id,
            assigned_at=datetime(2026, 5, 2),
            grade_level="SS2",
            preferred_days="Monday,Wednesday,Friday",
            time_window="4pm - 6pm",
            session_type="Physical",
            address="10 Admiralty Way, Lekki",
            notes="Student needs help with algebra and exam revision.",
            monthly_price=30000.00,
            start_date=date(2026, 5, 1),
            end_date=date(2026, 5, 31),
            sessions_per_week=3,
            hours_per_session=2.0,
            status="completed",
            first_session_held=True,
            auto_renew=False,
            next_billing_date=None
        )

        # Booking B - cancelled after first session, review eligible
        booking_b = Booking(
            reference_code="BM-0002",
            parent_id=parent1.id,
            student_id=student2.id,
            course_id=biology.id,
            tutor_id=tutor_profile2.id,
            assigned_at=datetime(2026, 6, 2),
            grade_level="JSS3",
            preferred_days="Tuesday,Thursday",
            time_window="3pm - 5pm",
            session_type="Online",
            notes=None,
            monthly_price=22000.00,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 30),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="cancelled",
            first_session_held=True,
            auto_renew=False,
            next_billing_date=None
        )

        # Booking C - cancelled before first session, review blocked
        booking_c = Booking(
            reference_code="BM-0003",
            parent_id=parent2.id,
            student_id=student3.id,
            course_id=physics.id,
            tutor_id=tutor_profile1.id,
            assigned_at=datetime(2026, 6, 5),
            grade_level="SS3",
            preferred_days="Friday",
            time_window="4pm - 6pm",
            session_type="Physical",
            address="5 Adeola Odeku Street, VI",
            notes=None,
            monthly_price=22000.00,
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 31),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="cancelled",
            first_session_held=False,
            auto_renew=False,
            next_billing_date=None
        )

        # Booking D - pending, no tutor assigned
        booking_d = Booking(
            reference_code="BM-0004",
            parent_id=parent2.id,
            student_id=student3.id,
            course_id=english.id,
            tutor_id=None,
            grade_level="SS2",
            preferred_days="Monday,Wednesday",
            time_window="3pm - 5pm",
            session_type="Physical",
            address="5 Adeola Odeku Street, VI",
            notes="Needs help with essay writing.",
            monthly_price=15000.00,
            start_date=date(2026, 6, 10),
            end_date=date(2026, 7, 10),
            sessions_per_week=2,
            hours_per_session=2.0,
            status="pending",
            first_session_held=False,
            auto_renew=True,
            next_billing_date=None
        )

        # Booking E - active, currently running
        booking_e = Booking(
            reference_code="BM-0005",
            parent_id=parent1.id,
            student_id=student1.id,
            course_id=chemistry.id,
            tutor_id=tutor_profile2.id,
            assigned_at=datetime(2026, 6, 10),
            grade_level="SS2",
            preferred_days="Saturday",
            time_window="9am - 11am",
            session_type="Physical",
            address="10 Admiralty Way, Lekki",
            notes=None,
            monthly_price=22000.00,
            start_date=date(2026, 6, 15),
            end_date=date(2026, 7, 15),
            sessions_per_week=1,
            hours_per_session=2.0,
            status="active",
            first_session_held=True,
            auto_renew=True,
            next_billing_date=date(2026, 7, 15)
        )

        # Booking F - approved, waiting for payment
        booking_f = Booking(
            reference_code="BM-0006",
            parent_id=parent2.id,
            student_id=student3.id,
            course_id=mathematics.id,
            tutor_id=tutor_profile1.id,
            assigned_at=datetime(2026, 6, 20),
            grade_level="SS3",
            preferred_days="Monday,Wednesday,Friday",
            time_window="4pm - 6pm",
            session_type="Online",
            notes="JAMB preparation.",
            monthly_price=30000.00,
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 31),
            sessions_per_week=3,
            hours_per_session=2.0,
            status="approved",
            first_session_held=False,
            auto_renew=True,
            next_billing_date=None
        )

        db.session.add_all([booking_a, booking_b, booking_c, booking_d, booking_e, booking_f])
        db.session.commit()

        # --- PAYMENTS ---
        payment1 = Payment(
            booking_id=booking_a.id,
            reference=generate_reference("CARD"),
            amount=30000.00,
            status="paid",
            payment_method="card",
            paid_at=datetime(2026, 5, 1)
        )

        payment2 = Payment(
            booking_id=booking_b.id,
            reference=generate_reference("BANK"),
            amount=22000.00,
            status="refunded",
            payment_method="bank_transfer",
            paid_at=datetime(2026, 6, 1)
        )

        payment3 = Payment(
            booking_id=booking_e.id,
            reference=generate_reference("CARD"),
            amount=22000.00,
            status="paid",
            payment_method="card",
            paid_at=datetime(2026, 6, 15)
        )

        db.session.add_all([payment1, payment2, payment3])
        db.session.commit()

        # --- REVIEWS ---
        review1 = Review(
            booking_id=booking_a.id,
            rating=5,
            feedback="Mr Emeka is an excellent tutor. Chidi's Mathematics improved significantly in just one month. Very patient and thorough.",
            created_at=datetime(2026, 6, 1)
        )

        review2 = Review(
            booking_id=booking_b.id,
            rating=4,
            feedback="Miss Adaeze was great with Amara. We had to cancel due to relocation but would highly recommend her.",
            created_at=datetime(2026, 6, 15)
        )

        db.session.add_all([review1, review2])
        db.session.commit()

        print("✅ Database seeded successfully")
        print(f"   Admin:   admin@brightminds.com / test1234")
        print(f"   Parent1: blessing@test.com / test1234")
        print(f"   Parent2: tunde@test.com / test1234")
        print(f"   Tutor1:  emeka@test.com / test1234")
        print(f"   Tutor2:  adaeze@test.com / test1234")
        print(f"\n   Bookings: BM-0001 to BM-0006")
        print(f"   Scenarios covered:")
        print(f"   BM-0001 → completed + first session held → review eligible ✅")
        print(f"   BM-0002 → cancelled + first session held → review eligible ✅")
        print(f"   BM-0003 → cancelled + no first session → review blocked ❌")
        print(f"   BM-0004 → pending, no tutor assigned")
        print(f"   BM-0005 → active, sessions running")
        print(f"   BM-0006 → approved, waiting for payment")


if __name__ == '__main__':
    seed()