---
title: Email Notifications
slug: notifications
category: product
tags: [email, notifications, messaging, downloads, opt-out]
sources: 0
updated: 2026-05-29
---

# Email Notifications

Transactional emails fire on two events; users can opt out. Originated from todo `email-notifications`.

## Behavior

- **New message** → email to the counterparty (not the sender), from `modules/messaging.ts`.
- **First download** of an asset → email to the listing owner, from `modules/assets.ts` (fires only
  when `download_count` reaches 1).
- Both are **fire-and-forget async** with try/catch logging — a failed send never breaks the HTTP
  request that triggered it. No job queue (deliberate scope decision).
- **Opt-out:** `email_notifications` boolean column on users (migration
  `20260610020000_email_notifications_pref.sql`, default on). Toggled via `PATCH /users/me`; respected
  before every send. Settings UI strings under i18n `settings.notifications.*`.
- **Transport:** when SMTP is unconfigured (dev/CI), `core/src/email` uses a `LogEmailService` that
  logs instead of sending — no crash, no config needed. Romanian copy with correct diacritics.

## Open questions

- **Expiry-reminder emails (3 days before / on expiry) shipped 2026-05-29** via an in-process interval
  job — see [[expiry-reminders]]. (Was previously the main outstanding follow-up here.)
- Email link base URL is read from `FRONTEND_BASE_URL` at module load (defaults to localhost:5173).

## See also

- [[user]] — `email_notifications` preference + recipient identity
- [[listing-lifecycle]] — the expiry events the deferred reminders would key off
