import { sql } from "kysely";
import type { Db } from "@my-olx/core";

export interface ListingRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: boolean;
  category: string;
  city: string;
  active: boolean;
  view_count: number;
  expires_at: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  s3_key: string;
  position: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: Date | string;
}

export interface SellerRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  created_at: Date | string;
}

export class ListingsRepository {
  constructor(private db: Db) {}

  /**
   * Create a new listing
   */
  async create(
    userId: string,
    title: string,
    description: string,
    priceRon: number | null,
    isNegotiable: boolean,
    category: string,
    city: string,
    active: boolean
  ): Promise<ListingRow> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await this.db
      .insertInto("listings")
      .values({
        user_id: userId,
        title,
        description,
        price_ron: priceRon,
        is_negotiable: isNegotiable,
        category,
        city,
        active,
        expires_at: expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result as unknown as ListingRow;
  }

  /**
   * Get listing by ID
   */
  async getById(id: string): Promise<ListingRow | undefined> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst()) as unknown as ListingRow | undefined
    );
  }

  /**
   * Update listing (owner only)
   */
  async update(
    id: string,
    title?: string,
    description?: string,
    priceRon?: number | null,
    isNegotiable?: boolean,
    category?: string,
    city?: string
  ): Promise<ListingRow> {
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priceRon !== undefined) updates.price_ron = priceRon;
    if (isNegotiable !== undefined) updates.is_negotiable = isNegotiable;
    if (category !== undefined) updates.category = category;
    if (city !== undefined) updates.city = city;

    return (
      (await this.db
        .updateTable("listings")
        .set(updates)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  /**
   * Delete listing
   */
  async delete(id: string): Promise<void> {
    await this.db.deleteFrom("listings").where("id", "=", id).execute();
  }

  /**
   * Set listing active status
   */
  async setActive(id: string, active: boolean): Promise<ListingRow> {
    return (
      (await this.db
        .updateTable("listings")
        .set({ active })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  /**
   * Set expiry and update timestamp
   */
  async setExpiry(id: string, expiresAt: Date): Promise<ListingRow> {
    return (
      (await this.db
        .updateTable("listings")
        .set({ expires_at: expiresAt })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .updateTable("listings")
      .set({ view_count: sql`view_count + 1` })
      .where("id", "=", id)
      .execute();
  }

  /**
   * Search listings with filters
   * Returns paginated results
   */
  async search(
    q?: string,
    category?: string,
    city?: string,
    priceMin?: number,
    priceMax?: number,
    dateFilter?: "24h" | "saptamana" | "oricand",
    verified?: boolean,
    sort?: "noi" | "pret_asc" | "pret_desc" | "relevanta",
    page: number = 1,
    perPage: number = 12,
    userId?: string,
    active?: boolean
  ): Promise<{ listings: ListingRow[]; total: number }> {
    const perPageClamped = Math.min(Math.max(perPage, 1), 50);
    const pageNumber = Math.max(page, 1);
    const offset = (pageNumber - 1) * perPageClamped;

    let query = this.db.selectFrom("listings").selectAll();

    // Filter by active/expired status
    // If user_id filter is provided, respect the active filter
    // Otherwise, show only active & not-expired
    if (userId) {
      query = query.where("user_id", "=", userId);
      if (active !== undefined) {
        query = query.where("active", "=", active);
      }
    } else {
      query = query
        .where("active", "=", true)
        .where(sql`expires_at > now()`, "=", true);
    }

    // Full-text search
    if (q && q.trim()) {
      query = query.where(
        sql`search_tsv @@ websearch_to_tsquery('simple', ${q})`,
        "=",
        true
      );
    }

    // Category filter
    if (category) {
      query = query.where("category", "=", category);
    }

    // City filter (exact match)
    if (city) {
      query = query.where("city", "=", city);
    }

    // Price range
    if (priceMin !== undefined) {
      query = query.where(sql`price_ron >= ${priceMin}`, "=", true);
    }
    if (priceMax !== undefined) {
      query = query.where(sql`price_ron <= ${priceMax}`, "=", true);
    }

    // Date filter
    if (dateFilter && dateFilter !== "oricand") {
      if (dateFilter === "24h") {
        query = query.where(sql`created_at >= now() - interval '1 day'`, "=", true);
      } else if (dateFilter === "saptamana") {
        query = query.where(sql`created_at >= now() - interval '7 days'`, "=", true);
      }
    }

    // Verified filter (seller's phone_verified)
    if (verified) {
      query = query
        .leftJoin("users", "listings.user_id", "users.id")
        .where("users.phone_verified", "=", true);
    }

    // Sorting
    let sortedQuery = query;
    if (sort === "relevanta" && q && q.trim()) {
      // Use ts_rank for relevance
      sortedQuery = query
        .select(
          sql`ts_rank(search_tsv, websearch_to_tsquery('simple', ${q})) as rank`.as(
            "rank"
          )
        )
        .orderBy(sql`rank`, "desc");
    } else if (sort === "pret_asc") {
      sortedQuery = query.orderBy("price_ron", "asc");
    } else if (sort === "pret_desc") {
      sortedQuery = query.orderBy("price_ron", "desc");
    } else {
      // Default: "noi"
      sortedQuery = query.orderBy("created_at", "desc");
    }

    // Get total count for pagination
    let countQuery: any = this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"));

    if (userId) {
      countQuery = countQuery.where("user_id", "=", userId);
      if (active !== undefined) {
        countQuery = countQuery.where("active", "=", active);
      }
    } else {
      countQuery = countQuery
        .where("active", "=", true)
        .where(sql`expires_at > now()`, "=", true);
    }
    if (category) countQuery = countQuery.where("category", "=", category);
    if (city) countQuery = countQuery.where("city", "=", city);
    if (priceMin !== undefined) {
      countQuery = countQuery.where(sql`price_ron >= ${priceMin}`, "=", true);
    }
    if (priceMax !== undefined) {
      countQuery = countQuery.where(sql`price_ron <= ${priceMax}`, "=", true);
    }
    if (dateFilter && dateFilter !== "oricand") {
      if (dateFilter === "24h") {
        countQuery = countQuery.where(sql`created_at >= now() - interval '1 day'`, "=", true);
      } else if (dateFilter === "saptamana") {
        countQuery = countQuery.where(sql`created_at >= now() - interval '7 days'`, "=", true);
      }
    }
    if (verified) {
      countQuery = countQuery
        .leftJoin("users", "listings.user_id", "users.id")
        .where("users.phone_verified", "=", true);
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = parseInt((countResult as any)?.count ?? "0", 10);

    // Get paginated results
    const listings = (await sortedQuery
      .limit(perPageClamped)
      .offset(offset)
      .execute()) as unknown as ListingRow[];

    return { listings, total };
  }

  /**
   * Get featured listings (limit 8, ordered by seller_verified desc, created_at desc)
   */
  async getFeatured(): Promise<ListingRow[]> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .leftJoin("users", "listings.user_id", "users.id")
        .where("listings.active", "=", true)
        .where(sql`listings.expires_at > now()`, "=", true)
        .orderBy("users.phone_verified", "desc")
        .orderBy("listings.created_at", "desc")
        .limit(8)
        .selectAll("listings")
        .execute()) as unknown as ListingRow[]
    );
  }

  /**
   * Get listings by user (for /users/:id/listings)
   */
  async getByUserId(userId: string, active?: boolean): Promise<ListingRow[]> {
    let query = this.db
      .selectFrom("listings")
      .selectAll()
      .where("user_id", "=", userId);

    if (active !== undefined) {
      query = query.where("active", "=", active);
    }

    return (await query.execute()) as unknown as ListingRow[];
  }

  /**
   * Count active & non-expired listings for a user
   */
  async countActiveListings(userId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where("active", "=", true)
      .where(sql`expires_at > now()`, "=", true)
      .executeTakeFirst();

    return parseInt((result as any)?.count ?? "0", 10);
  }

  /**
   * Count listings created in the last 7 days for a user
   */
  async countWeeklyListings(userId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where(sql`created_at >= now() - interval '7 days'`, "=", true)
      .executeTakeFirst();

    return parseInt((result as any)?.count ?? "0", 10);
  }

  /**
   * Get the oldest listing created in last 7 days for weekly reset
   */
  async getOldestWeeklyListing(userId: string): Promise<Date | null> {
    const result = await this.db
      .selectFrom("listings")
      .select("created_at")
      .where("user_id", "=", userId)
      .where(sql`created_at >= now() - interval '7 days'`, "=", true)
      .orderBy("created_at", "asc")
      .limit(1)
      .executeTakeFirst();

    if (result) {
      const d = new Date(result.created_at as unknown as string | Date);
      d.setDate(d.getDate() + 7);
      return d;
    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Get related listings (same category, excluding self, active & not expired, limit 4)
   */
  async getRelated(listingId: string, category: string): Promise<ListingRow[]> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .where("category", "=", category)
        .where("id", "!=", listingId)
        .where("active", "=", true)
        .where(sql`expires_at > now()`, "=", true)
        .orderBy("created_at", "desc")
        .limit(4)
        .execute()) as unknown as ListingRow[]
    );
  }

  /**
   * Get distinct titles for suggestions (ILIKE q%, limit default 20)
   */
  async getSuggestTitles(q: string, limit: number = 20): Promise<string[]> {
    const results = (await this.db
      .selectFrom("listings")
      .select("title")
      .where("title", "ilike", `${q}%`)
      .distinct()
      .limit(limit)
      .execute()) as Array<{ title: string }>;

    return results.map((r) => r.title);
  }

  /**
   * Get listing images by listing ID
   */
  async getImages(listingId: string): Promise<ListingImageRow[]> {
    return (
      (await this.db
        .selectFrom("listing_images")
        .selectAll()
        .where("listing_id", "=", listingId)
        .orderBy("position", "asc")
        .execute()) as unknown as ListingImageRow[]
    );
  }

  /**
   * Get seller info
   */
  async getSeller(userId: string): Promise<SellerRow | undefined> {
    return (
      (await this.db
        .selectFrom("users")
        .select([
          "id",
          "display_name",
          "avatar_url",
          "phone_verified",
          "created_at",
        ])
        .where("id", "=", userId)
        .executeTakeFirst()) as unknown as SellerRow | undefined
    );
  }
}
