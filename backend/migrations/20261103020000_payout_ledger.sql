-- The simulated payout ledger (corpus decisions.md → "A fake payout ledger, 2.5% platform fee").
-- Each paid order records the platform fee and the seller's net at the moment it is paid, so changing
-- the rate never touches past orders. Payouts settle at once and move no money (simulated = 1).
ALTER TABLE orders ADD COLUMN platform_fee_ron REAL;
ALTER TABLE orders ADD COLUMN seller_net_ron REAL;

-- Orders paid before the ledger existed get the 2.5% fee, rounded to the ban (half up).
UPDATE orders
SET platform_fee_ron = round(amount_ron * 0.025 + 0.0000001, 2),
    seller_net_ron = amount_ron - round(amount_ron * 0.025 + 0.0000001, 2)
WHERE status = 'paid' AND platform_fee_ron IS NULL;

CREATE TABLE payouts (
    id              TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    seller_user_id  TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_ron      REAL    NOT NULL CHECK (amount_ron > 0),
    request_id      TEXT    NOT NULL UNIQUE,
    simulated       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX payouts_seller_idx ON payouts (seller_user_id, created_at DESC);
