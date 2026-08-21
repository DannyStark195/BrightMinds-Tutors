# Deviations from the original client

Everything here is intentional. The rule applied throughout: **anything that
changes how a page looks was not touched.** What is listed below is either
invisible (dead code, code-quality), or visible only in an error/success state
where the original was plainly broken — and each of those is called out.

If you disagree with any of these, they are all small and easy to revert.

---

## 1. Build and styling infrastructure

**Tailwind's Preflight is not imported.**
`src/index.css` imports only `tailwindcss/theme.css` and
`tailwindcss/utilities.css`. Preflight sets `font-size`/`font-weight: inherit`
on `h1`–`h6`, `font: inherit` on buttons and inputs, `display: block` and
`max-width: 100%` on images, and `list-style: none` on lists. This design leans
on browser defaults for several headings and never expected any of that, so
Preflight would have visibly changed most pages. The original's whole reset is
the three lines now in `@layer base`. Verified in the built CSS: zero Preflight
signatures.

**Two keyframes renamed, because Tailwind v4 ships the same names.**
`spin` → `subjects-marquee` (the landing page's subject marquee) and
`pulse` → `pulse-logo` (the loading logo). Tailwind's `theme.css` defines
`@keyframes spin` and `@keyframes pulse` for `animate-spin` / `animate-pulse`.

**Per-page CSS is scoped to each page's wrapper class.**
The original loaded one stylesheet per page, so several page files define the
same class differently — `.side-card` (dashboard vs booking-details),
`.toggle-slide` (components vs pricing), `.hero-actions`, `.label`, `.date`,
`.hidden`, and a bare `main { … }` in dashboard.css. A SPA loads them all at
once. Scoping keeps them apart and preserves the original cascade, since page
CSS is imported after `index.css` in the same `components` layer.
`dashboard.css` is scoped to `:is(.dashboard-page, .review-page)` because
review.html loaded it too.

**Fonts are deliberately unchanged, including what looks like a mistake.**
The original loads Playfair and applies it to nothing; `--font-headings` is
declared and never referenced; `--font-body: 'Inter'` and the `'Space Mono'` in
dashboard.css / my-payments.css are never loaded at all, so they fall back to
the system sans-serif and generic monospace. All reproduced exactly. Loading the
real fonts would change every page — worth doing, but as its own deliberate
change.

**`BASE_URL` is now overridable** via `VITE_API_BASE_URL`, defaulting to the
production backend so a fresh clone works untouched. The original README told
you to hand-edit `js/api/api.js`.

---

## 2. Receipt page: four class names prefixed

`receipt.html` was standalone — it loaded none of the shared stylesheets — so
its inline `<style>` was free to use `.header`, `.logo`, `.status` and `.footer`
for its own components. In this SPA `index.css` is always loaded, and those names
mean something else entirely there: `.header` is the sticky blurred nav bar,
`.footer` (and the bare `footer` selector) the dark-blue site footer, `.status`
an uppercase pill.

An audit of the compiled stylesheet found **16 shared declarations** reaching the
receipt's elements, including `.header .logo { flex; min-width }`, which cannot
be overridden by a same-name rule at equal specificity. So those four are
renamed `receipt-header`, `receipt-logo`, `receipt-status`, `receipt-footer`
(and the redundant `footer-link` class dropped). Nothing outside the page and its
own stylesheet ever referenced them. Re-audited after the change: 3 matches
remain, all verified harmless — the bare `footer` rule (all three of its
properties are overridden), `.eyebrow` (identical declarations in both), and
Tailwind's `.grid` utility (same `display: grid`).

`.eyebrow` is deliberately **not** renamed: `index.css` defines it with the same
six declarations and the same values.

Also on this page: `html, body` styling moved onto `.receipt-page` (it inherits,
so the result is identical, and it must not touch the shared `<body>`), with
`padding-block: 40px` because the original set 20px on `html` *and* `body` and
the two stacked.

---

## 3. Dead code removed

None of this ran or rendered in the original.

- **`redirectIfLoggedIn`** — imported by `landing.js`, never called. No redirect
  added.
- **`.active-bookings` / `.active-bookings.active-bookings`** (dashboard.css) —
  the compound matches the same single element as the base selector and is more
  specific, so `display: none` never applied.
- **The stray `z` in review.css** (line 115) turns the next selector into
  `z .rating i`, which matches nothing, so that transition never applied.
  `.rating:hover + i` parses fine but each `<i>` is *inside* its `.rating` label,
  so it never matched either. Both omitted — omitting rules that match nothing
  renders identically. Making them live would have added animation that was
  never there.
- **`.rating-picker button`** (review.css, mobile) — the picker is built from
  `<label class="rating">`, never `<button>`. Kept, with a note, since it is
  inert.
- **Empty rules** dropped: `.dashboard-hero .greeting`, `.toggle-btn.active`,
  `.admin-tutor-card-profile-pic`, `.brand span`, `input.input-error`,
  `.dashboard-navbar.active` (mobile), `.profile:hover .navbar .more-links`.
- **`.forward-card`** (admin) is `display: none` until it gets `active`, and
  nothing ever added it. Markup kept, still hidden.
- **`.terms-error`** (book) — `validateStep4` looked it up via `.terms-checkbox`,
  a class the checkbox does not have, so it was always null. The checkbox's
  `required` attribute is what actually enforces the terms, via the browser's own
  validation. Markup kept, still hidden.
- **`.alert.tutor-application-success`** (become-tutor) — `becomeTutor.js` never
  removed its `inactive` class; on success it wrote the API message into the
  `.msg.file` slot instead. Kept permanently hidden, with a comment explaining
  how to switch it on deliberately.
- **`admin.html`'s hardcoded tutor cards** sat inside a broken comment (a
  trailing `-->` with no opening `<!--`, and one `</article>` with no opening
  tag). `admin.js` overwrote the container on load, so they were never really
  seen. Only API tutors render now.
- **`subjectsTaught`** (become-tutor) and **`data-application="[object Object]"`**
  (admin) — computed, never used.
- Empty `<img src="" class="subject-icon">` ×24 on the landing page — an empty
  `src` re-requests the page URL in some browsers, and no CSS targets the class.
- Empty `<div></div>` inside the nav buttons — no rule targets `.navbar button div`.
- `console.log` calls in `landing.js`, `dashboard.js`, `admin.js`, `auth.js`.
- Unused imports in `api.js` (`isAuthenticated`, `loginRequired`,
  `calculateFileHash`).
- **`html2pdf`** — `receipt.html` loaded it from a CDN but `receipt.js` never
  called it; the button uses the server-rendered PDF via `downloadReceipt()`.
  No dependency added.

---

## 4. Bug fixes — visible only in error/success states

Each of these left the UI stuck or silently broken. Called out so you can revert
any you would rather keep as-is.

- **Buttons stuck on "Loading..."** — `becomeTutor.js` returned early on upload
  failure and `admin.js` returned early on a failed decision, both without
  re-enabling the button, leaving no way to retry. Both now restore.
- **Submit-button icon destroyed** — the original used
  `submitBtn.textContent = "Loading..."`, which permanently removed the nested
  `<i>` arrow after the first submit. The arrow now returns.
- **Reset-password button never showed progress** — `handleResetPassword` looked
  up `signupForm.querySelector('button')`, the wrong form's button. Now wired to
  its own.
- **OAuth buttons double-fired** — `<button>` with no `type` inside a `<form>`
  defaults to `submit`, so clicking "Sign up with Google" both redirected *and*
  ran the signup handler. Now `type="button"`.
- **Review messages stopped appearing** — `review.js` reset the form by replacing
  its `innerHTML`, which destroyed the `<p class="msg">` it had just written the
  success text into; the handler then held a detached node, so no message ever
  showed again that session. The message now stays and the fields reset.
- **Admin decisions fired N times** — `renderAdminDecision()` added another click
  listener to the panel on every panel open *and* on every document click, so
  listeners accumulated and one approve click sent one request per listener. Now
  an ordinary `onClick`.
- **Admin panel threw on a document link** — the panel's delegated handler matched
  any `.cta-btn`, including "Download Experence proof", then dereferenced a null
  textarea. Handlers are on the actual buttons now.
- **Crashes on empty API responses** — `getBookings`/`getPayments`/
  `getBookingsForReview`/`getReviewedBookings` resolve to `null` on failure and
  the original called `.forEach` on it. On the review page that killed the whole
  module (empty select, no star picker, no submit handler). Now treated as empty,
  which renders the same but keeps the page working.
- **Broken default-avatar paths** — `.assets/images/avatars/…` (admin, missing
  slash) and `assets/images/avatar/…` (booking-details, wrong folder). Both
  pointed at the correct file.

---

## 5. Architectural changes with no visual effect

- **Profile fetched once.** `dNavMenu.js` fetched the profile for the header and
  each page script fetched it again. `UserProvider` fetches once per dashboard
  visit and shares it. Side effect: after a profile edit the header name now
  updates too — the original only called `renderUserprofile()`, not
  `renderHeader()`, so it stayed stale until navigation.
- **`?token=` handled before mount.** The OAuth callback token is consumed in
  `src/main.jsx` before React renders, because `ProtectedRoute` would otherwise
  bounce the user to the login form. The original relied on `<script>` order:
  `dashboard.js` before `dAuth.js`.
- **Route guards replace redirect calls.** `loginRequired()` → `ProtectedRoute`,
  `adminLoginRequired()` → `AdminRoute`. `admin.html` had its `adminAuth.js`
  script tag commented out, but `admin.js` imported and called
  `adminLoginRequired()` directly, so the guard is faithful — it just applies
  before the first render instead of after the first failed API call.
- **`logout()` goes to `/`** rather than `/index`; both render the landing page,
  and `/index` still redirects there for old links.
- **API boilerplate factored out.** Every function keeps its exact return shape
  (some resolve to `null`, others to `{ valid, message }`); the repeated token
  lookup and header objects became three helpers.
- **`<title>` per route** via `useDocumentTitle`, since a SPA has one document.

---

## 6. Known divergence I could not avoid

**The dashboard booking card for `approved` / `renew` bookings.**

The original template nests an `<a>` (Proceed to payment / Renew Booking) inside
the card's own `<a>`. That is invalid HTML, and the parser's adoption-agency
algorithm restructures it — closing the outer anchor early and re-parenting
`.card-footer` outside the card. React builds the DOM directly from the tree, so
the card now renders as the template was evidently written to render, with the
footer inside the card.

Reproducing a parser-recovery artifact is not something I can do faithfully in
React, so this is the one place where the rendered result differs from the
original. Clicks behave correctly (the inner link stops propagation, the outer
skips when `defaultPrevented`). React does log a `validateDOMNesting` warning in
development. If you want this fully resolved, the fix is to make the card a
non-anchor container with a click handler, or use the "stretched link" pattern —
say the word.

---

## 7. Typos and copy left exactly as-is

User-visible strings are yours to change, so none were touched:

- "Application Successfull" (become-tutor success panel, itself hidden)
- "Download reciept" (receipt button), "Download Experence proof" (admin)
- "Failed to update admin decison" (admin fallback message)
- "Disablities" (admin students table header)
- "Permenly" (profile delete-account copy)
- "Section 6 above.." — double full stop in the Terms
- Terms TOC links to `#bookings`, but no section carries that id
- `mailto:info@brightmindstutors.com` vs the displayed `info@brightmindtutors.com`
- Comparison table header says "Starter" while the pricing card says "Light"
- "Back to dashboard" (become-tutor) links to `#process`
- Every admin overview stat, the recent-activity list, the booking summary card,
  the 4.8 average rating, and the admin tutor cards' "Mathematics, Physics /
  18 sessions assigned" are hardcoded placeholders the original never wired to
  the API.
