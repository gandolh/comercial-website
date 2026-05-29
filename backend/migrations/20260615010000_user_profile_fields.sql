-- Add seller profile fields to the users table.
ALTER TABLE users ADD COLUMN bio              TEXT;
ALTER TABLE users ADD COLUMN website          TEXT;
ALTER TABLE users ADD COLUMN social_twitter   TEXT;
ALTER TABLE users ADD COLUMN social_instagram TEXT;
ALTER TABLE users ADD COLUMN social_github    TEXT;
