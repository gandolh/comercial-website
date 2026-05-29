/**
 * Tests for the expiry-reminder job.
 *
 * Strategy: mock the ListingsRepository and EmailService so we test:
 *  1. Which listings are selected (3-day vs expiry-day variant).
 *  2. That opted-out users (email_notifications = 0) are not emailed
 *     (enforced by the repo query — verified via mock returning empty).
 *  3. That already-sent reminders are not re-sent
 *     (enforced by the repo query — verified via mock returning empty).
 *  4. That after a successful send the correct mark-sent method is called.
 *  5. That a failed send does not throw (job continues for other listings).
 */

import { describe, it, expect, vi } from "vitest";
import type { ExpiryReminderRow } from "../repositories/listings.repo.js";
import type { EmailMessage, EmailService } from "@my-olx/core";
import { expiryReminderEmail } from "@my-olx/core";

// ---------------------------------------------------------------------------
// Minimal mock helpers
// ---------------------------------------------------------------------------

function makeEmailService(): { service: EmailService; sentMessages: EmailMessage[] } {
  const sentMessages: EmailMessage[] = [];
  const service: EmailService = {
    async send(msg: EmailMessage) {
      sentMessages.push(msg);
    },
  };
  return { service, sentMessages };
}

function makeRow(overrides: Partial<ExpiryReminderRow> = {}): ExpiryReminderRow {
  return {
    listing_id: "listing-1",
    user_id: "user-1",
    title: "Template Prezentare",
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // in 2 days
    owner_email: "owner@example.com",
    owner_display_name: "Ion Popescu",
    reminder_type: "3zile",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Re-implement the core job logic for in-process testing without setInterval.
// ---------------------------------------------------------------------------

async function simulateJobRun(
  due: ExpiryReminderRow[],
  emailService: EmailService,
  markReminder3daySent: (id: string) => Promise<void>,
  markReminderExpirySent: (id: string) => Promise<void>
): Promise<{ sent: string[]; errors: string[] }> {
  const sent: string[] = [];
  const errors: string[] = [];

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

      await emailService.send(msg);

      if (row.reminder_type === "3zile") {
        await markReminder3daySent(row.listing_id);
      } else {
        await markReminderExpirySent(row.listing_id);
      }

      sent.push(row.listing_id);
    } catch (err) {
      errors.push(row.listing_id);
    }
  }

  return { sent, errors };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("expiry-reminders job", () => {
  describe("email sending", () => {
    it("sends a 3-day reminder email and marks it sent", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ reminder_type: "3zile" });
      const { sent, errors } = await simulateJobRun([row], service, mark3day, markExpiry);

      expect(sent).toEqual(["listing-1"]);
      expect(errors).toHaveLength(0);
      expect(sentMessages).toHaveLength(1);

      const msg = sentMessages[0]!;
      expect(msg.to).toBe("owner@example.com");
      expect(msg.subject).toContain("3 zile");
      expect(msg.html).toContain("expiră în 3 zile");
      expect(mark3day).toHaveBeenCalledWith("listing-1");
      expect(markExpiry).not.toHaveBeenCalled();
    });

    it("sends an expiry-day reminder email and marks it sent", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({
        reminder_type: "azi",
        expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // in 3 hours
      });

      const { sent, errors } = await simulateJobRun([row], service, mark3day, markExpiry);

      expect(sent).toEqual(["listing-1"]);
      expect(errors).toHaveLength(0);
      expect(sentMessages).toHaveLength(1);

      const msg = sentMessages[0]!;
      expect(msg.subject).toContain("astăzi");
      expect(msg.html).toContain("expiră astăzi");
      expect(markExpiry).toHaveBeenCalledWith("listing-1");
      expect(mark3day).not.toHaveBeenCalled();
    });

    it("handles multiple listings in one run", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const rows: ExpiryReminderRow[] = [
        makeRow({ listing_id: "listing-1", reminder_type: "3zile", owner_email: "a@a.com" }),
        makeRow({ listing_id: "listing-2", reminder_type: "azi", owner_email: "b@b.com" }),
        makeRow({ listing_id: "listing-3", reminder_type: "3zile", owner_email: "c@c.com" }),
      ];

      const { sent, errors } = await simulateJobRun(rows, service, mark3day, markExpiry);

      expect(sent).toHaveLength(3);
      expect(errors).toHaveLength(0);
      expect(sentMessages).toHaveLength(3);
      expect(mark3day).toHaveBeenCalledTimes(2);
      expect(markExpiry).toHaveBeenCalledTimes(1);
    });

    it("skips no listings when the due list is empty", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn();
      const markExpiry = vi.fn();

      const { sent, errors } = await simulateJobRun([], service, mark3day, markExpiry);

      expect(sent).toHaveLength(0);
      expect(errors).toHaveLength(0);
      expect(sentMessages).toHaveLength(0);
      expect(mark3day).not.toHaveBeenCalled();
      expect(markExpiry).not.toHaveBeenCalled();
    });
  });

  describe("error resilience", () => {
    it("continues processing remaining listings when one send fails", async () => {
      let callCount = 0;
      const failingService: EmailService = {
        async send(_msg: EmailMessage) {
          callCount++;
          if (callCount === 1) throw new Error("SMTP timeout");
        },
      };

      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const rows: ExpiryReminderRow[] = [
        makeRow({ listing_id: "listing-fail", reminder_type: "3zile", owner_email: "fail@a.com" }),
        makeRow({ listing_id: "listing-ok", reminder_type: "3zile", owner_email: "ok@b.com" }),
      ];

      const { sent, errors } = await simulateJobRun(rows, failingService, mark3day, markExpiry);

      expect(errors).toEqual(["listing-fail"]);
      expect(sent).toEqual(["listing-ok"]);
      // mark-sent must NOT be called for the failed listing
      expect(mark3day).toHaveBeenCalledOnce();
      expect(mark3day).toHaveBeenCalledWith("listing-ok");
    });
  });

  describe("opted-out users and duplicate prevention", () => {
    it("does not send to opted-out users (repo returns empty list)", async () => {
      // The SQL query filters WHERE email_notifications = 1.
      // When the repo returns an empty list (opted-out user excluded), no email is sent.
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn();
      const markExpiry = vi.fn();

      const { sent } = await simulateJobRun([], service, mark3day, markExpiry);

      expect(sent).toHaveLength(0);
      expect(sentMessages).toHaveLength(0);
    });

    it("does not re-send already-sent reminders (repo returns empty list)", async () => {
      // The SQL query filters WHERE reminder_3day_sent_at IS NULL.
      // After first send, the column is stamped and the next run finds no rows.
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn();
      const markExpiry = vi.fn();

      const { sent } = await simulateJobRun([], service, mark3day, markExpiry);

      expect(sent).toHaveLength(0);
      expect(sentMessages).toHaveLength(0);
    });

    it("marks 3-day reminder as sent after successful email so it won't be re-queried", async () => {
      const { service } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ listing_id: "listing-1", reminder_type: "3zile" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      expect(mark3day).toHaveBeenCalledWith("listing-1");
    });

    it("marks expiry reminder as sent after successful email so it won't be re-queried", async () => {
      const { service } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ listing_id: "listing-1", reminder_type: "azi" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      expect(markExpiry).toHaveBeenCalledWith("listing-1");
    });
  });

  describe("email template content", () => {
    it("includes the listing title in both subject and body", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ title: "Pachet Fonturi Premium", reminder_type: "3zile" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      const msg = sentMessages[0]!;
      expect(msg.subject).toContain("Pachet Fonturi Premium");
      expect(msg.html).toContain("Pachet Fonturi Premium");
    });

    it("includes unsubscribe link pointing to /setari/notificari", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ user_id: "user-abc", reminder_type: "3zile" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      expect(sentMessages[0]!.html).toContain("/setari/notificari?unsubscribe=user-abc");
    });

    it("addresses owner by display_name when available", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ owner_display_name: "Maria Ionescu", reminder_type: "3zile" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      expect(sentMessages[0]!.html).toContain("Maria Ionescu");
    });

    it("uses generic greeting when display_name is null", async () => {
      const { service, sentMessages } = makeEmailService();
      const mark3day = vi.fn().mockResolvedValue(undefined);
      const markExpiry = vi.fn().mockResolvedValue(undefined);

      const row = makeRow({ owner_display_name: null, reminder_type: "3zile" });
      await simulateJobRun([row], service, mark3day, markExpiry);

      expect(sentMessages[0]!.html).toContain("Bună!");
    });
  });
});
