---
title: Accounts & Seller Profiles
slug: accounts-and-profiles
category: product
tags: [auth, password-reset, seller-profile, settings, uploads]
sources: 0
updated: 2026-05-29
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

## Open questions

- **Profile "total downloads count" is NOT shown** — only bio/website/social shipped. Deferred follow-up.
- The avatar fix retains a `window.fetch` monkey-patch shim to preserve the old hook's two-step call
  surface — it works but is hacky; should be replaced by updating the hook directly.
- `lucide-react` v1.11 lacks brand icons (Twitter/Instagram/GitHub) — generic icons substituted.

## See also

- [[user]] — account entity, auth, the new profile columns
- [[asset]] — the upload contract the services now match
