# Refactor conventions

How the original vanilla client maps onto this React app. Follow these when
touching or adding a page.

## Goal

The deployed app must look **identical** to the original. Styling, colours,
spacing and responsive behaviour are all carried over unchanged. Only the code
organisation changed.

## Directory layout

Mirrors the original `client/` so the two can be read side by side:

| Original                | Here                          |
| ----------------------- | ----------------------------- |
| `*.html`                | `src/pages/*.jsx`             |
| `css/global.css`        | `src/index.css` (base + tokens) |
| `css/layout.css`        | `src/index.css` (header/footer) |
| `css/components.css`    | `src/index.css` (design system) |
| `css/<page>.css`        | `src/styles/<page>.css`       |
| `js/api/*.js`           | `src/api/*.js`                |
| `js/auth/*.js`          | `src/auth/*.js`               |
| `js/components/*.js`    | `src/components/*.jsx`        |
| `js/scripts/<page>.js`  | folded into `src/pages/*.jsx` |
| `js/utils/*.js`         | `src/utils/*.js`              |
| `js/data/tutor.js`      | `src/data/tutors.js`          |
| `assets/`               | `public/assets/`              |

A copy of the original client is kept at `_original-client-reference/` for
comparison. It is not part of the build.

## The cascade is load-bearing — keep class names

The original relies on specificity and `<link>` order. For example
`.form-container button` (0,1,1) beats `.cta-btn` (0,1,0) on padding, but
`.cta-btn.gold` (0,2,0) beats both on background. Renaming or restructuring
classes silently changes which rule wins.

So: **keep every class name from the original markup, in the same order on the
same elements.** Tailwind utilities are for genuinely new one-off layout, not
for replacing existing classes.

### The one exception: `/receipt`

`receipt.html` loaded *none* of the shared stylesheets, so it reused `.header`,
`.logo`, `.status` and `.footer` for its own unrelated components. Here
`index.css` is always loaded and those names belong to the site nav bar, footer
and status pill. Keeping them would mean overriding 16 leaked declarations, one
of which (`.header .logo`) cannot be beaten at equal specificity — so on that
page they carry a `receipt-` prefix instead. See `docs/DEVIATIONS.md` §2.

The rule of thumb: preserve class names to preserve the cascade. Where a name
*is* the collision, rename it and write down why.

## Tailwind setup

- Tailwind v4 via `@tailwindcss/vite`.
- **Preflight is deliberately not imported.** It would restyle headings,
  buttons, inputs, images and lists, none of which the original expects. See
  the header comment in `src/index.css`.
- Design tokens live in `@theme` (`--color-primary`, `--color-accent`, …) and
  are aliased to the original names (`--Primary`, `--Accent`, …) in `:root`, so
  ported rules read exactly like the CSS they came from.
- Layers are declared once, in `src/index.css`:
  `@layer theme, base, components, utilities;`

## Per-page CSS

Every page's CSS is scoped to that page's wrapper class, because in a SPA all
stylesheets are loaded at once and the original page-specific files collide
(`.side-card`, `.toggle-slide`, `.hero-actions`, `.label`, `.date` and a bare
`main { … }` are each defined differently in two or more files).

Pattern — `src/styles/dashboard.css`:

```css
@layer components {
  .dashboard-page {
    /* rules that were `.dashboard-page { … }` go here as bare declarations */
    position: relative;

    /* `main { … }` — scoped, so it can't leak to other pages */
    main {
      width: min(1120px, 100%);
      margin-inline: auto;
      padding: 12px 20px 90px;
    }

    /* `.d-card { … }` */
    .d-card {
      padding: 28px;
    }

    /* media queries nest too */
    @media (max-width: 560px) {
      main {
        padding-inline: 16px;
      }
    }
  }
}
```

Rules:

1. Wrap in `@layer components { … }` so page CSS lands in the same layer as the
   shared design system and, being imported later, wins ties exactly as the
   original `<link>` order did.
2. Scope under the page's wrapper class using native CSS nesting.
3. `@keyframes` cannot be nested — put them at the top of the file, outside the
   `@layer` block.
4. Never redefine something already in `src/index.css`.
5. Where the original loaded one page's CSS on two pages, scope to both with
   `:is()` so specificity stays at a single class —
   e.g. `:is(.dashboard-page, .review-page)` for `dashboard.css`, which
   `review.html` also loaded.

Stylesheet import order is fixed in `src/main.jsx`, not in page components, so
the cascade is deterministic.

## Page wrapper classes

| Route              | Wrapper class                            | Shell             |
| ------------------ | ---------------------------------------- | ----------------- |
| `/`                | `landing-page`                           | `PublicLayout`    |
| `/pricing`         | `pricing-page white-bg`                  | `PublicLayout`    |
| `/terms-of-use`    | `legal-page white-bg`                    | `PublicLayout`    |
| `/privacy-policy`  | `legal-page white-bg`                    | `PublicLayout`    |
| `/dashboard`       | `dashboard-page page-shell`              | `DashboardLayout` |
| `/book`            | `booking-page page-shell`                | `DashboardLayout` |
| `/booking-details` | `booking-details-page page-shell`        | `DashboardLayout` |
| `/make-payment`    | `payment-page page-shell`                | `DashboardLayout` |
| `/my-payments`     | `payments-page page-shell`               | `DashboardLayout` |
| `/profile`         | `profile-page page-shell`                | `DashboardLayout` |
| `/review`          | `review-page page-shell`                 | `DashboardLayout` |
| `/become-tutor`    | `tutor-page page-shell`                  | `DashboardLayout` |
| `/admin`           | `admin-page`                             | none (own sidebar) |
| `/admin-login`     | `booking-page admin-login-page page-shell` | none            |
| `/receipt`         | `receipt-page`                           | none              |

`PublicLayout` renders the public header, children, footer and the auth modal.
`DashboardLayout` renders the signed-in header, children and the `.overlay`
backdrop — and no footer, matching the original.

## What replaced the imperative DOM code

| Original                                        | Here                                    |
| ----------------------------------------------- | --------------------------------------- |
| `activateElement` / `deactivateElement`         | conditional `active` in `className`     |
| `showLoading()` / `hideLoading()`               | `<LoadingState active={loading} />`     |
| `setupPasswordToggle(...)`                      | `<PasswordInput />`                     |
| `loginRequired()` (`js/auth/dAuth.js`)          | `<ProtectedRoute />`                    |
| `adminLoginRequired()`                          | `<AdminRoute />`                        |
| `.open-login` / `.open-signup` listeners        | `useAuthModal()`                        |
| `innerHTML = …` template strings                | JSX                                     |
| per-file `getUserProfile()` calls               | `useUser()` from `UserProvider`         |
| `<title>` per HTML file                         | `useDocumentTitle('…')`                 |
| `?token=` handling in `dashboard.js`            | `consumeOAuthToken()` in `src/main.jsx` |

## Code style

- Function components and hooks only. No class components, no PropTypes.
- 2-space indent, single quotes, no semicolons.
- Asset paths are absolute from `public/`: `/assets/icons/tutor-logo.svg`.
- Internal navigation uses `<Link to="/…">`; query strings via
  `useSearchParams()`.
- No `dangerouslySetInnerHTML`.
- Keep the original's `<Link><button>…</button></Link>` nesting where the CSS
  depends on it (`.navbar button`, `.more-links a button`, `.link a button`).

## Deviations from the original

Behavioural fixes and dead code removals are listed in `docs/DEVIATIONS.md`.
Anything that would change how a page *looks* was not touched.
