---
title: Email Notifications
slug: email-notifications
type: add
priority: medium
status: pending
area: backend
updated: 2026-05-28
---

# Email Notifications

## What

The email service exists (`SmtpEmailService`, `LogEmailService`) but is only used for auth flows (email verification, password reset). Add transactional emails for key marketplace events.

## Emails to add

| Trigger | Recipient | Subject | Content |
|---|---|---|---|
| New message received | Seller or buyer | "Ai un mesaj nou pe my-olx" | Message preview + link to conversation |
| First download of a listing | Seller | "Cineva a descărcat [titlu]" | Download count, buyer (anonymous) |
| Listing expiring in 3 days | Seller | "[Titlu] expiră în 3 zile" | Link to renew |
| Listing expired | Seller | "[Titlu] a expirat" | Link to reactivate |
| New purchase (when payments added) | Buyer + Seller | "Comandă confirmată / Vânzare nouă" | Order details |
| Email verification (already done) | Registering user | "Verifică-ți adresa de email" | Token link |
| Password reset (already done) | User | "Resetare parolă" | Token link |

## Implementation notes

- Email sending should be **async** — never block the HTTP response. Use a simple in-process queue or fire-and-forget with error logging. Don't add a job queue (BullMQ etc.) at this stage.
- All emails in **Romanian** with correct diacritics.
- Templates: simple HTML strings in code, no template engine needed at this scale.
- SMTP config: already in `Config` struct; in dev `LogEmailService` logs to console.

## Backend changes

- `core/src/email/index.ts` — add `EmailTemplates` helpers (functions that return `EmailMessage` objects)
- Wire notification sends in relevant modules:
  - `messaging.ts` — after inserting a message, email the other participant
  - `assets.ts` — after recording a download, email the listing owner (first download only: check `download_count = 1`)
  - Background job or cron for expiry emails (or check on login/listing fetch)

## Unsubscribe

- Add `email_notifications` boolean column to `users` (default 1)
- Unsubscribe link in every email footer

## Acceptance criteria

- [ ] New message triggers email to counterparty (not to sender)
- [ ] First download triggers email to listing owner
- [ ] Expiry reminder sent 3 days before expiry (mechanism TBD — cron or lazy check)
- [ ] All email text is in Romanian
- [ ] Emails don't block HTTP responses
- [ ] User can opt out via settings
