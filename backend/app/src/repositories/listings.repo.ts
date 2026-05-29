import { sql, type SqlBool } from "kysely";
import { CompiledQuery } from "kysely";
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
  /** 0 or 1 — whether this listing is a bundle (added in 20260621030000_bundles.sql). */
  is_bundle: number | boolean;
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

  /**
   * Build an FTS5 MATCH expression from a raw query string.
   * Escapes characters with special meaning in FTS5 expressions.
   * Appends '*' to the last token for prefix matching.
   */
  private buildFtsQuery(rawQ: string): string {
    // Remove characters that have special meaning in FTS5 MATCH syntax
    const sanitized = rawQ.replace(/["'()*^:]/g, " ").trim();
    const tokens = sanitized.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return '""';
    // Wrap each token in double quotes; append '*' to last for prefix matching
    return tokens
      .map((t, i) => (i === tokens.length - 1 ? `"${t}"*` : `"${t}"`))
      .join(" ");
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

    // When a text query is provided, delegate to FTS5-backed search.
    if (q && q.trim()) {
      return this._searchWithFts(
        q.trim(),
        category,
        priceMin,
        priceMax,
        dateFilter,
        verified,
        sort,
        pageNumber,
        perPageClamped,
        offset,
        userId,
        active
      );
    }

    // Filter-only path (no text query): use Kysely query builder.
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

    const countResult = await countQuery.executeTakeFirst();
    const total = parseInt((countResult as any)?.count ?? "0", 10);

    const listings = (await sortedQuery
      .limit(perPageClamped)
      .offset(offset)
      .execute()) as unknown as ListingRow[];

    return { listings, total };
  }

  /**
   * FTS5-backed search.
   *
   * Joins the `listings_fts` virtual table with `listings` (alias `l`) to
   * apply the full-text match and all other filters in a single query.
   * Uses Kysely's `executeQuery(CompiledQuery.raw(...))` to run parameterised
   * raw SQL while keeping the rest of the repository typed.
   *
   * Ordering:
   *   - sort=relevanta (or default when q present): bm25(listings_fts) ASC
   *     (SQLite returns negative BM25; lower value = better match)
   *   - sort=noi: created_at DESC
   *   - sort=pret_asc / pret_desc: price_ron ASC/DESC
   */
  private async _searchWithFts(
    q: string,
    category: string | undefined,
    priceMin: number | undefined,
    priceMax: number | undefined,
    dateFilter: "24h" | "saptamana" | "oricand" | undefined,
    verified: boolean | undefined,
    sort: "noi" | "pret_asc" | "pret_desc" | "relevanta" | undefined,
    _pageNumber: number,
    limit: number,
    offset: number,
    userId: string | undefined,
    active: boolean | undefined
  ): Promise<{ listings: ListingRow[]; total: number }> {
    const ftsMatch = this.buildFtsQuery(q);

    // Collect parameterised extra WHERE conditions on the listings alias `l`.
    const extraConditions: string[] = [];
    const extraParams: unknown[] = [];

    if (userId) {
      extraConditions.push("l.user_id = ?");
      extraParams.push(userId);
      if (active !== undefined) {
        extraConditions.push("l.active = ?");
        extraParams.push(active ? 1 : 0);
      }
    } else {
      extraConditions.push("l.active = 1");
      extraConditions.push("l.expires_at > datetime('now')");
    }

    if (category) {
      extraConditions.push("l.category = ?");
      extraParams.push(category);
    }

    if (priceMin !== undefined) {
      extraConditions.push("l.price_ron >= ?");
      extraParams.push(priceMin);
    }
    if (priceMax !== undefined) {
      extraConditions.push("l.price_ron <= ?");
      extraParams.push(priceMax);
    }

    if (dateFilter && dateFilter !== "oricand") {
      if (dateFilter === "24h") {
        extraConditions.push("l.created_at >= datetime('now', '-1 day')");
      } else if (dateFilter === "saptamana") {
        extraConditions.push("l.created_at >= datetime('now', '-7 days')");
      }
    }

    // Optional JOIN for verified-seller filter
    const verifiedJoin = verified
      ? "INNER JOIN users u ON l.user_id = u.id AND u.phone_verified = 1"
      : "";

    const andExtra =
      extraConditions.length > 0
        ? " AND " + extraConditions.join(" AND ")
        : "";

    let orderBy: string;
    if (sort === "pret_asc") {
      orderBy = "ORDER BY l.price_ron ASC";
    } else if (sort === "pret_desc") {
      orderBy = "ORDER BY l.price_ron DESC";
    } else if (sort === "noi") {
      orderBy = "ORDER BY l.created_at DESC";
    } else {
      // relevanta or default when q is present: BM25 relevance (lower = better)
      orderBy = "ORDER BY bm25(listings_fts) ASC";
    }

    const dataSQL = `
      SELECT l.*
      FROM listings_fts
      INNER JOIN listings l ON listings_fts.listing_id = l.id
      ${verifiedJoin}
      WHERE listings_fts MATCH ?${andExtra}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const countSQL = `
      SELECT count(*) AS count
      FROM listings_fts
      INNER JOIN listings l ON listings_fts.listing_id = l.id
      ${verifiedJoin}
      WHERE listings_fts MATCH ?${andExtra}
    `;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery(
        CompiledQuery.raw(dataSQL, [ftsMatch, ...extraParams, limit, offset])
      ),
      this.db.executeQuery(
        CompiledQuery.raw(countSQL, [ftsMatch, ...extraParams])
      ),
    ]);

    const listings = (dataResult.rows ?? []) as ListingRow[];
    const total = parseInt((countResult.rows?.[0] as any)?.count ?? "0", 10);

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
