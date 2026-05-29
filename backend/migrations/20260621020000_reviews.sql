-- Reviews: tracks buyer ratings and text reviews for purchased digital-asset listings.
-- Gate: a buyer may only review a listing they have a paid order for.
-- One review per (listing_id, buyer_user_id) pair — enforced via UNIQUE index.

CREATE TABLE reviews (
    id               TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    listing_id       TEXT    NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body             TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- One review per buyer per listing.
CREATE UNIQUE INDEX reviews_buyer_listing_uidx ON reviews (listing_id, buyer_user_id);

-- Efficient fetch of all reviews for a listing (newest first).
CREATE INDEX reviews_listing_idx ON reviews (listing_id, created_at DESC);
