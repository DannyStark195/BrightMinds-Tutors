const navButtons = document.querySelectorAll('.admin-nav-link');
const sections = document.querySelectorAll('.admin-section');
const filterGroups = document.querySelectorAll('[data-filter-group]');
const studentRows = document.querySelectorAll('.student-row');
const overlay = document.querySelector('.admin-overlay');
const panel = document.querySelector('.review-panel');
const panelContent = document.querySelector('[data-panel-content]');
const closePanelButtons = document.querySelectorAll('[data-close-panel]');
const bookingsTable = document.querySelector('[data-bookings-table]');
const applicationsTable = document.querySelector('[data-applications-table]');
const adminSidebar = document.querySelector('.admin-sidebar');
const adminSidebarOverlay = document.querySelector('.admin-sidebar-overlay');
const adminNavMenuBtn = document.querySelector('.admin-nav-btn');
const closeAdminNavBtn = document.querySelector('.admin-close-nav-btn');

const tutorOptions = {
    Mathematics: ['Mr Emeka Obi', 'Mr Tunde Bakare', 'Chika Okoro'],
    Physics: ['Mr Emeka Obi', 'Chika Okoro'],
    Biology: ['Miss Adaeze Nwosu', 'Miss Ngozi Eze'],
    English: ['Mr Tunde Bakare', 'Miss Ngozi Eze', 'Femi Lawson'],
    Chemistry: ['Miss Adaeze Nwosu']
};

const bookings = {
    'BM-2847': {
        reference: 'BM-2847',
        student: 'Daniel Ebuka',
        parent: 'Mrs Ebuka',
        phone: '08092812010',
        subject: 'Mathematics',
        schedule: 'Mon, Wed, Fri - 4 PM',
        location: 'Physical - Lekki',
        date: '14 May 2026',
        status: 'Pending',
        notes: 'Student needs support with algebra and exam revision.'
    },
    'BM-2819': {
        reference: 'BM-2819',
        student: 'Kamsi Bello',
        parent: 'Mr Bello',
        phone: '08123456789',
        subject: 'Biology',
        schedule: 'Tue, Thu - 5 PM',
        location: 'Online',
        date: '12 May 2026',
        status: 'Approved',
        notes: 'WAEC biology preparation.'
    },
    'BM-2790': {
        reference: 'BM-2790',
        student: 'Amara Cole',
        parent: 'Mrs Cole',
        phone: '07045671234',
        subject: 'English',
        schedule: 'Sat - 10 AM',
        location: 'Physical - Surulere',
        date: '10 May 2026',
        status: 'Pending',
        notes: 'Essay writing and comprehension practice.'
    },
    'BM-2734': {
        reference: 'BM-2734',
        student: 'Tope Akin',
        parent: 'Mr Akin',
        phone: '08055550111',
        subject: 'Physics',
        schedule: 'Fri - 3 PM',
        location: 'Physical - Yaba',
        date: '8 May 2026',
        status: 'Rejected',
        notes: 'Rejected because requested time was unavailable.'
    },
    'BM-2688': {
        reference: 'BM-2688',
        student: 'Nora James',
        parent: 'Mrs James',
        phone: '08100023456',
        subject: 'Chemistry',
        schedule: 'Mon, Thu - 6 PM',
        location: 'Online',
        date: '2 May 2026',
        status: 'Completed',
        notes: 'Completed first month of lessons.'
    }
};

const applications = {
    'APP-101': {
        name: 'Chika Okoro',
        subjects: 'Mathematics, Physics',
        qualification: 'B.Sc Physics',
        experience: '4 years',
        date: '13 May 2026',
        status: 'Pending',
        bio: 'Patient secondary school tutor focused on exam preparation, weekly progress checks, and confidence building.'
    },
    'APP-092': {
        name: 'Femi Lawson',
        subjects: 'English',
        qualification: 'B.Ed English',
        experience: '6 years',
        date: '8 May 2026',
        status: 'Approved',
        bio: 'English teacher with strong reading, grammar, and writing support experience.'
    },
    'APP-088': {
        name: 'Rita George',
        subjects: 'Chemistry',
        qualification: 'OND Science Lab Tech',
        experience: '1 year',
        date: '6 May 2026',
        status: 'Rejected',
        bio: 'Lab assistant applying to support junior chemistry lessons.'
    }
};

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

    bookingsTable.innerHTML = Object.values(bookings).map((booking) => `
        <tr data-status="${booking.status.toLowerCase()}">
            <td>${booking.reference}</td>
            <td>${booking.student}</td>
            <td>${booking.subject}</td>
            <td>${booking.schedule}</td>
            <td>${booking.location}</td>
            <td>${booking.date}</td>
            <td><span class="status ${getStatusClass(booking.status)}">${booking.status}</span></td>
            <td><button class="table-action" type="button" data-review="booking" data-ref="${booking.reference}">Review</button></td>
        </tr>
    `).join('');
}

function renderApplications() {
    if (!applicationsTable) {
        return;
    }

    applicationsTable.innerHTML = Object.entries(applications).map(([reference, application]) => `
        <tr data-status="${application.status.toLowerCase()}">
            <td>${application.name}</td>
            <td>${application.subjects}</td>
            <td>${application.qualification}</td>
            <td>${application.experience}</td>
            <td>${application.date}</td>
            <td><span class="status ${getStatusClass(application.status)}">${application.status}</span></td>
            <td><button class="table-action" type="button" data-review="application" data-ref="${reference}">Review</button></td>
        </tr>
    `).join('');
}

function bookingPanelTemplate(booking) {
    return `
        <div class="panel-header">
            <p class="eyebrow">Booking review</p>
            <h2>${booking.reference}</h2>
        </div>
        <section class="panel-block">
            <h3>Full booking details</h3>
            <dl class="detail-list">
                <div><dt>Student</dt><dd>${booking.student}</dd></div>
                <div><dt>Parent</dt><dd>${booking.parent}</dd></div>
                <div><dt>Phone</dt><dd>${booking.phone}</dd></div>
                <div><dt>Subject</dt><dd>${booking.subject}</dd></div>
                <div><dt>Schedule</dt><dd>${booking.schedule}</dd></div>
                <div><dt>Location</dt><dd>${booking.location}</dd></div>
                <div><dt>Date</dt><dd>${booking.date}</dd></div>
                <div><dt>Status</dt><dd>${booking.status}</dd></div>
            </dl>
        </section>
        <section class="panel-block">
            <h3>Assign tutor</h3>
            <label>
                Tutor filtered by subject
                <select class="form-control" data-assigned-tutor>
                    ${createTutorOptions(booking.subject)}
                </select>
            </label>
        </section>
        <section class="panel-block">
            <h3>Admin decision</h3>
            <p>${booking.notes}</p>
            <div class="panel-actions">
                <button class="cta-btn approve-btn" type="button" data-approve-booking>Approve</button>
                <button class="cta-btn reject-btn" type="button">Reject</button>
            </div>
        </section>
        <section class="panel-block forward-card" data-forward-card>
            <h3>WhatsApp forward card</h3>
            <p data-forward-copy>
                Booking ${booking.reference}: ${booking.subject} for ${booking.student}. ${booking.schedule}. ${booking.location}. Parent contact: ${booking.phone}.
            </p>
            <a class="cta-btn gold" href="https://wa.me/?text=Booking%20${booking.reference}%20approved" target="_blank" rel="noopener noreferrer">
                Forward on WhatsApp
                <i class="fa-brands fa-whatsapp"></i>
            </a>
        </section>
    `;
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

document.addEventListener('click', (event) => {
    const reviewButton = event.target.closest('[data-review]');

    if (!reviewButton) {
        return;
    }

    const type = reviewButton.dataset.review;
    const reference = reviewButton.dataset.ref;

    if (type === 'booking') {
        openPanel(bookingPanelTemplate(bookings[reference]));
    }

    if (type === 'application') {
        openPanel(applicationPanelTemplate(applications[reference]));
    }
});

studentRows.forEach((row) => {
    row.addEventListener('click', () => {
        const historyRow = row.nextElementSibling;

        if (historyRow?.classList.contains('student-history-row')) {
            historyRow.classList.toggle('active');
        }
    });
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

panel.addEventListener('click', (event) => {
    if (event.target.matches('[data-approve-booking]')) {
        panel.querySelector('[data-forward-card]')?.classList.add('active');
    }

    if (event.target.matches('[data-approve-application]')) {
        const tutorGrid = document.querySelector('.tutor-grid');
        const tutorName = event.target.dataset.name;
        const tutorSubjects = event.target.dataset.subjects;

        if (tutorGrid && !tutorGrid.querySelector(`[data-added-tutor="${tutorName}"]`)) {
            tutorGrid.insertAdjacentHTML('beforeend', `
                <article class="admin-tutor-card surface-card" data-added-tutor="${tutorName}">
                    <img src="./assets/images/avatars/istockphoto-1254254792-612x612.jpg" alt="${tutorName}">
                    <div>
                        <h2>${tutorName}</h2>
                        <p>${tutorSubjects}</p>
                        <strong>0 sessions assigned</strong>
                    </div>
                </article>
            `);
        }

        event.target.textContent = 'Approved';
        event.target.disabled = true;
    }
});

renderBookings();
renderApplications();
