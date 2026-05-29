-- Bundles: allows grouping several existing listings into a "bundle" listing.
-- Purchasing the bundle grants the buyer download access to every child listing's assets.
-- is_bundle is added to listings; bundle_items links bundle->child.

ALTER TABLE listings ADD COLUMN is_bundle INTEGER NOT NULL DEFAULT 0;

CREATE TABLE bundle_items (
    bundle_listing_id  TEXT    NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    child_listing_id   TEXT    NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    position           INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (bundle_listing_id, child_listing_id)
);

CREATE INDEX bundle_items_bundle_idx ON bundle_items (bundle_listing_id, position);
CREATE INDEX bundle_items_child_idx  ON bundle_items (child_listing_id);
