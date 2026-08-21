import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getFeaturedTestimonials } from '../api/api.js'
import { useAuthModal } from '../auth/AuthModalContext.jsx'
import PublicLayout from '../components/PublicLayout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * Landing page — ported from the original client's index.html plus
 * js/scripts/landing.js.
 *
 * Only the <main> lives here: PublicLayout renders the header, the footer and
 * the auth modal (the original's empty `.dark-overlay` div), exactly as
 * headerFooter.js used to inject them around this markup.
 *
 * Notes on the original's behaviour that is deliberately reproduced:
 *  - landing.js imported `redirectIfLoggedIn` but never called it, so a
 *    signed-in visitor stayed on the landing page. No redirect is added here.
 *  - `?oauth_error=` is handled by PublicLayout -> AuthModal now.
 */

/* The marquee is one group of eight subjects repeated three times; the
   translateX(-50%) animation depends on that duplication. */
const SUBJECTS = [
  { name: 'Mathematics', icon: 'fa-solid fa-square-root-variable' },
  { name: 'English', icon: 'fa-solid fa-language' },
  { name: 'Biology', icon: 'fa-solid fa-dna' },
  { name: 'Physics', icon: 'fa-solid fa-atom' },
  { name: 'Chemistry', icon: 'fa-solid fa-flask' },
  { name: 'Computer', icon: 'fa-solid fa-code' },
  { name: 'Economics', icon: 'fa-brands fa-bitcoin' },
  { name: 'Literature', icon: 'fa-solid fa-book-open-reader' },
]

const SUBJECT_GROUPS = [0, 1, 2]

const STATS = [
  { value: '4', label: 'Qualified Tutors' },
  { value: '5', label: 'Core Subjects' },
  { value: '100%', label: 'Vetted and Verified' },
  { value: 'Available', label: 'Physical and Online Sessions' },
]

const STEPS = [
  'Create an account and tell us what your child needs',
  'We match you with a qualified tutor within 2 hours',
  'Sessions begin on your preferred schedule',
]

/* The marketing copy here is the landing page's own — it does not match
   src/data/tutors.js (which lists Physics for Mr. Emeka and English for Miss
   Ngozi), so the original's hardcoded text is kept verbatim. */
const TUTORS = [
  {
    name: 'Mr. Emeka Obi',
    qualification: 'B.Sc Mathematics, University of Lagos',
    subjects: 'Mathematics',
    bio: '5 years teaching experience, specializes in helping students tackle exam anxiety.',
    image: '/assets/images/tutors/emeka.jpg',
  },
  {
    name: 'Miss Adaeze Nwosu',
    qualification: 'B.Sc Biochemistry, University of Nigeria',
    subjects: 'Chemistry, Biology',
    bio: 'Passionate about making science practical and relatable for every student.',
    image: '/assets/images/tutors/adaeze.jpg',
  },
  {
    name: 'Mr. Tunde Bakare',
    qualification: 'B.Ed Education, Obafemi Awolowo University',
    subjects: 'Mathematics, English',
    bio: 'Trained educator with a gift for breaking down complex problems simply.',
    image: '/assets/images/tutors/tunde.jpg',
  },
  {
    name: 'Miss Ngozi Eze',
    qualification: 'B.Sc Biology, University of Benin',
    subjects: 'Biology',
    bio: 'Focuses on building strong foundations so students never have to cram.',
    image: '/assets/images/tutors/ngozi.jpg',
  },
]

/* The three testimonials that were hardcoded in index.html. They use the same
   field names as the API payload so one render path serves both, and `feedback`
   omits the wrapping quotes because the markup adds them (as the original
   template string did). The third card showed four filled stars, hence
   rating: 4 — its `data-star="5.0"` was hardcoded on all three. */
const FALLBACK_TESTIMONIALS = [
  {
    parent_avatar: '/assets/images/avatars/istockphoto-1147385004-612x612.jpg',
    parent_name: 'Mrs.Folake Adeyemi',
    parent_bio: 'mother of SS2 student',
    feedback:
      "My son was struggling with Physics for two terms and I was really worried about his WAEC. After just six weeks with Mr. Emeka, his confidence completely changed. He's now the one explaining things to his classmates.",
    rating: 5,
  },
  {
    parent_avatar: '/assets/images/avatars/istockphoto-2242960454-612x612.webp',
    parent_name: 'Mr. Chukwuemeka',
    parent_bio: 'father of SS3 student',
    feedback:
      "Honestly I was skeptical at first because I've had bad experiences with lesson teachers who just collect money and don't show up consistently. BrightMind is different. Miss Adaeze has not missed a single session in two months and my daughter's Chemistry grade went from D to B.",
    rating: 5,
  },
  {
    parent_avatar: '/assets/images/avatars/istockphoto-2184307897-612x612.jpg',
    parent_name: 'Mrs. Ngozi Peterside',
    parent_bio: 'mother of JSS2 student',
    feedback:
      'I registered my JSS2 son for Mathematics and English after his midterm results came back very poor. The improvement has been remarkable. What I appreciate most is that they matched him with a tutor who actually understands how to talk to teenagers without making them feel stupid.',
    rating: 4,
  },
]

/* Original rotation: first card white, second gold, the rest dark blue. */
function backgroundFor(index) {
  return index === 0 ? 'white-bg' : index === 1 ? 'gold-bg' : 'dark-blue-bg'
}

/**
 * Filled stars up to `rating`, hollow ones for the remainder of five. The two
 * loops mirror the original's, so a fractional rating produces the same
 * (slightly odd) star count it always did.
 */
function starsFor(rating) {
  const stars = []
  for (let i = 0; i < rating; i++) {
    stars.push('fa-solid fa-star')
  }
  for (let i = 0; i < 5 - rating; i++) {
    stars.push('fa-regular fa-star')
  }
  return stars
}

export default function Landing() {
  useDocumentTitle('BrightMind Tutors')

  const [searchParams] = useSearchParams()
  const { openLogin } = useAuthModal()
  const [featured, setFeatured] = useState(null)

  const authRequired = searchParams.get('auth') === 'required'

  // `?auth=required` — set by the dashboard guard when it bounces a visitor.
  useEffect(() => {
    if (authRequired) {
      openLogin()
    }
  }, [authRequired, openLogin])

  // The API only replaces the hardcoded set when it returns a full row of
  // three, matching the original's early return.
  useEffect(() => {
    let current = true

    getFeaturedTestimonials().then((testimonials) => {
      if (!current) return
      if (!testimonials || testimonials.length === 0 || testimonials.length < 3) return
      setFeatured(testimonials)
    })

    return () => {
      current = false
    }
  }, [])

  const testimonials = featured || FALLBACK_TESTIMONIALS

  return (
    <PublicLayout className="landing-page">
      <main>
        <section className="hero">
          <div className="hero-left">
            <section className="hero-main">
              <h1>Expert Tutors, Delivered to Your Door.</h1>
              <p>
                Qualified, vetted tutors with transparent pricing, bookable without knowing
                anybody.
              </p>
            </section>
            <section className="cta">
              <Link to="/pricing" className="cta-btn blue">
                See pricing
              </Link>
              <Link to="/book" className="cta-btn gold">
                Book a tutor{' '}
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </section>
            <section className="trust-bar">
              <ul className="stats-list">
                {STATS.map((stat) => (
                  <li key={stat.label}>
                    <p className="stats">{stat.value}</p>
                    <p className="stats-desc">{stat.label}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <div className="hero-right">
            <div className="hero-img">
              <img src="/assets/images/istockphoto-1044468858-612x612.jpg" alt="" />
            </div>
          </div>
        </section>

        <div className="others white-bg">
          <section className="subjects-taught">
            <h2>Subjects We Cover</h2>
            <div className="subjects">
              {SUBJECT_GROUPS.map((group) => (
                <div className="group" key={group}>
                  {SUBJECTS.map((subject) => (
                    <div className="subject" key={subject.name}>
                      <i className={subject.icon}></i>
                      <p className="subject-name">{subject.name}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="how-it-works">
            <h2>How It Works</h2>

            <div className="steps">
              {STEPS.map((step, index) => (
                <div className="step-card" key={step}>
                  <div className="step-no">{index + 1}</div>
                  <div className="step">{step}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="tutors">
            <h2>Meet Our Tutors</h2>
            <div className="tutors-list">
              {TUTORS.map((tutor) => (
                <div className="tutor-card" key={tutor.name}>
                  <div className="tutor-card-top">
                    <div className="tutor-img-box">
                      <img src={tutor.image} alt="tutor profile picture" className="tutor-image" />
                      <div className="pic-mask"></div>
                    </div>
                    <div className="tutor-info">
                      <p className="tutor-name">{tutor.name}</p>
                      <p className="qualification">{tutor.qualification}</p>
                    </div>
                  </div>
                  <div className="tutor-card-bottom">
                    <p className="tutor-subjects">{tutor.subjects}</p>
                    <p className="tutor-bio">{tutor.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="testimonials">
            <div className="left">
              {/* Empty in the original too — `.stars` only contributes its
                  flex box above the heading. */}
              <div className="stars"></div>
              <h2>What Parents Are Saying</h2>
            </div>
            <ul className="testimonial-list">
              {testimonials.map((testimonial, index) => (
                <li key={index}>
                  <div className={`testimonial ${backgroundFor(index)}`}>
                    <div className="details">
                      <div className="avatar">
                        <img src={testimonial.parent_avatar} alt="testimonial avatar" />
                      </div>
                      <div className="infos">
                        <p className="name">{testimonial.parent_name}</p>
                        <p className="desc">{testimonial.parent_bio}</p>
                      </div>
                    </div>

                    <p className="comment">"{testimonial.feedback}"</p>
                    <div className="stars" data-star="5.0">
                      {starsFor(testimonial.rating).map((star, starIndex) => (
                        <i className={star} key={starIndex}></i>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="become-tutor">
            <div className="img-box">
              <img
                src="/assets/images/istockphoto-1444192255-612x612.jpg"
                alt="a teacher giving lesson"
              />
              <div className="overlay">
                <div className="content">
                  <p className="eyebrow">Become a tutor</p>
                  <h2>You can become a great tutor too!</h2>
                  <p>
                    Share your knowledge, live off your passion, and build a teaching business
                    that works for you.
                  </p>
                  <Link to="/become-tutor" className="cta-btn gold">
                    Find out more
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-banner">
            {/* The inline margin is load-bearing: `.others h2` (same
                specificity as the shared `.cta-banner h2`, but later in the
                cascade) sets margin-bottom: 40px. */}
            <h2 style={{ margin: 0 }}>Ready to Get Started?</h2>
            <Link to="/book" className="cta-btn gold">
              Book a Tutor Today{' '}
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </section>
        </div>
      </main>
    </PublicLayout>
  )
}
