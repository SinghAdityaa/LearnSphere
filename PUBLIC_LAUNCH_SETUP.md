# LearnSphere public launch setup (free-first)

## 1. Google sign-in (required for real users)
- In Google Cloud Console, create an OAuth **Web application** Client ID and configure OAuth consent screen and authorized JavaScript origins (localhost:5173 during development; actual HTTPS frontend domain in production).
- Use the **same** Client ID as `GOOGLE_CLIENT_ID` in the API environment and `VITE_GOOGLE_CLIENT_ID` in the frontend environment.
- Never put MongoDB URIs or JWT secrets in `VITE_` variables. Production should have `VITE_ENABLE_DEMO_LOGIN=false` (buttons also excluded from production builds).
- Existing demo accounts do not automatically become real Google accounts. Promote your own authenticated user to admin manually using a securely authenticated administrative process; do not enable admin self-registration.

## 2. Deploy (requires accounts and credentials)
- Create managed MongoDB Atlas deployment. Restrict network access to the backend host where possible, and enable managed backups or test documented backup procedures.
- Deploy `server/` on Render using `render.yaml` or equivalent private-repository settings. Set `MONGO_URI`, `GOOGLE_CLIENT_ID`, `CLIENT_URL`, `JWT_SECRET` (random >=32 chars), `NODE_ENV=production`, `ENABLE_DEMO_LOGIN=false`.
- Deploy `client/` on Vercel with framework Vite, build `npm run build`, output `dist`. Set `VITE_API_URL=https://YOUR_API_DOMAIN/api`, `VITE_GOOGLE_CLIENT_ID=<web OAuth client ID>`, `VITE_ENABLE_DEMO_LOGIN=false`.
- Set `CLIENT_URL` on backend to the **exact** HTTPS frontend origin; CORS and mutation origin checks depend on it. Redeploy both services after variables change.
- For cross-site API cookies: HTTPS, `SameSite=None; Secure` are required, but browsers may block third-party cookies. Prefer custom subdomains of the same registrable domain, e.g. `app.example.com` and `api.example.com`, and verify login on Safari/mobile as well. This starter still needs an operational cross-browser production sign-in test.

## 3. Content access warning
Public catalog and course details now return only course structure and lesson titles, never lecture text, media URLs or resource URLs. Course `/api/courses/:id/content` requires login and a currently published **free** enrollment. Paid courses cannot be unlocked via old enrollments. Existing third-party video URLs and static resource URLs are not DRM or signed storage; **do not host exclusive paid assets on public links.** Before selling, implement verified payment webhooks, entitlements and private storage with short-lived signed access URLs.

## 4. Acceptance testing before inviting students
- `npm run test`, `npm run build`, verify `/api/health`; test login with actual Google account, logout, session expiration and mobile browser cookies.
- Two independent student accounts: verify course progress, notes, whiteboards, quiz attempts and certificates are isolated.
- Confirm paid course media cannot be retrieved anonymously, and legacy enrollments do not bypass paid access; inspect response body of public API.
- Confirm production rejects `/api/auth/dev-login`, blocks unauthorized admin requests, enforces origin checks, and does not leak server exceptions.
- Configure custom domain, real legal privacy/terms text, favicon, error monitoring, uptime checks, database backup/restore testing, accessibility/mobile testing and rate-limit tuning.
- Start with a small pilot. Production readiness is **not certified** until these manual tests and legal/operational steps pass.
