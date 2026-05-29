-- Drop obsolete columns from the listings table.
-- city and is_negotiable were used in the physical-goods era and are no longer
-- referenced anywhere in the codebase after the digital-assets pivot.

ALTER TABLE listings DROP COLUMN city;
ALTER TABLE listings DROP COLUMN is_negotiable;
