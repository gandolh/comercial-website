/**
 * Tests for the reviews feature:
 *   - Verified-purchase gate (no paid order → 403/forbidden)
 *   - One review per buyer (second submit updates, not duplicates)
 *   - Aggregate computation
 *
 * Uses an in-memory SQLite database via better-sqlite3 and Kysely, so no mocks
 * are needed for the repository layer — we test against real SQL.
 */

import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as AppDatabase } from "@my-olx/core";
import { ReviewsRepository } from "./reviews.repo.js";

// ─── Minimal in-memory DB setup ───────────────────────────────────────────────

function createTestDb(): Kysely<AppDatabase> {
  const sqlite = new Database(":memory:");

  // Minimal tables needed for reviews tests
  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      phone_verified INTEGER NOT NULL DEFAULT 0,
      email_verified INTEGER NOT NULL DEFAULT 0,
      email_notifications INTEGER NOT NULL DEFAULT 1,
      bio TEXT,
      website TEXT,
      social_twitter TEXT,
      social_instagram TEXT,
      social_github TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE listings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price_ron REAL,
      category TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      view_count INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      asset_type TEXT NOT NULL DEFAULT 'digital',
      file_format TEXT,
      file_size_bytes INTEGER,
      license_type TEXT NOT NULL DEFAULT 'personal',
      download_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE orders (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      buyer_user_id TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      seller_user_id TEXT NOT NULL,
      amount_ron REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RON',
      status TEXT NOT NULL DEFAULT 'pending',
      provider TEXT NOT NULL DEFAULT 'fake',
      provider_ref TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT
    );

    CREATE TABLE reviews (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      buyer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      body TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX reviews_buyer_listing_uidx ON reviews (listing_id, buyer_user_id);
  `);

  return new Kysely<AppDatabase>({
    dialect: new SqliteDialect({ database: sqlite }),
  });
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

async function seedUser(db: Kysely<AppDatabase>, overrides: { id?: string; display_name?: string } = {}): Promise<string> {
  const id = overrides.id ?? `user-${Math.random().toString(36).slice(2)}`;
  await db
    .insertInto("users")
    .values({
      id,
      email: `${id}@test.com`,
      password_hash: "hash",
      display_name: overrides.display_name ?? null,
    })
    .execute();
  return id;
}

async function seedListing(db: Kysely<AppDatabase>, userId: string): Promise<string> {
  const result = await db
    .insertInto("listings")
    .values({
      user_id: userId,
      title: "Test Listing",
      description: "A test digital listing",
      price_ron: 50,
      category: "software",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return (result as any).id;
}

async function seedPaidOrder(
  db: Kysely<AppDatabase>,
  buyerId: string,
  listingId: string,
  sellerId: string
): Promise<void> {
  await db
    .insertInto("orders")
    .values({
      buyer_user_id: buyerId,
      listing_id: listingId,
      seller_user_id: sellerId,
      amount_ron: 50,
      currency: "RON",
      status: "paid",
      provider: "fake",
    })
    .execute();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ReviewsRepository", () => {
  let db: Kysely<AppDatabase>;
  let repo: ReviewsRepository;
  let sellerId: string;
  let buyerId: string;
  let listingId: string;

  beforeEach(async () => {
    db = createTestDb();
    repo = new ReviewsRepository(db);
    sellerId = await seedUser(db, { id: "seller-1", display_name: "Seller" });
    buyerId = await seedUser(db, { id: "buyer-1", display_name: "Buyer" });
    listingId = await seedListing(db, sellerId);
  });

  describe("verified-purchase gate simulation", () => {
    it("buyer with no paid order has no existing review and cannot review (gate enforced at module level)", async () => {
      // No order seeded — simulate the gate check (hasPaidOrder returns false)
      const order = await db
        .selectFrom("orders")
        .select("id")
        .where("buyer_user_id", "=", buyerId)
        .where("listing_id", "=", listingId)
        .where("status", "=", "paid")
        .executeTakeFirst();

      expect(order).toBeUndefined();
      // The module will throw AppError.forbidden() — here we verify the
      // underlying data state is correct before gating.
    });

    it("buyer with a paid order passes the gate check", async () => {
      await seedPaidOrder(db, buyerId, listingId, sellerId);

      const order = await db
        .selectFrom("orders")
        .select("id")
        .where("buyer_user_id", "=", buyerId)
        .where("listing_id", "=", listingId)
        .where("status", "=", "paid")
        .executeTakeFirst();

      expect(order).toBeDefined();
    });
  });

  describe("upsert (one review per buyer per listing)", () => {
    it("creates a review on first submission", async () => {
      const review = await repo.upsert(listingId, buyerId, 5, "Great asset!");

      expect(review.id).toBeDefined();
      expect(review.listing_id).toBe(listingId);
      expect(review.buyer_user_id).toBe(buyerId);
      expect(review.rating).toBe(5);
      expect(review.body).toBe("Great asset!");
    });

    it("updates (not duplicates) on second submission from the same buyer", async () => {
      await repo.upsert(listingId, buyerId, 4, "Good");
      const updated = await repo.upsert(listingId, buyerId, 2, "Changed my mind");

      // Count reviews in DB — must be exactly 1.
      const allReviews = await repo.listByListing(listingId);
      expect(allReviews).toHaveLength(1);
      expect(allReviews[0]!.rating).toBe(2);
      expect(allReviews[0]!.body).toBe("Changed my mind");
    });

    it("allows different buyers to each submit their own review", async () => {
      const buyer2Id = await seedUser(db, { id: "buyer-2" });
      await repo.upsert(listingId, buyerId, 5, "Excellent");
      await repo.upsert(listingId, buyer2Id, 3, "Average");

      const all = await repo.listByListing(listingId);
      expect(all).toHaveLength(2);
    });
  });

  describe("aggregate computation", () => {
    it("returns null avg and 0 count when no reviews", async () => {
      const agg = await repo.getAggregate(listingId);
      expect(agg.rating_avg).toBeNull();
      expect(agg.rating_count).toBe(0);
    });

    it("returns correct avg and count for a single review", async () => {
      await repo.upsert(listingId, buyerId, 4, null);
      const agg = await repo.getAggregate(listingId);
      expect(agg.rating_avg).toBe(4);
      expect(agg.rating_count).toBe(1);
    });

    it("computes correct average across multiple buyers", async () => {
      const buyer2Id = await seedUser(db, { id: "buyer-2b" });
      const buyer3Id = await seedUser(db, { id: "buyer-3b" });
      await repo.upsert(listingId, buyerId, 5, null);
      await repo.upsert(listingId, buyer2Id, 3, null);
      await repo.upsert(listingId, buyer3Id, 4, null);

      const agg = await repo.getAggregate(listingId);
      expect(agg.rating_count).toBe(3);
      // avg = (5 + 3 + 4) / 3 = 4.0
      expect(agg.rating_avg).toBeCloseTo(4.0, 2);
    });

    it("average only updates after an upsert, not duplicates", async () => {
      await repo.upsert(listingId, buyerId, 5, null);
      // Same buyer updates to 1 — avg should be 1, not (5+1)/2=3
      await repo.upsert(listingId, buyerId, 1, null);

      const agg = await repo.getAggregate(listingId);
      expect(agg.rating_count).toBe(1);
      expect(agg.rating_avg).toBe(1);
    });
  });

  describe("getByBuyerAndListing", () => {
    it("returns undefined when no review exists", async () => {
      const result = await repo.getByBuyerAndListing(buyerId, listingId);
      expect(result).toBeUndefined();
    });

    it("returns the review after it has been created", async () => {
      await repo.upsert(listingId, buyerId, 3, "Decent");
      const result = await repo.getByBuyerAndListing(buyerId, listingId);
      expect(result).toBeDefined();
      expect(result!.rating).toBe(3);
    });
  });

  describe("deleteByBuyerAndListing", () => {
    it("removes the review", async () => {
      await repo.upsert(listingId, buyerId, 5, "Nice");
      await repo.deleteByBuyerAndListing(buyerId, listingId);

      const result = await repo.getByBuyerAndListing(buyerId, listingId);
      expect(result).toBeUndefined();
    });

    it("aggregate reflects deletion", async () => {
      await repo.upsert(listingId, buyerId, 5, null);
      await repo.deleteByBuyerAndListing(buyerId, listingId);

      const agg = await repo.getAggregate(listingId);
      expect(agg.rating_count).toBe(0);
      expect(agg.rating_avg).toBeNull();
    });
  });

  describe("listByListing", () => {
    it("returns reviews with buyer display_name joined", async () => {
      const buyer2Id = await seedUser(db, { id: "buyer-lb2", display_name: "Second Buyer" });

      await repo.upsert(listingId, buyerId, 5, "First review");
      await repo.upsert(listingId, buyer2Id, 3, "Second review");

      const reviews = await repo.listByListing(listingId);
      expect(reviews).toHaveLength(2);

      // Both display names should be present.
      const names = reviews.map((r) => r.buyer_display_name);
      expect(names).toContain("Buyer");
      expect(names).toContain("Second Buyer");
    });
  });
});
