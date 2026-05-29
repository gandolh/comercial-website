-- Invoice generator: user invoice profiles + generated invoices.

CREATE TABLE user_invoice_profiles (
    user_id      TEXT    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT,
    cui          TEXT,
    reg_com      TEXT,
    address      TEXT,
    iban         TEXT,
    bank_name    TEXT,
    email        TEXT,
    phone        TEXT,
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE invoices (
    id             TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    series         TEXT    NOT NULL DEFAULT 'FCT',
    number         INTEGER NOT NULL,
    issue_date     TEXT    NOT NULL,
    due_date       TEXT,
    -- Seller / issuer (snapshot at creation)
    seller_name    TEXT    NOT NULL,
    seller_cui     TEXT,
    seller_reg_com TEXT,
    seller_address TEXT,
    seller_iban    TEXT,
    seller_bank    TEXT,
    seller_email   TEXT,
    -- Buyer / client
    buyer_name     TEXT    NOT NULL,
    buyer_cui      TEXT,
    buyer_address  TEXT,
    -- Line items stored as JSON array: [{description,qty,unit_price,vat_rate}]
    line_items     TEXT    NOT NULL DEFAULT '[]',
    currency       TEXT    NOT NULL DEFAULT 'RON',
    subtotal       REAL    NOT NULL DEFAULT 0,
    vat_amount     REAL    NOT NULL DEFAULT 0,
    total          REAL    NOT NULL DEFAULT 0,
    -- Optional reference to a future orders table (no FK — orders table not yet created)
    order_id       INTEGER,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, series, number)
);

CREATE INDEX invoices_user_idx ON invoices (user_id, created_at DESC);
