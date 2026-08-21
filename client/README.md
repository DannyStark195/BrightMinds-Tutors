# BrightMinds Tutors — client (React)

React + Vite + Tailwind CSS v4 rewrite of the BrightMinds Tutors frontend (<https://github.com/DannyStark195/BrightMinds-Tutors>).

This is a **refactor of the presentation layer only**. Every page renders
identically to the original vanilla HTML/CSS/JS client — same layout, colours,
spacing, fonts and responsive behaviour. The Flask backend is untouched and is
not part of this repository.

Live backend: <https://brightminds-tutors.onrender.com/api/>

## Stack

| | |
| --- | --- |
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router 7 |
| Icons | Font Awesome 7 (CDN, as in the original) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The API base URL defaults to the deployed backend, so this works with no
configuration. To point at a local Flask server:

```bash
cp .env.example .env
# then edit .env:
VITE_API_BASE_URL=http://127.0.0.1:5000/api/
```

```bash
npm run build       # production build into dist/
npm run preview     # serve the built output
```

## Project structure

```
public/
  assets/            images, icons — copied unchanged from the original
  sw.js              service worker for web push
src/
  main.jsx           entry: stylesheet order, OAuth token pickup, router mount
  App.jsx            all routes
  index.css          design tokens, base reset, shared component classes
  styles/            one scoped stylesheet per page
  pages/             one component per original .html file
  components/        layouts, header/footer, auth modal, shared widgets
  auth/              token handling, route-guard state, React contexts
  api/               api.js (parents) and adminAPI.js (admin)
  utils/             helpers.js, formHelpers.js
  hooks/             useDocumentTitle
  data/              static tutor/subject reference data
docs/
  REFACTOR-CONVENTIONS.md   how the original maps onto this app
  DEVIATIONS.md             every intentional difference from the original
_original-client-reference/ the original client, kept for comparison
```

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Landing | public |
| `/pricing` | Pricing | public |
| `/terms-of-use` | Terms of Use | public |
| `/privacy-policy` | Privacy Policy | public |
| `/dashboard` | Parent dashboard | user token |
| `/book` | Booking wizard | user token |
| `/booking-details` | Booking details (`?reff=`) | user token |
| `/make-payment` | Payment (`?reff=`) | user token |
| `/my-payments` | Payment history | user token |
| `/profile` | Profile | user token |
| `/review` | Reviews | user token |
| `/become-tutor` | Tutor application | user token |
| `/receipt` | Printable receipt (`?reff=`) | standalone |
| `/admin-login` | Admin login | public |
| `/admin` | Admin console | admin token |

`/index` redirects to `/`, since the original footer and logout both linked to
`./index`.


## Deploying

`vercel.json` sets `cleanUrls` and rewrites all paths to `index.html` so client
-side routes resolve on refresh and deep links.

## Author

Daniel Okafor — <https://github.com/DannyStark195>
