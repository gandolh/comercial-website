---
summary: Seller profiles and the upload flow (2026-05-29), and sign-in since 2026-11-03 — owner only (create-owner), no sign-up or email reset, Sign in with Ward linked by subject.
updated: 2026-11-03
---

# Accounts & Seller Profiles

Account-adjacent features: password recovery UI, public seller profiles, and the fixed file-upload
flow. Originated from todos `password-reset-ui`, `seller-profile`, `fix-frontend-upload-flow`.

## Password reset UI

- `ForgotPasswordPage` (email form) → `POST /auth/password/forgot`; success state tells the user to check email.
- `ResetPasswordPage` reads the token from `?token=`, posts new password to `POST /auth/password/reset`,
  redirects to login, handles invalid/expired token. React Hook Form + Zod; i18n under `auth.*`.
- Backend endpoints pre-existed; this was the frontend wiring. In dev, the reset token is logged to
  console (via `LogEmailService`). Token is single-use (consumed on reset).

## Seller profile fields

- New nullable user columns (migration `20260615010000_user_profile_fields.sql`): `bio`, `website`,
  `social_twitter`, `social_instagram`, `social_github`.
- `PublicProfilePage` displays bio + website link + social links when present; settings `ProfileSection`
  edits them (RHF + Zod). i18n under `seller.*` and `settings.profile.*`.
- Read/written through `PATCH /users/me` and `GET /users/:id` (the existing profile service round-trips
  the new fields; no service rewrite needed).

## Upload flow fix

The frontend was still calling a removed presigned-URL / S3-PUT flow. Fixed at the service layer only,
to match the current disk-based backend contract:

- Listing images → single `POST /listings/:id/images`, multipart, field `file`.
- Create-listing assets → single `POST /listings/:id/assets`, multipart, field `file`.
- Avatar → `POST /users/me/avatar`, multipart, field `file`.
- The axios instance must not force `application/json` on FormData (lets the browser set the multipart boundary).

## Resolved follow-ups (2026-05-29)

- ✅ **Total-downloads count now shown** on the public profile — `SUM(download_count)` over the seller's
  active (non-expired) listings via `getTotalDownloadsForUser`, surfaced through `SellerSummary`
  (`total_downloads`) and `GET /users/:id`; rendered on `PublicProfilePage` next to active-listings count.
- ✅ **Avatar `window.fetch` monkey-patch removed** — callers use the direct `uploadAvatar` multipart
  `POST /users/me/avatar`; the `pending://` shim, the token→s3_key map, and `getAvatarUploadUrl` are gone.

## Open questions

- `lucide-react` v1.11 lacks brand icons (Twitter/Instagram/GitHub) — generic icons substituted.

## See also

- [user](user.md) — account entity, auth, the new profile columns
- [asset](asset.md) — the upload contract the services now match

## Sign-in since 2026-11-03

Sign-up and the email password reset are gone: only the owner has an account, made by
`npm run create-owner`. "Sign in with Ward" (`modules/ward.ts`, the vendored `ward-auth` client) is a
second way in once the owner links it from Settings; it finds the user by `users.ward_subject`.
See [decisions](decisions.md) → *Two ways in*.
