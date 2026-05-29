import { sql } from "kysely";
import type { Db } from "@my-olx/core";

export interface ReviewRow {
  id: string;
  listing_id: string;
  buyer_user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithBuyerRow extends ReviewRow {
  buyer_display_name: string | null;
}

export interface ReviewAggregate {
  rating_avg: number | null;
  rating_count: number;
}

export class ReviewsRepository {
  constructor(private db: Db) {}

  /**
   * Create a new review or update an existing one (upsert by listing + buyer).
   * SQLite does not support ON CONFLICT DO UPDATE with RETURNING in all Kysely
   * dialects, so we use a check + insert/update pattern.
   */
  async upsert(
    listingId: string,
    buyerUserId: string,
    rating: number,
    body: string | null
  ): Promise<ReviewRow> {
    const existing = await this.db
      .selectFrom("reviews")
      .selectAll()
      .where("listing_id", "=", listingId)
      .where("buyer_user_id", "=", buyerUserId)
      .executeTakeFirst();

    if (existing) {
      return (await this.db
        .updateTable("reviews")
        .set({
          rating,
          body,
          updated_at: new Date().toISOString(),
        })
        .where("id", "=", existing.id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ReviewRow;
    }

    return (await this.db
      .insertInto("reviews")
      .values({
        listing_id: listingId,
        buyer_user_id: buyerUserId,
        rating,
        body,
      })
      .returningAll()
      .executeTakeFirstOrThrow()) as unknown as ReviewRow;
  }

  /**
   * List all reviews for a listing, newest first, with buyer display_name joined.
   */
  async listByListing(listingId: string): Promise<ReviewWithBuyerRow[]> {
    const rows = await this.db
      .selectFrom("reviews")
      .innerJoin("users", "reviews.buyer_user_id", "users.id")
      .select([
        "reviews.id",
        "reviews.listing_id",
        "reviews.buyer_user_id",
        "reviews.rating",
        "reviews.body",
        "reviews.created_at",
        "reviews.updated_at",
        "users.display_name as buyer_display_name",
      ])
      .where("reviews.listing_id", "=", listingId)
      .orderBy("reviews.created_at", "desc")
      .execute();

    return rows as unknown as ReviewWithBuyerRow[];
  }

  /**
   * Compute the average rating and count for a listing.
   */
  async getAggregate(listingId: string): Promise<ReviewAggregate> {
    const result = await this.db
      .selectFrom("reviews")
      .select([
        sql<number | null>`AVG(rating)`.as("rating_avg"),
        sql<number>`COUNT(*)`.as("rating_count"),
      ])
      .where("listing_id", "=", listingId)
      .executeTakeFirst();

    return {
      rating_avg: result?.rating_avg ?? null,
      rating_count: Number(result?.rating_count ?? 0),
    };
  }

  /**
   * Get a buyer's existing review for a listing (or undefined if none).
   */
  async getByBuyerAndListing(
    buyerUserId: string,
    listingId: string
  ): Promise<ReviewRow | undefined> {
    return (await this.db
      .selectFrom("reviews")
      .selectAll()
      .where("buyer_user_id", "=", buyerUserId)
      .where("listing_id", "=", listingId)
      .executeTakeFirst()) as unknown as ReviewRow | undefined;
  }

  /**
   * Delete a buyer's review for a listing.
   */
  async deleteByBuyerAndListing(
    buyerUserId: string,
    listingId: string
  ): Promise<void> {
    await this.db
      .deleteFrom("reviews")
      .where("buyer_user_id", "=", buyerUserId)
      .where("listing_id", "=", listingId)
      .execute();
  }
}
