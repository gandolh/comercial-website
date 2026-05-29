import { sql, type SqlBool } from "kysely";
import type { Db } from "@my-olx/core";

export interface ListingRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: number | boolean;
  category: string;
  city: string;
  active: number | boolean;
  view_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  asset_type: string;
  file_format: string | null;
  file_size_bytes: number | null;
  license_type: string;
  download_count: number;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  s3_key: string;
  position: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: string;
}

export interface SellerRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: number | boolean;
  created_at: string;
}

export class ListingsRepository {
  constructor(private db: Db) {}

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
        is_negotiable: isNegotiable ? 1 : 0,
        category,
        city,
        active: active ? 1 : 0,
        expires_at: expiresAt.toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result as unknown as ListingRow;
  }

  async getById(id: string): Promise<ListingRow | undefined> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst()) as unknown as ListingRow | undefined
    );
  }

  async update(
    id: string,
    title?: string,
    description?: string,
    priceRon?: number | null,
    isNegotiable?: boolean,
    category?: string,
    city?: string,
    fileFormat?: string,
    fileSizeBytes?: number
  ): Promise<ListingRow> {
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priceRon !== undefined) updates.price_ron = priceRon;
    if (isNegotiable !== undefined) updates.is_negotiable = isNegotiable ? 1 : 0;
    if (category !== undefined) updates.category = category;
    if (city !== undefined) updates.city = city;
    if (fileFormat !== undefined) updates.file_format = fileFormat;
    if (fileSizeBytes !== undefined) updates.file_size_bytes = fileSizeBytes;

    return (
      (await this.db
        .updateTable("listings")
        .set(updates)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom("listings").where("id", "=", id).execute();
  }

  async setActive(id: string, active: boolean): Promise<ListingRow> {
    return (
      (await this.db
        .updateTable("listings")
        .set({ active: active ? 1 : 0 })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  async setExpiry(id: string, expiresAt: Date): Promise<ListingRow> {
    return (
      (await this.db
        .updateTable("listings")
        .set({ expires_at: expiresAt.toISOString() })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()) as unknown as ListingRow
    );
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .updateTable("listings")
      .set({ view_count: sql`view_count + 1` })
      .where("id", "=", id)
      .execute();
  }

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

    if (userId) {
      query = query.where("user_id", "=", userId);
      if (active !== undefined) {
        query = query.where(sql<SqlBool>`active = ${active ? 1 : 0}`);
      }
    } else {
      query = query
        .where(sql<SqlBool>`active = 1`)
        .where(sql<SqlBool>`expires_at > datetime('now')`);
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.where(sql<SqlBool>`(title LIKE ${term} OR description LIKE ${term})`);
    }

    if (category) {
      query = query.where("category", "=", category);
    }

    if (priceMin !== undefined) {
      query = query.where(sql<SqlBool>`price_ron >= ${priceMin}`);
    }
    if (priceMax !== undefined) {
      query = query.where(sql<SqlBool>`price_ron <= ${priceMax}`);
    }

    if (dateFilter && dateFilter !== "oricand") {
      if (dateFilter === "24h") {
        query = query.where(sql<SqlBool>`created_at >= datetime('now', '-1 day')`);
      } else if (dateFilter === "saptamana") {
        query = query.where(sql<SqlBool>`created_at >= datetime('now', '-7 days')`);
      }
    }

    if (verified) {
      query = query
        .leftJoin("users", "listings.user_id", "users.id")
        .where(sql<SqlBool>`users.phone_verified = 1`);
    }

    let sortedQuery = query;
    if (sort === "pret_asc") {
      sortedQuery = query.orderBy("price_ron", "asc");
    } else if (sort === "pret_desc") {
      sortedQuery = query.orderBy("price_ron", "desc");
    } else {
      sortedQuery = query.orderBy("created_at", "desc");
    }

    let countQuery: any = this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"));

    if (userId) {
      countQuery = countQuery.where("user_id", "=", userId);
      if (active !== undefined) {
        countQuery = countQuery.where(sql<SqlBool>`active = ${active ? 1 : 0}`);
      }
    } else {
      countQuery = countQuery
        .where(sql<SqlBool>`active = 1`)
        .where(sql<SqlBool>`expires_at > datetime('now')`);
    }
    if (category) countQuery = countQuery.where("category", "=", category);
    if (priceMin !== undefined) {
      countQuery = countQuery.where(sql<SqlBool>`price_ron >= ${priceMin}`);
    }
    if (priceMax !== undefined) {
      countQuery = countQuery.where(sql<SqlBool>`price_ron <= ${priceMax}`);
    }
    if (dateFilter && dateFilter !== "oricand") {
      if (dateFilter === "24h") {
        countQuery = countQuery.where(sql<SqlBool>`created_at >= datetime('now', '-1 day')`);
      } else if (dateFilter === "saptamana") {
        countQuery = countQuery.where(sql<SqlBool>`created_at >= datetime('now', '-7 days')`);
      }
    }
    if (verified) {
      countQuery = countQuery
        .leftJoin("users", "listings.user_id", "users.id")
        .where(sql<SqlBool>`users.phone_verified = 1`);
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      countQuery = countQuery.where(sql<SqlBool>`(title LIKE ${term} OR description LIKE ${term})`);
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = parseInt((countResult as any)?.count ?? "0", 10);

    const listings = (await sortedQuery
      .limit(perPageClamped)
      .offset(offset)
      .execute()) as unknown as ListingRow[];

    return { listings, total };
  }

  async getFeatured(): Promise<ListingRow[]> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .leftJoin("users", "listings.user_id", "users.id")
        .where(sql<SqlBool>`listings.active = 1`)
        .where(sql<SqlBool>`listings.expires_at > datetime('now')`)
        .orderBy("users.phone_verified", "desc")
        .orderBy("listings.created_at", "desc")
        .limit(8)
        .selectAll("listings")
        .execute()) as unknown as ListingRow[]
    );
  }

  async getByUserId(userId: string, active?: boolean): Promise<ListingRow[]> {
    let query = this.db
      .selectFrom("listings")
      .selectAll()
      .where("user_id", "=", userId);

    if (active !== undefined) {
      query = query.where("active", "=", active ? 1 : 0);
    }

    return (await query.execute()) as unknown as ListingRow[];
  }

  async countActiveListings(userId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where(sql<SqlBool>`active = 1`)
      .where(sql<SqlBool>`expires_at > datetime('now')`)
      .executeTakeFirst();

    return parseInt((result as any)?.count ?? "0", 10);
  }

  async countWeeklyListings(userId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listings")
      .select(sql`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where(sql<SqlBool>`created_at >= datetime('now', '-7 days')`)
      .executeTakeFirst();

    return parseInt((result as any)?.count ?? "0", 10);
  }

  async getOldestWeeklyListing(userId: string): Promise<Date | null> {
    const result = await this.db
      .selectFrom("listings")
      .select("created_at")
      .where("user_id", "=", userId)
      .where(sql<SqlBool>`created_at >= datetime('now', '-7 days')`)
      .orderBy("created_at", "asc")
      .limit(1)
      .executeTakeFirst();

    if (result) {
      const d = new Date(result.created_at as unknown as string);
      d.setDate(d.getDate() + 7);
      return d;
    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  async getRelated(listingId: string, category: string): Promise<ListingRow[]> {
    return (
      (await this.db
        .selectFrom("listings")
        .selectAll()
        .where("category", "=", category)
        .where("id", "!=", listingId)
        .where(sql<SqlBool>`active = 1`)
        .where(sql<SqlBool>`expires_at > datetime('now')`)
        .orderBy("created_at", "desc")
        .limit(4)
        .execute()) as unknown as ListingRow[]
    );
  }

  async getSuggestTitles(q: string, limit: number = 20): Promise<string[]> {
    const results = (await this.db
      .selectFrom("listings")
      .select("title")
      .where("title", "like", `${q}%`)
      .distinct()
      .limit(limit)
      .execute()) as Array<{ title: string }>;

    return results.map((r) => r.title);
  }

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
