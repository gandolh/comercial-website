CREATE TABLE listings (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    price_ron     INTEGER,
    is_negotiable INTEGER NOT NULL DEFAULT 0,
    category      TEXT NOT NULL,
    city          TEXT NOT NULL DEFAULT '',
    active        INTEGER NOT NULL DEFAULT 1,
    view_count    INTEGER NOT NULL DEFAULT 0,
    expires_at    TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX listings_user_id_idx    ON listings (user_id);
CREATE INDEX listings_category_idx   ON listings (category, active);
CREATE INDEX listings_created_at_idx ON listings (created_at DESC, active);
CREATE INDEX listings_expires_at_idx ON listings (expires_at, active);
