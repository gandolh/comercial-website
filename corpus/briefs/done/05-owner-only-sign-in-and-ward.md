# Task 05 — Sign-up closed, the owner's account by command, Sign in with Ward

## Context
Only the owner signs in (decisions.md → *Only the owner signs in*, *Two ways in*). The app has its own
JWT + Argon2 login with open registration (`POST /auth/register` in `backend/app/src/modules/auth.ts`).
The estate's other apps sign in through Ward with the vendored `ward-auth` library; Shelfmark's
`server/vendor/ward/` is version 0.4.0 and its `createWardClient` runs the OIDC code flow.

## Files you OWN
`backend/app/src/modules/auth.ts`, `backend/core/src/auth/`, `backend/core/src/config/`, a new
`backend/vendor/ward/` (copied verbatim from Shelfmark's server vendor folder, README kept), a CLI
script for the owner's account, the frontend sign-in and register pages and their routes.

## What to do
1. **Close sign-up:** `POST /auth/register` returns 403 (or is removed), and the frontend has no
   register page or link. Password reset stays for the owner only if it needs no email; otherwise
   remove its UI (no SMTP in the demo).
2. **The owner's account:** a command (`npm run create-owner`) reads `OWNER_EMAIL`, `OWNER_PASSWORD` and
   `OWNER_NAME` from the environment and creates or updates that user (verified email). Idempotent.
3. **Sign in with Ward:** when `WARD_OIDC_ISSUER` and the other `WARD_OIDC_*` settings are set, the
   sign-in page shows "Intră cu Ward". The callback (`/auth/ward/callback`, under the API prefix)
   finishes the code flow with `createWardClient`, finds the local user **with the same email** and
   issues the app's usual JWT. An email with no local user is refused with a clear message. With
   `WARD_OIDC_ISSUER` unset, only the local login shows.
4. Tests: register refused; create-owner idempotent; the Ward callback links by email and refuses an
   unknown one (with a fake Ward client).

## Acceptance
- No way to create an account from the browser; the owner signs in with the password or with Ward.
- Backend and frontend build, lint and tests pass.

---

**Outcome (2026-11-03).** Done (`e058ff3`), with one change to the spec.
- **The change:** Ward's ID token has no email, and the vendored library forbids linking by name or
  email. So Ward links by subject: the owner links it once from Settings while signed in, and after that
  "Intră cu Ward" signs in by `users.ward_subject`. An unlinked Ward account is refused.
  [decisions.md](../../wiki/decisions.md) records the revision.
- **The flow:**
  - The routes are `/auth/ward/status`, `/link-ticket` (a single-use ticket, because the start is a
    plain navigation), `/start` and `/callback`.
  - The flow secrets live in memory behind an HttpOnly cookie.
  - The token comes back in the URL fragment, so no server or log sees it.
- **The rest:**
  - `POST /auth/register` returns 403, and the register page, its links and the email reset (forgot and
    reset routes and pages) are removed.
  - `npm run create-owner` is idempotent and resets the password on a rerun. It refuses a password
    under 12 characters.
- **Checked:**
  - The tests use a fake Ward client through the real app and cover link, sign-in, an unknown subject,
    a missing flow and a reused ticket; register refused; create-owner. Backend tests: 152.
  - In the browser, on the scratch database: the login page shows no sign-up, reset or Ward button (Ward
    not configured), and the owner made by `create-owner` signs in.
- **Not checked:** a real Ward round trip. It needs the app registered at Ward, which is part of the
  deploy (brief 09 and the owner's `npm run setup`).
