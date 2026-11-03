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
