import { getAdmin, getBookings, getParentsAndBookings, getStudents, getTutors, getTutorApplications } from "../api/adminAPI.js";
import { formatDate } from "../utils/helpers.js";

const navButtons = document.querySelectorAll('.admin-nav-link');
const pendingCount = document.querySelector('.pending-count');
const sections = document.querySelectorAll('.admin-section');
const filterGroups = document.querySelectorAll('[data-filter-group]');
const overlay = document.querySelector('.admin-overlay');
const panel = document.querySelector('.review-panel');
const panelContent = document.querySelector('[data-panel-content]');
const closePanelButtons = document.querySelectorAll('[data-close-panel]');
const bookingsTable = document.querySelector('[data-bookings-table]');
const applicationsTable = document.querySelector('[data-applications-table]');
const parentsTable = document.querySelector('[data-parents-table]');
const studentsTable = document.querySelector('[data-students-table]');
const adminSidebar = document.querySelector('.admin-sidebar');
const adminSidebarOverlay = document.querySelector('.admin-sidebar-overlay');
const adminNavMenuBtn = document.querySelector('.admin-nav-btn');
const closeAdminNavBtn = document.querySelector('.admin-close-nav-btn');
const adminName = document.querySelector('.admin-name');


const admin = await getAdmin()
console.log(admin)
adminName.textContent = admin.username


const tutorOptions = {
    Mathematics: ['Mr Emeka Obi', 'Mr Tunde Bakare', 'Chika Okoro'],
    Physics: ['Mr Emeka Obi', 'Chika Okoro'],
    Biology: ['Miss Adaeze Nwosu', 'Miss Ngozi Eze'],
    English: ['Mr Tunde Bakare', 'Miss Ngozi Eze', 'Femi Lawson'],
    Chemistry: ['Miss Adaeze Nwosu']
};

let bookings = await getBookings()
console.log(bookings)

const applications = await getTutorApplications()
console.log(applications)
// {
//     'APP-101': {
//         name: 'Chika Okoro',
//         subjects: 'Mathematics, Physics',
//         qualification: 'B.Sc Physics',
//         experience: '4 years',
//         date: '13 May 2026',
//         status: 'Pending',
//         bio: 'Patient secondary school tutor focused on exam preparation, weekly progress checks, and confidence building.'
//     },
//     'APP-092': {
//         name: 'Femi Lawson',
//         subjects: 'English',
//         qualification: 'B.Ed English',
//         experience: '6 years',
//         date: '8 May 2026',
//         status: 'Approved',
//         bio: 'English teacher with strong reading, grammar, and writing support experience.'
//     },
//     'APP-088': {
//         name: 'Rita George',
//         subjects: 'Chemistry',
//         qualification: 'OND Science Lab Tech',
//         experience: '1 year',
//         date: '6 May 2026',
//         status: 'Rejected',
//         bio: 'Lab assistant applying to support junior chemistry lessons.'
//     }
// };

let parentsAndBookings = await getParentsAndBookings()
console.log(parentsAndBookings)
let parents = parentsAndBookings.parents ? parentsAndBookings.parents : null;
console.log(parents);

let parentBookings = parentsAndBookings.bookings
let students = await getStudents();

let tutors = await getTutors()

console.log(tutors)

pendingCount.textContent = Object.values(bookings).filter(booking => booking.status === 'pending').length;

function setActiveSection(sectionName) {
    navButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.section === sectionName);
    });

    sections.forEach((section) => {
        section.classList.toggle('active', section.dataset.panel === sectionName);
    });

    closeAdminSidebar();
}

function openAdminSidebar() {
    adminSidebar?.classList.add('active');
    adminSidebarOverlay?.classList.add('active');
    closeAdminNavBtn?.classList.add('active');
    adminNavMenuBtn?.classList.remove('active');
    document.body.classList.add('admin-sidebar-open');
}

function closeAdminSidebar() {
    adminSidebar?.classList.remove('active');
    adminSidebarOverlay?.classList.remove('active');
    closeAdminNavBtn?.classList.remove('active');
    adminNavMenuBtn?.classList.add('active');
    document.body.classList.remove('admin-sidebar-open');
}

function handleAdminNavKeydown(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
    }
}

function filterRows(group, filter) {
    const tableRows = group.nextElementSibling.querySelectorAll('tbody tr[data-status]');

    tableRows.forEach((row) => {
        row.hidden = filter !== 'all' && row.dataset.status !== filter;
    });
}

function openPanel(content) {
    panelContent.innerHTML = content;
    overlay.classList.add('active');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
}

function closePanel() {
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
}

function createTutorOptions(subject) {
    const tutors = tutorOptions[subject] || [];

    return tutors.map((tutor) => `<option>${tutor}</option>`).join('');
}

function getStatusClass(status) {
    const statusClassMap = {
        Pending: 'pending',
        Approved: 'confirmed',
        Rejected: 'rejected',
        Completed: 'paid'
    };

    return statusClassMap[status] || 'pending';
}

function renderBookings() {
    if (!bookingsTable) {
        return;
    }

    bookingsTable.innerHTML = Object.values(bookings).map((booking, index) => `
        <tr data-status="${booking.status.toLowerCase()}">
            <td>${booking.reference_code}</td>
            <td>${booking.student.name}</td>
            <td>${booking.course.course_name}</td>
            <td>${booking.preferred_days}</td>
            <td>${booking.session_type}</td>
            <td>${formatDate(booking.start_date)}</td>
            <td><span class="status ${booking.status}">${booking.status}</span></td>
            <td><button class="table-action" type="button" data-review="booking" data-index="${index}">Review</button></td>
        </tr>
    `).join('');
}

function renderApplications() {
    if (!applicationsTable) {
        return;
    }

    applicationsTable.innerHTML = Object.values(applications).map((application) => `
        <tr data-status="${application.status}">
            <td>${application.applicant_name}</td>
            <td>${application.subjects_taught}</td>
            <td>${application.qualification}</td>
            <td>${application.experience_years}</td>
            <td>${formatDate(application.created_at)}</td>
            <td><span class="status ${application.status}">${application.status}</span></td>
            <td><button class="table-action" type="button" data-review="application" data-application="${application}">Review</button></td>
        </tr>
    `).join('');
}

function renderParents(){
    if(!parentsTable){
        return
    }

    parentsTable.innerHTML = Object.values(parents, parentBookings).map((parent, index) => `
        <tr class="parent-row" data-parent="${parent.username}">
            <td>${parent.username}</td>
            <td>${parent.email}</td>
            <td>${parent.phone}</td>

            <td>${parentBookings[parseInt(index)].length}</td>
            <td>${parent.children.length}</td>
            <td>${formatDate(parent.created_at)}</td>
            <td><button class="table-action" type="button" data-review="parent">History</button></td>
        </tr>
        <tr class="parent-history-row inactive">
            <td colspan="6">
                <div class="parent-history">
                    <strong>Booking history</strong>
                    ${Object.values(parentBookings[index]).map(booking => `
                        <p>${booking.reference_code} - ${booking.course.course_name} - ${booking.status}</p>

                        `
                    ).join('')}
                    
                </div>
            </td>
        </tr>
    `).join('');
}
function renderStudents(){
    if(!studentsTable){
        return
    }

    studentsTable.innerHTML = Object.values(students).map((student, index) => `
        <tr class="student-row" data-student="${student.name}">
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.disabilities}</td>
            <td>${student.parent.parent_name}</td>
            <td>${student.parent.parent_email}</td>
            <td>${student.parent.parent_phone}</td>
        </tr>
    `).join('');
}

function renderTutors(){
    const tutorGrid = document.querySelector('.tutor-grid');
    if(!tutorGrid){
        return
    }
    tutorGrid.innerHTML =  Object.values(tutors).map((tutor) => `
        <article class="admin-tutor-card surface-card">
            <div class="admin-tutor-card-profile-pic">
                <img src="${tutor.profile_pic || './assets/images/tutors/emeka.jpg'}" alt="${tutor.tutor_name}">
            </div>
            <div>
                <h2>${tutor.tutor_name}</h2>
                <p>Mathematics, Physics</p>
                <strong>18 sessions assigned</strong>
            </div>
        </article>
    `).join('')
}

function bookingPanelTemplate(booking) {
    return `
        <div class="panel-header">
            <p class="eyebrow">Booking review</p>
            <h2>${booking.reference_code}</h2>
        </div>
        <section class="panel-block">
            <h3>Full booking details</h3>
            <dl class="detail-list">
                <div><dt>Student</dt><dd>${booking.student.name}</dd></div>
                <div><dt>Parent</dt><dd>${booking.parent.name}</dd></div>
                <div><dt>Phone</dt><dd>${booking.parent.phone}</dd></div>
                <div><dt>Subject</dt><dd>${booking.course.course_name}</dd></div>
                <div><dt>Schedule</dt><dd>${booking.preferred_days}</dd></div>
                <div><dt>Location</dt><dd>${booking.session_type}</dd></div>
                <div><dt>Start Date</dt><dd>${formatDate(booking.start_date)}</dd></div>
                <div><dt>Status</dt><dd>${booking.status}</dd></div>
                <div><dt>Notes/Message</dt><dd>${booking.note}</dd></div>
            </dl>
        </section>
        <section class="panel-block">
            <h3>Assign tutor</h3>
            <label>
                Tutor filtered by subject
                <select class="form-control" data-assigned-tutor>
                    ${createTutorOptions(booking.course.course_name)}
                </select>
            </label>
        </section>
        <section class="panel-block">
            <h3>Admin decision</h3>
            <div class="panel-actions">
                <input type="text" class="form-control rejection-input inactive">
                <button class="cta-btn approve-btn" type="button" data-approve-booking>Approve</button>
                <button class="cta-btn reject-btn" type="button">Reject</button>
            </div>
        </section>
        <section class="panel-block forward-card" data-forward-card>
            <h3>WhatsApp forward card</h3>
            <p data-forward-copy>
                Booking ${booking.reference_code}: ${booking.course.course_name} for ${booking.student.name}. ${booking.preferred_days}. ${booking.session_type}. Parent contact: ${booking.phone}.
            </p>
            <a class="cta-btn gold" href="https://wa.me/?text=Booking%20${booking.reference_code}%20approved" target="_blank" rel="noopener noreferrer">
                Forward on WhatsApp
                <i class="fa-brands fa-whatsapp"></i>
            </a>
        </section>
    `;
}

function renderAdminDecison(){
    const rejectBtn = document.querySelector('.reject-btn');
    const approveBtn = document.querySelector('.approve-btn');
    const rejectionInput = document.querySelector('.rejection-input');

    rejectBtn.addEventListener('click', async ()=>{
        const rejectionReason = rejectionInput.textContent;

        if(!rejectionReason){
            
        }
    })
}
function applicationPanelTemplate(application) {
    return `
        <div class="panel-header">
            <p class="eyebrow">Tutor application</p>
            <h2>${application.name}</h2>
        </div>
        <section class="panel-block">
            <h3>Full application details</h3>
            <dl class="detail-list">
                <div><dt>Subjects</dt><dd>${application.subjects}</dd></div>
                <div><dt>Qualification</dt><dd>${application.qualification}</dd></div>
                <div><dt>Experience</dt><dd>${application.experience}</dd></div>
                <div><dt>Date applied</dt><dd>${application.date}</dd></div>
                <div><dt>Status</dt><dd>${application.status}</dd></div>
            </dl>
        </section>
        <section class="panel-block">
            <h3>Bio</h3>
            <p>${application.bio}</p>
        </section>
        <section class="panel-block">
            <h3>Documents</h3>
            <a href="#" class="cta-btn blue">Download CV</a>
        </section>
        <section class="panel-block">
            <h3>Decision</h3>
            <label>
                Optional rejection reason
                <textarea class="form-control reason-field" placeholder="Add a short reason for rejection"></textarea>
            </label>
            <div class="panel-actions">
                <button class="cta-btn approve-btn" type="button" data-approve-application data-name="${application.name}" data-subjects="${application.subjects}">Approve</button>
                <button class="cta-btn reject-btn" type="button">Reject</button>
            </div>
        </section>
    `;
}

navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setActiveSection(button.dataset.section);
    });
});

adminNavMenuBtn?.addEventListener('click', openAdminSidebar);
closeAdminNavBtn?.addEventListener('click', closeAdminSidebar);
adminSidebarOverlay?.addEventListener('click', closeAdminSidebar);

adminNavMenuBtn?.addEventListener('keydown', (event) => {
    handleAdminNavKeydown(event, openAdminSidebar);
});

closeAdminNavBtn?.addEventListener('keydown', (event) => {
    handleAdminNavKeydown(event, closeAdminSidebar);
});

filterGroups.forEach((group) => {
    const buttons = group.querySelectorAll('.filter-btn');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            filterRows(group, button.dataset.filter);
        });
    });
});

document.addEventListener('click', async (event) => {
    const reviewButton = event.target.closest('[data-review]');
    if (!reviewButton) {
        return;
    }
    
    const type = reviewButton.dataset.review;
    if (type === 'booking') {
        
        const index = reviewButton.dataset.index;

        bookings = await getBookings()

        console.log(bookings[index])
        openPanel(bookingPanelTemplate(bookings[index]));
    }

    if (type === 'application') {
        const application = reviewButton.dataset.application
        openPanel(applicationPanelTemplate(application));
    }

    if(type === 'parent'){
        const parentRow = reviewButton.closest('.parent-row');
        const historyRow = parentRow.nextElementSibling;
        console.log(historyRow)
        if (historyRow?.classList.contains('parent-history-row')) {
            historyRow.classList.toggle('inactive');
        }
    }
});


closePanelButtons.forEach((button) => {
    button.addEventListener('click', closePanel);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePanel();
        closeAdminSidebar();
    }
});

// panel.addEventListener('click', (event) => {
//     if (event.target.matches('[data-approve-booking]')) {
//         panel.querySelector('[data-forward-card]')?.classList.add('active');
//     }

//     if (event.target.matches('[data-approve-application]')) {
//         const tutorGrid = document.querySelector('.tutor-grid');
//         const tutorName = event.target.dataset.name;
//         const tutorSubjects = event.target.dataset.subjects;

//         if (tutorGrid && !tutorGrid.querySelector(`[data-added-tutor="${tutorName}"]`)) {
//             tutorGrid.insertAdjacentHTML('beforeend', `
//                 <article class="admin-tutor-card surface-card" data-added-tutor="${tutorName}">
//                     <img src="./assets/images/avatars/istockphoto-1254254792-612x612.jpg" alt="${tutorName}">
//                     <div>
//                         <h2>${tutorName}</h2>
//                         <p>${tutorSubjects}</p>
//                         <strong>0 sessions assigned</strong>
//                     </div>
//                 </article>
//             `);
//         }

//         event.target.textContent = 'Approved';
//         event.target.disabled = true;
//     }
// });

renderBookings();
renderApplications();
renderParents();
renderStudents();
renderTutors();
