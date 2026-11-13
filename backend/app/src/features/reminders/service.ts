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
import type { AppContext } from "../../context.js";
import { ListingsRepository } from "../../db/listings-store.js";

const JOB_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const INITIAL_DELAY_MS = 10 * 1000; // 10 seconds after startup

async function runExpiryReminderJob(ctx: AppContext): Promise<void> {
  const repo = new ListingsRepository(ctx.db);

  let due;
  try {
    due = await repo.getDueExpiryReminders();
  } catch (err) {
    ctx.log.error({ err }, "expiry reminders: failed to query the due ones");
    return;
  }

  if (due.length === 0) return;

  ctx.log.info(`expiry reminders: processing ${due.length}`);

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
        baseUrl: ctx.config.frontendBaseUrl,
      });

      await ctx.email.send(msg);

      if (row.reminder_type === "3zile") {
        await repo.markReminder3daySent(row.listing_id);
      } else {
        await repo.markReminderExpirySent(row.listing_id);
      }

      ctx.log.info({ listingId: row.listing_id, reminder: row.reminder_type }, "expiry reminders: sent");
    } catch (err) {
      ctx.log.error({ err, listingId: row.listing_id }, "expiry reminders: failed to send");
    }
  }
}

/**
 * Start the expiry-reminder background job.
 * Fires once after INITIAL_DELAY_MS, then repeats every JOB_INTERVAL_MS.
 * Returns a function that stops it: the app calls it when it closes.
 */
export function startExpiryReminderJob(ctx: AppContext): () => void {
  let interval: NodeJS.Timeout | undefined;
  const timer = setTimeout(() => {
    void runExpiryReminderJob(ctx);

    interval = setInterval(() => {
      void runExpiryReminderJob(ctx);
    }, JOB_INTERVAL_MS);
  }, INITIAL_DELAY_MS);

  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
}
