# LearnSphere: full-stack learning platform

React 19 + Vite, Express 5, MongoDB/Mongoose. This is a development-ready LMS source project, not a certified production release.

## Start locally (Git Bash on Windows)

Open Git Bash in the project root. Docker Desktop must be running.

```bash
npm install
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up -d
npm run seed
npm run dev
```

If `.env` already exists, keep it instead of overwriting it. Use a strong random JWT secret even in development. MongoDB is persistent across container restarts. Seed script is for sample content, not a production migration. Visit http://localhost:5173 . Backend health is http://localhost:5000/api/health .

## Features

- Google Identity Services sign in verified against Google ID tokens on the Express backend. Configure BOTH `VITE_GOOGLE_CLIENT_ID` on client and `GOOGLE_CLIENT_ID` on server. Local demo authentication is enabled only when `ENABLE_DEMO_LOGIN=true` and `NODE_ENV` is not `production`. **Never enable demo authentication on a public deployment**.
- Separate student and admin roles enforced in API middleware.
- Admin course editor: create/edit/delete/publish courses, modules and lectures, video iframe URLs, description, tags, file resource **links** (no built-in binary upload), and final quiz questions.
- Learning paths: create, publish, unpublish and delete paths as an admin, browse published paths as a student. Course path reordering uses the checkbox selection order; drag-and-drop sorting is not implemented.
- Catalog, search, favorites, enrollments and progress in MongoDB.
- Lecture-specific saved notes and course-specific whiteboard strokes, stored in MongoDB and scoped to enrolled students. Students explicitly click Save.
- Quiz scoring happens on the server, questions sent to students exclude correct answers. Certificates are issued only after a passed quiz AND every course lesson is marked completed. Public read-only certificate validation: `/verify/<certificateId>`.
- PDF certificate downloads, user profile editing, quizzes and student dashboard.
- No fake testimonials, invented usage metrics, purple gradients, emoji icons or excessive animations.

## Test & build

```bash
npm run test
npm run build
```

`npm run test` executes basic Node built-in unit tests for scoring and certificate eligibility. The app has not undergone complete end-to-end or security penetration testing. Run manual testing below before trusting it with real users.

## Manual QA checklist

1. Admin demo: sign in, create draft, add module, add two lessons and resource link, save, reopen using Edit, publish.
2. Open that published course as a student (log out, demo student sign in), enroll, mark each lesson complete.
3. In a lesson, write private notes, click Save, refresh, confirm persistence. Switch lessons to confirm notes are separated.
4. Open Whiteboard, draw, click Save, refresh and confirm drawings persist across lessons of the same course.
5. Admin: Edit course, add at least one MCQ with correct index, save assessment.
6. Student: take and pass assessment before completing all lessons and verify no certificate is issued. Complete the lessons, take quiz again; now confirm PDF and verification page.
7. Admin: create and publish a learning path and visit `/paths` as a student.
8. Confirm unregistered visitors cannot edit admin content, notes or whiteboards.
9. Confirm mobile navigation and layout at narrow screen widths; inspect network and browser console errors.

## Required before public deployment

- Set production `NODE_ENV=production`, a strong fresh JWT_SECRET (32+ characters), production CLIENT_URL and both OAuth client IDs; add your real production Google OAuth authorized origins. Never put MongoDB URI or secret keys in client .env files.
- Host backend using HTTPS with a persistent MongoDB Atlas database or managed equivalent, and frontend on HTTPS. Hosting/deployment to Vercel, Render, or elsewhere has **not** been performed. A private repository is fine on supported providers.
- Review cookies for your domain arrangement. Cross-site cookies with `SameSite=None` require HTTPS and additional CSRF protections. Prefer a same-site reverse proxy or implement CSRF defenses before public traffic.
- Replace generic Privacy and Terms pages with policies specific to your actual practices; configure custom domain, favicon, privacy and terms before launch.
- Add real structured logging, monitoring, backup/restore plan, upload moderation if files are later allowed, rate limits per login, accessibility testing, and automated API/UI integration tests.
- Current Google account email matching must be reviewed for account-linking behavior before use with real accounts. Public certificate verification reveals the certificate holder name by design; document this in the privacy policy.
- The server does not currently provide paid courses, payment processing, instructors, discussion forums, versioned lesson progress after editing, or uploaded binary media.

## Project layout

`client/` React app, `server/` Express API and MongoDB models, `server/tests/` unit tests, `docker-compose.yml` local MongoDB.
# LearnSphere
