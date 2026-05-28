-- SQLite: no native tsvector/full-text-search trigger.
-- Search is handled in the repository layer using LIKE queries.
-- This migration is a no-op kept for ordering continuity.
SELECT 1;
