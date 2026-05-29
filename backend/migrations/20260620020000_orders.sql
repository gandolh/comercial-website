-- Orders: tracks purchase orders for paid digital-asset listings.
-- PSP provider is abstracted behind a PaymentProvider interface.
-- Note: invoices.order_id already has a stub column (no FK) from 20260620010000_invoices.sql.

CREATE TABLE orders (
    id               TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    buyer_user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id       TEXT    NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_user_id   TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_ron       REAL    NOT NULL,
    currency         TEXT    NOT NULL DEFAULT 'RON',
    status           TEXT    NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    provider         TEXT    NOT NULL DEFAULT 'fake',
    provider_ref     TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    paid_at          TEXT
);

CREATE INDEX orders_buyer_idx   ON orders (buyer_user_id, created_at DESC);
CREATE INDEX orders_listing_idx ON orders (listing_id);
CREATE INDEX orders_status_idx  ON orders (status);
