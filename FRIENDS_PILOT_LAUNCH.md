# LearnSphere friends-and-portfolio pilot

## What this release adds

- `/admin/students` lists student Google accounts with search and pagination (10 per page).
- Admins can open an account to view enrollments, recorded progress, and certificates.
- The APIs `/api/admin/students` and `/api/admin/students/:id` require a valid admin session. Student pages cannot access them.
- Existing Google sign-in continues to create ordinary student accounts.
- The demo sign-in controls are hidden from production React builds. The backend rejects `/api/auth/dev-login` in `NODE_ENV=production` even if someone calls it manually.

## Become an administrator using your real Google account

1. Keep MongoDB running. Sign in once to LearnSphere using your actual Google account.
2. In `server/.env`, ensure `MONGO_URI` points to the **same database** used by the backend.
3. In a terminal in the `server` directory run:

   `npm run grant-admin -- your-google-email@example.com`

4. Log out, then sign back in with Google. The Admin and Students links will be visible only to accounts with `role: admin`.
5. Do not use the demo admin account for production. There is no public “become admin” button or admin promotion API.

When using MongoDB Atlas in production, run the command with **production MONGO_URI** in a secure environment, not against your local Docker database. Do not commit or publish environment files.

## Testing locally

From the project root:

```bash
npm install
npm run install:all
# restore existing .env files; don't replace your configuration
npm run test
npm run build
npm run dev
```

Sign in as a Google-linked admin and open `http://localhost:5173/admin/students`. Test search, pagination, student detail, and an actual student account. Check that normal students get HTTP 403 from `/api/admin/students`. Test on mobile and desktop.

## Deploy for a small private pilot

- **Frontend**: Import your GitHub repository into Vercel. Set Root Directory = `client`, Framework = Vite, Build = `npm run build`, Output = `dist` (defaults generally work). Set `VITE_API_URL=https://YOUR-API-HOST/api` and `VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID`.
- **Backend**: Deploy the `server` folder as a persistent Node/Express web service on Render, Railway, or comparable hosting. Use `npm start`. Set `NODE_ENV=production`, `ENABLE_DEMO_LOGIN=false`, `GOOGLE_CLIENT_ID`, `CLIENT_URL=https://YOUR-VERCEL-DOMAIN`, `MONGO_URI`, and a strong random `JWT_SECRET`. Do not put `MONGO_URI` or `JWT_SECRET` into Vercel frontend environment variables.
- **Database**: Move data to MongoDB Atlas or another managed MongoDB host. Your local Docker database is not accessible to friends on the internet. Set a secure database user and restrictive network access.
- **Google Console**: Add your Vercel HTTPS URL under Authorized JavaScript origins for the same OAuth web client. While the OAuth consent app is in testing mode, add friends as test users as required.
- **Cookies**: This app currently uses cross-site HTTP-only cookies (`SameSite=None; Secure`) in production. Browser privacy protections may reject these when the frontend and backend use unrelated hostnames. For reliable public use, configure a custom domain with sibling hosts like `learn.example.com` and `api.example.com`, then test sign-in and refresh across browsers. Review CSRF/origin enforcement and session security before a wider launch.
- **Content**: Replace sample courses, placeholder videos, claims, and privacy/terms templates. Include a real support address and data deletion process.
- **Validation**: Run a production student end-to-end test on a second device, including logout, progress retention and access-denied checks. Enable HTTPS, logs, backups, uptime alerts and rate limiting.

This is suitable as a *development pilot candidate*, not verified production-ready software. Do not enable payments or distribute private paid lessons until storage, authorization and payments are audited and tested.
