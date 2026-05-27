-- Digital-assets migration: evolve the marketplace from physical goods to
-- downloadable digital assets. Additive where possible to preserve the contract.

-- 1. New columns on listings for digital-asset metadata.
ALTER TABLE listings ADD COLUMN asset_type     TEXT   NOT NULL DEFAULT 'file';   -- 'file' for now
ALTER TABLE listings ADD COLUMN file_format    TEXT;                              -- e.g. zip, pdf, psd, mp4
ALTER TABLE listings ADD COLUMN file_size_bytes BIGINT;                           -- total size of primary asset
ALTER TABLE listings ADD COLUMN license_type   TEXT   NOT NULL DEFAULT 'personal'; -- personal | commercial | extended
ALTER TABLE listings ADD COLUMN download_count BIGINT NOT NULL DEFAULT 0;

-- city / is_negotiable are no longer required for digital assets. Keep the
-- columns for contract compatibility but relax NOT NULL on city and give it a
-- default so digital listings can omit it.
ALTER TABLE listings ALTER COLUMN city DROP NOT NULL;
ALTER TABLE listings ALTER COLUMN city SET DEFAULT '';

-- 2. New indexes for digital filters; drop the now-unused city index.
DROP INDEX IF EXISTS listings_city_idx;
CREATE INDEX listings_license_type_idx ON listings (license_type) WHERE active = TRUE;
CREATE INDEX listings_asset_type_idx   ON listings (asset_type)   WHERE active = TRUE;

-- 3. The downloadable files attached to a listing.
CREATE TABLE listing_assets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id        UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key            TEXT NOT NULL,                 -- listings/<id>/assets/<uuid>-<filename>
    original_filename TEXT NOT NULL,
    file_size_bytes   BIGINT NOT NULL,
    content_type      TEXT NOT NULL,
    checksum_sha256   TEXT,
    position          INT NOT NULL,                  -- 0 = primary deliverable
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, position)
);
CREATE INDEX listing_assets_listing_idx ON listing_assets (listing_id, position);

-- 4. Records each download grant (a buyer obtaining the file). Gates re-download
--    and is the foundation for a future purchase/entitlement model.
CREATE TABLE downloads (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id      UUID REFERENCES listing_assets(id) ON DELETE SET NULL,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX downloads_user_idx    ON downloads (user_id, downloaded_at DESC);
CREATE INDEX downloads_listing_idx ON downloads (listing_id);
