import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DbSchema } from "@my-olx/core";
import { ListingsRepository } from "./listings.repo.js";

function createInMemoryDb(): Kysely<DbSchema> {
  const sqlite = new Database(":memory:");

  // Minimal schema: users + listings (with digital-asset columns)
  sqlite.exec(`
    CREATE TABLE users (
      id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT,
      avatar_url    TEXT,
      phone         TEXT,
      phone_verified  INTEGER NOT NULL DEFAULT 0,
      email_verified  INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
      updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
      asset_type    TEXT NOT NULL DEFAULT 'file',
      file_format   TEXT,
      file_size_bytes INTEGER,
      license_type  TEXT NOT NULL DEFAULT 'personal',
      download_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  return new Kysely<DbSchema>({
    dialect: new SqliteDialect({ database: sqlite }),
  });
}

describe("ListingsRepository.getTotalDownloadsForUser", () => {
  let db: Kysely<DbSchema>;
  let repo: ListingsRepository;
  const userId = "user-test-001";
  const otherId = "user-test-002";

  const futureExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const pastExpiry   = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  beforeEach(async () => {
    db = createInMemoryDb();
    repo = new ListingsRepository(db);

    // Insert two users
    await db.insertInto("users")
      .values([
        { id: userId, email: "a@test.com", password_hash: "x" },
        { id: otherId, email: "b@test.com", password_hash: "x" },
      ])
      .execute();
  });

  afterEach(async () => {
    await db.destroy();
  });

  it("returns 0 when user has no listings", async () => {
    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(0);
  });

  it("sums download_count for active non-expired listings", async () => {
    await db.insertInto("listings").values([
      { id: "l1", user_id: userId, title: "A", description: "desc", category: "software", expires_at: futureExpiry, active: 1, download_count: 10 },
      { id: "l2", user_id: userId, title: "B", description: "desc", category: "audio",    expires_at: futureExpiry, active: 1, download_count: 5  },
    ]).execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(15);
  });

  it("excludes inactive listings", async () => {
    await db.insertInto("listings").values([
      { id: "l1", user_id: userId, title: "A", description: "desc", category: "software", expires_at: futureExpiry, active: 1, download_count: 10 },
      { id: "l2", user_id: userId, title: "B", description: "desc", category: "audio",    expires_at: futureExpiry, active: 0, download_count: 99 },
    ]).execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(10);
  });

  it("excludes expired listings", async () => {
    await db.insertInto("listings").values([
      { id: "l1", user_id: userId, title: "A", description: "desc", category: "software", expires_at: futureExpiry, active: 1, download_count: 7 },
      { id: "l2", user_id: userId, title: "B", description: "desc", category: "audio",    expires_at: pastExpiry,   active: 1, download_count: 50 },
    ]).execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(7);
  });

  it("does not include downloads from another user's listings", async () => {
    await db.insertInto("listings").values([
      { id: "l1", user_id: userId,  title: "A", description: "desc", category: "software", expires_at: futureExpiry, active: 1, download_count: 3 },
      { id: "l2", user_id: otherId, title: "B", description: "desc", category: "audio",    expires_at: futureExpiry, active: 1, download_count: 100 },
    ]).execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(3);
  });
});
