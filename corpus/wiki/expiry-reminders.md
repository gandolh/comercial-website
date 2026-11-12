---
summary: Expiry-reminder emails three days before and on the day a listing expires, with the opt-out and no duplicates.
updated: 2026-11-12
---

# Expiry-Reminder Emails

Listings expire 30 days after creation. The owner now receives a reminder email ~3 days before expiry
and again on the day of expiry, respecting their email opt-out and never sending the same reminder
twice. This closes the deferred follow-up that [notifications](notifications.md) flagged as unbuilt.

## Behavior

- Two reminders per listing: **"expiră în 3 zile"** and **"expiră astăzi"**. Each fires at most once.
- Recipients are filtered by the existing `email_notifications` opt-out flag on users — opted-out
  owners get nothing.
- Romanian copy with correct comma-below diacritics ș ț; same unsubscribe URL pattern as other emails
  (`/setari/notificari?unsubscribe={userId}`). Template `expiryReminderEmail(...)` lives next to the
  existing templates in `core/src/lib/email.ts`; the links take the config's `frontendBaseUrl`.

## Mechanism (the project's first scheduler)

The project had **no scheduler** before this. Rather than add a dependency (node-cron) or an external
cron, an **in-process interval job** was chosen — consistent with the "npm run dev only, no external
services" constraint.

- `backend/app/src/features/reminders/service.ts` exports `startExpiryReminderJob(ctx)`, which returns a stop function.
- Started by `buildApp(config, { reminders: true })`, which only `server.ts` passes, once the app is ready:
  fires once ~10s after startup, then every 6h via `setInterval`, and stops when the app closes.
- Tests never pass the option, so the suite never spawns the timer (until 2026-11-12 a `NODE_ENV === "test"`
  check did this).
- Each run: `db/listings-store.ts` query (`getDueExpiryReminders`, a `UNION ALL` of the 3-day and same-day
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

- [notifications](notifications.md) — the email infra and opt-out this reuses; previously listed this as unbuilt
- [listing-lifecycle](listing-lifecycle.md) — the 30-day expiry these reminders key off
- [listing](listing.md) — entity gaining the two reminder timestamp columns
