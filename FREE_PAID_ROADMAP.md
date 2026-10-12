# LearnSphere: free-first, paid-ready

## Implemented
- Course has `accessType` (`free` by default) and `priceInr` (integer INR, display-only). Existing course documents are treated as free by Mongoose defaults.
- Admin can create/edit a paid catalog listing with a positive planned price; free courses must cost zero.
- Catalog and course detail pages identify free versus paid courses.
- Student enrollment API **rejects paid enrollments** with HTTP 403, regardless of the frontend UI; no fake checkout or manual "payment complete" toggle is present.
- Paid courses have disabled enrollment calls to action. No payment data is collected.
- Fixed `lessonCount` on courses populated without modules to avoid a 500 error.

## Before charging real students (not implemented yet)
1. Integrate a verified payment provider, create orders on the backend, verify signed webhooks, handle retries and duplicate notifications.
2. Store immutable order/payment records and entitlements keyed by user/course; only the verified backend webhook should grant access. Do not trust client success screens.
3. Enforce entitlement on **all** paid course content, lessons, quizzes, files, notes, certificates and progress endpoints (the current course API returns module contents and resource links). Protect media with authorized signed URLs or a similar mechanism.
4. Define refund/chargeback/cancellation processes, revoke entitlement where appropriate, and provide receipts and support contact.
5. Review tax/invoicing, payment-provider terms and local regulatory obligations before launch.

## Free-public-launch blockers
Configure verified Google sign-in, remove demo endpoints from production, check authorization, protect cookies and CSRF, configure cloud database/backups, finish legal pages and custom domain, run frontend build and end-to-end tests.

This release is **not** a paid course sales platform or production authorization audit. Do not use the paid listings for protected premium material until full authorization is added.
