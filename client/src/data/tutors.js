/**
 * Static tutor + subject reference data — ported from the original client's
 * js/data/tutor.js, which declared these without exporting them.
 */

export const TUTORS = [
  {
    id: 1,
    name: 'Mr. Emeka Obi',
    subjects: ['Mathematics', 'Physics'],
    qualification: 'B.Sc Mathematics, University of Lagos',
    bio: '5 years teaching experience, specializes in helping students tackle exam anxiety.',
    image: '/assets/images/tutors/emeka.jpg',
    phone: '08031234567',
  },
  {
    id: 2,
    name: 'Miss Adaeze Nwosu',
    subjects: ['Chemistry', 'Biology'],
    qualification: 'B.Sc Biochemistry, University of Nigeria',
    bio: 'Passionate about making science practical and relatable for every student.',
    image: '/assets/images/tutors/adaeze.jpg',
    phone: '08057654321',
  },
  {
    id: 3,
    name: 'Mr. Tunde Bakare',
    subjects: ['Mathematics', 'English'],
    qualification: 'B.Ed Education, Obafemi Awolowo University',
    bio: 'Trained educator with a gift for breaking down complex problems simply.',
    image: '/assets/images/tutors/tunde.jpg',
    phone: '08169876543',
  },
  {
    id: 4,
    name: 'Miss Ngozi Eze',
    subjects: ['Biology', 'English'],
    qualification: 'B.Sc Biology, University of Benin',
    bio: 'Focuses on building strong foundations so students never have to cram.',
    image: '/assets/images/tutors/ngozi.jpg',
    phone: '08123456789',
  },
]

export const SUBJECTS = ['Mathematics', 'Chemistry', 'Physics', 'English', 'Biology']
