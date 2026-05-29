---
title: Expiry-Reminder Emails
slug: expiry-reminders
category: product
tags: [email, expiry, scheduler, listings, lifecycle, in-process-job]
sources: 0
updated: 2026-05-29
---

# Expiry-Reminder Emails

Listings expire 30 days after creation. The owner now receives a reminder email ~3 days before expiry
and again on the day of expiry, respecting their email opt-out and never sending the same reminder
twice. This closes the deferred follow-up that [[notifications]] flagged as unbuilt.

## Behavior

- Two reminders per listing: **"expiră în 3 zile"** and **"expiră astăzi"**. Each fires at most once.
- Recipients are filtered by the existing `email_notifications` opt-out flag on users — opted-out
  owners get nothing.
- Romanian copy with correct comma-below diacritics ș ț; same unsubscribe URL pattern as other emails
  (`/setari/notificari?unsubscribe={userId}`). Template `expiryReminderEmail(...)` lives next to the
  existing templates in `core/src/email/index.ts`.

## Mechanism (the project's first scheduler)

The project had **no scheduler** before this. Rather than add a dependency (node-cron) or an external
cron, an **in-process interval job** was chosen — consistent with the "npm run dev only, no external
services" constraint.

- `backend/app/src/jobs/expiry-reminders.ts` exports `startExpiryReminderJob(ctx)`.
- Triggered from `server.ts` **after `app.listen(...)`**: fires once ~10s after startup, then every 6h
  via `setInterval`.
- **Skipped entirely when `NODE_ENV === "test"`** so the test suite never spawns the timer.
- Each run: `listings.repo` query (`getDueExpiryReminders`, a `UNION ALL` of the 3-day and same-day
  cohorts) selects active, non-expired listings owned by opted-in users where the relevant
  `reminder_*_sent_at` is NULL → send email → stamp `reminder_3day_sent_at` / `reminder_expiry_sent_at`
  to `datetime('now')`.

## Schema

Migration `20260621010000_expiry_reminders.sql` adds two nullable columns to `listings`:
`reminder_3day_sent_at`, `reminder_expiry_sent_at` (mirrored in the Kysely `ListingsTable`).

## Open questions / limits

- 6h cadence + in-process means reminders only fire while the server is running; a process down across
  the whole 3-day window would miss the 3-day reminder (the expiry-day one still catches it on next
  boot, as long as the listing hasn't passed the same-day window). Acceptable at current scale.
- No backfill: listings already inside the 3-day window when this shipped will still get the same-day
  reminder, but may have missed the 3-day one.

## See also

- [[notifications]] — the email infra and opt-out this reuses; previously listed this as unbuilt
- [[listing-lifecycle]] — the 30-day expiry these reminders key off
- [[listing]] — entity gaining the two reminder timestamp columns
