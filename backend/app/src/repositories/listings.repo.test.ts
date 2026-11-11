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
  const pastExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  beforeEach(async () => {
    db = createInMemoryDb();
    repo = new ListingsRepository(db);

    // Insert two users
    await db
      .insertInto("users")
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
    await db
      .insertInto("listings")
      .values([
        {
          id: "l1",
          user_id: userId,
          title: "A",
          description: "desc",
          category: "software",
          expires_at: futureExpiry,
          active: 1,
          download_count: 10,
        },
        {
          id: "l2",
          user_id: userId,
          title: "B",
          description: "desc",
          category: "audio",
          expires_at: futureExpiry,
          active: 1,
          download_count: 5,
        },
      ])
      .execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(15);
  });

  it("excludes inactive listings", async () => {
    await db
      .insertInto("listings")
      .values([
        {
          id: "l1",
          user_id: userId,
          title: "A",
          description: "desc",
          category: "software",
          expires_at: futureExpiry,
          active: 1,
          download_count: 10,
        },
        {
          id: "l2",
          user_id: userId,
          title: "B",
          description: "desc",
          category: "audio",
          expires_at: futureExpiry,
          active: 0,
          download_count: 99,
        },
      ])
      .execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(10);
  });

  it("excludes expired listings", async () => {
    await db
      .insertInto("listings")
      .values([
        {
          id: "l1",
          user_id: userId,
          title: "A",
          description: "desc",
          category: "software",
          expires_at: futureExpiry,
          active: 1,
          download_count: 7,
        },
        {
          id: "l2",
          user_id: userId,
          title: "B",
          description: "desc",
          category: "audio",
          expires_at: pastExpiry,
          active: 1,
          download_count: 50,
        },
      ])
      .execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(7);
  });

  it("does not include downloads from another user's listings", async () => {
    await db
      .insertInto("listings")
      .values([
        {
          id: "l1",
          user_id: userId,
          title: "A",
          description: "desc",
          category: "software",
          expires_at: futureExpiry,
          active: 1,
          download_count: 3,
        },
        {
          id: "l2",
          user_id: otherId,
          title: "B",
          description: "desc",
          category: "audio",
          expires_at: futureExpiry,
          active: 1,
          download_count: 100,
        },
      ])
      .execute();

    const total = await repo.getTotalDownloadsForUser(userId);
    expect(total).toBe(3);
  });
});

describe("ListingsRepository.listByOwner", () => {
  let db: Kysely<DbSchema>;
  let repo: ListingsRepository;
  const me = "owner-1";
  const other = "owner-2";
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  beforeEach(async () => {
    db = createInMemoryDb();
    repo = new ListingsRepository(db);
    await db
      .insertInto("users")
      .values([
        { id: me, email: "me@test.com", password_hash: "x" },
        { id: other, email: "other@test.com", password_hash: "x" },
      ])
      .execute();
    await db
      .insertInto("listings")
      .values([
        {
          id: "live",
          user_id: me,
          title: "Live",
          description: "d",
          category: "software",
          expires_at: future,
          active: 1,
          download_count: 0,
        },
        {
          id: "off",
          user_id: me,
          title: "Off",
          description: "d",
          category: "audio",
          expires_at: future,
          active: 0,
          download_count: 0,
        },
        {
          id: "old",
          user_id: me,
          title: "Old",
          description: "d",
          category: "audio",
          expires_at: past,
          active: 1,
          download_count: 0,
        },
        {
          id: "theirs",
          user_id: other,
          title: "Theirs",
          description: "d",
          category: "audio",
          expires_at: future,
          active: 1,
          download_count: 0,
        },
      ])
      .execute();
  });

  afterEach(async () => {
    await db.destroy();
  });

  const ids = (r: { listings: { id: string }[] }) => r.listings.map((l) => l.id).sort();

  it("lists only the owner's listings, all of them with no filter", async () => {
    const r = await repo.listByOwner(me, {});
    expect(ids(r)).toEqual(["live", "off", "old"]);
    expect(r.total).toBe(3);
  });

  it("splits them into live, switched off and expired", async () => {
    expect(ids(await repo.listByOwner(me, { active: true }))).toEqual(["live"]);
    expect(ids(await repo.listByOwner(me, { active: false }))).toEqual(["off"]);
    expect(ids(await repo.listByOwner(me, { expired: true }))).toEqual(["old"]);
  });

  it("pages, with the total of the whole filter", async () => {
    const r = await repo.listByOwner(me, {}, 2, 2);
    expect(r.listings).toHaveLength(1);
    expect(r.total).toBe(3);
  });
});
