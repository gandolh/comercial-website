CREATE TABLE conversations (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    listing_id      TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    last_message_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (listing_id, buyer_id)
);
CREATE INDEX conversations_buyer_idx  ON conversations (buyer_id, last_message_at DESC);
CREATE INDEX conversations_seller_idx ON conversations (seller_id, last_message_at DESC);

CREATE TABLE messages (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body            TEXT NOT NULL,
    read_at         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX messages_conv_created_idx ON messages (conversation_id, created_at ASC);
