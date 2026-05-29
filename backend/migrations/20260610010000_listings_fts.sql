-- FTS5 full-text search for listings with Romanian diacritics folding.
-- Uses unicode61 tokenizer with remove_diacritics=2 so that:
--   ș→s, ț→t, ă→a, â→a, î→i (and their uppercase equivalents)
-- This means searching "sablon" finds "șablon", "grafic" finds "grafică", etc.
--
-- The FTS5 virtual table holds listing_id (UNINDEXED — just a reference),
-- title, and description. Triggers keep it in sync with the listings table.

CREATE VIRTUAL TABLE IF NOT EXISTS listings_fts USING fts5(
  listing_id UNINDEXED,
  title,
  description,
  tokenize = 'unicode61 remove_diacritics 2'
);

-- Populate from existing listings
INSERT INTO listings_fts (listing_id, title, description)
SELECT id, title, description FROM listings;

-- Keep FTS table in sync: INSERT
CREATE TRIGGER IF NOT EXISTS listings_fts_insert
AFTER INSERT ON listings
BEGIN
  INSERT INTO listings_fts (listing_id, title, description)
  VALUES (NEW.id, NEW.title, NEW.description);
END;

-- Keep FTS table in sync: UPDATE (delete old, insert new)
CREATE TRIGGER IF NOT EXISTS listings_fts_update
AFTER UPDATE OF title, description ON listings
BEGIN
  DELETE FROM listings_fts WHERE listing_id = OLD.id;
  INSERT INTO listings_fts (listing_id, title, description)
  VALUES (NEW.id, NEW.title, NEW.description);
END;

-- Keep FTS table in sync: DELETE
CREATE TRIGGER IF NOT EXISTS listings_fts_delete
AFTER DELETE ON listings
BEGIN
  DELETE FROM listings_fts WHERE listing_id = OLD.id;
END;
