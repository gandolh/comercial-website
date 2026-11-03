-- Sample listings (corpus decisions.md → "Sample listings never expire"): seeded at deploy under seller
-- profiles that cannot sign in, so the public demo is not empty. They never expire; the owner's
-- listings keep the 30-day rule.
ALTER TABLE listings ADD COLUMN is_sample INTEGER NOT NULL DEFAULT 0;
