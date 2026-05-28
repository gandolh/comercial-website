CREATE TABLE listing_images (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    listing_id  TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key      TEXT NOT NULL,
    position    INTEGER NOT NULL,
    width       INTEGER,
    height      INTEGER,
    bytes       INTEGER,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (listing_id, position)
);
CREATE INDEX listing_images_listing_idx ON listing_images (listing_id, position);
