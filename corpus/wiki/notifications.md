---
summary: Transactional email on a new message and on a sale, and the opt-out.
updated: 2026-11-12
---

# Email Notifications

Transactional emails fire on two events; users can opt out. Originated from todo `email-notifications`.

## Behavior

- **New message** → email to the counterparty (not the sender), from `features/messaging/routes.ts`.
- **First download** of an asset → email to the listing owner, from `features/assets/routes.ts` (fires only
  when `download_count` reaches 1).
- Both are **fire-and-forget async** with try/catch logging — a failed send never breaks the HTTP
  request that triggered it. No job queue (deliberate scope decision).
- **Opt-out:** `email_notifications` boolean column on users (migration
  `20260610020000_email_notifications_pref.sql`, default on). Toggled via `PATCH /users/me`; respected
  before every send. Settings UI strings under i18n `settings.notifications.*`.
- **Transport:** when SMTP is unconfigured (dev/CI), `core/src/lib/email.ts` uses a `LogEmailService` that
  logs instead of sending — no crash, no config needed. Romanian copy with correct diacritics.

## Open questions

- **Expiry-reminder emails (3 days before / on expiry) shipped 2026-05-29** via an in-process interval
  job — see [expiry-reminders](expiry-reminders.md). (Was previously the main outstanding follow-up here.)
- Email link base URL is read from `FRONTEND_BASE_URL` at module load (defaults to localhost:5173).

## See also

- [user](user.md) — `email_notifications` preference + recipient identity
- [listing-lifecycle](listing-lifecycle.md) — the expiry events the deferred reminders would key off
