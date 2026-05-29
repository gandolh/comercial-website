/**
 * Expiry-reminder background job.
 *
 * Runs once shortly after startup and then every 6 hours.
 * Queries listings that are about to expire and emails the owner
 * if they have email_notifications enabled and the reminder has not
 * already been sent.
 *
 * Two reminder variants:
 *   "3zile" — listing expires within 3 days (but not within 24 h)
 *   "azi"   — listing expires within 24 h (today)
 *
 * After a reminder is sent the corresponding `reminder_*_sent_at`
 * column is stamped with `datetime('now')` to prevent duplicates.
 */

import { expiryReminderEmail } from "@my-olx/core";
import type { AppContext } from "../context.js";
import { ListingsRepository } from "../repositories/listings.repo.js";

const JOB_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const INITIAL_DELAY_MS = 10 * 1000;           // 10 seconds after startup

async function runExpiryReminderJob(ctx: AppContext): Promise<void> {
  const repo = new ListingsRepository(ctx.db);

  let due;
  try {
    due = await repo.getDueExpiryReminders();
  } catch (err) {
    console.error("[expiry-reminders] Failed to query due reminders:", err);
    return;
  }

  if (due.length === 0) return;

  console.log(`[expiry-reminders] Processing ${due.length} reminder(s)`);

  for (const row of due) {
    try {
      const msg = expiryReminderEmail({
        ownerEmail: row.owner_email,
        ownerName: row.owner_display_name,
        listingTitle: row.title,
        listingId: row.listing_id,
        expiresAt: row.expires_at,
        variant: row.reminder_type,
        unsubscribeUserId: row.user_id,
      });

      await ctx.email.send(msg);

      if (row.reminder_type === "3zile") {
        await repo.markReminder3daySent(row.listing_id);
      } else {
        await repo.markReminderExpirySent(row.listing_id);
      }

      console.log(
        `[expiry-reminders] Sent ${row.reminder_type} reminder for listing ${row.listing_id} to ${row.owner_email}`
      );
    } catch (err) {
      console.error(
        `[expiry-reminders] Failed to send reminder for listing ${row.listing_id}:`,
        err
      );
    }
  }
}

/**
 * Start the expiry-reminder background job.
 * Fires once after INITIAL_DELAY_MS, then repeats every JOB_INTERVAL_MS.
 * Returns the interval handle so callers can clear it if needed.
 */
export function startExpiryReminderJob(ctx: AppContext): NodeJS.Timeout {
  const timer = setTimeout(() => {
    void runExpiryReminderJob(ctx);

    setInterval(() => {
      void runExpiryReminderJob(ctx);
    }, JOB_INTERVAL_MS);
  }, INITIAL_DELAY_MS);

  return timer;
}
