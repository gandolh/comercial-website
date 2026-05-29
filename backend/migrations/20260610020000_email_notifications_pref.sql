-- Add email_notifications preference to users table.
-- INTEGER 0/1, default 1 (opted-in), per SQLite boolean convention.
ALTER TABLE users ADD COLUMN email_notifications INTEGER NOT NULL DEFAULT 1;
