-- Digital-assets migration: evolve the marketplace from physical goods to
-- downloadable digital assets.

ALTER TABLE listings ADD COLUMN asset_type      TEXT    NOT NULL DEFAULT 'file';
ALTER TABLE listings ADD COLUMN file_format     TEXT;
ALTER TABLE listings ADD COLUMN file_size_bytes INTEGER;
ALTER TABLE listings ADD COLUMN license_type    TEXT    NOT NULL DEFAULT 'personal';
ALTER TABLE listings ADD COLUMN download_count  INTEGER NOT NULL DEFAULT 0;

-- SQLite: no partial indexes; use composite indexes instead.
CREATE INDEX listings_license_type_idx ON listings (license_type, active);
CREATE INDEX listings_asset_type_idx   ON listings (asset_type, active);

CREATE TABLE listing_assets (
    id                TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    listing_id        TEXT    NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key            TEXT    NOT NULL,
    original_filename TEXT    NOT NULL,
    file_size_bytes   INTEGER NOT NULL,
    content_type      TEXT    NOT NULL,
    checksum_sha256   TEXT,
    position          INTEGER NOT NULL,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (listing_id, position)
);
CREATE INDEX listing_assets_listing_idx ON listing_assets (listing_id, position);

CREATE TABLE downloads (
    id            TEXT NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    listing_id    TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id      TEXT REFERENCES listing_assets(id) ON DELETE SET NULL,
    downloaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX downloads_user_idx    ON downloads (user_id, downloaded_at DESC);
CREATE INDEX downloads_listing_idx ON downloads (listing_id);
