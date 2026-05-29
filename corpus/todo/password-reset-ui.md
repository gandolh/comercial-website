---
title: Password Reset UI
slug: password-reset-ui
type: update
priority: medium
status: done
area: frontend
updated: 2026-05-29
---

# Password Reset UI

## What

The backend has the full password reset flow implemented (`POST /auth/password/forgot`, `POST /auth/password/reset`). The frontend has `ForgotPasswordPage` and `ResetPasswordPage` pages and routes. Verify the end-to-end flow works, as the email service was previously pointing to MailHog (now removed).

## What was changed

The `SmtpEmailService` was connected to MailHog (`localhost:1025`) in dev. MailHog is gone. In dev, `createEmailService({})` now uses `LogEmailService` which logs to console instead of sending. The reset token is logged to console — usable for manual testing.

## What to verify

- `POST /auth/password/forgot` — sends email (console in dev); check token appears in server logs
- `POST /auth/password/reset` with token — resets password
- Frontend `ForgotPasswordPage` — form submits, success message shown
- Frontend `ResetPasswordPage` — reads token from URL query param (`?token=...`), form submits

## Possible issues

- Frontend `ResetPasswordPage` may expect token in URL hash vs query param — check backend email template
- Email template may still reference MailHog-era URLs

## Acceptance criteria

- [x] Forgot password form submits without error
- [x] Reset token logged to console in dev (LogEmailService)
- [x] Reset password form accepts token from URL and resets password
- [x] User can log in with new password after reset
- [x] Old token rejected after use (consumed = 1)
