-- "Sign in with Ward": the Ward subject a user linked from their settings. Ward's ID token carries no
-- email, so a Ward sign-in finds its user by this subject only, never by name or email.
ALTER TABLE users ADD COLUMN ward_subject TEXT;
CREATE UNIQUE INDEX users_ward_subject_idx ON users (ward_subject) WHERE ward_subject IS NOT NULL;
