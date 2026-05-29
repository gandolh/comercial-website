-- Expiry reminders: track which reminder emails have been sent for a listing.
-- reminder_3day_sent_at: set when the "expires in 3 days" email is sent.
-- reminder_expiry_sent_at: set when the "expires today" email is sent.

ALTER TABLE listings ADD COLUMN reminder_3day_sent_at   TEXT DEFAULT NULL;
ALTER TABLE listings ADD COLUMN reminder_expiry_sent_at TEXT DEFAULT NULL;
