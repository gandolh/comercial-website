import { sql, type SqlBool } from "kysely";
import type { Db } from "@my-olx/core";

export interface ListingAssetRow {
  id: string;
  listing_id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  checksum_sha256: string | null;
  position: number;
  created_at: Date | string;
}

export interface DownloadRow {
  id: string;
  listing_id: string;
  user_id: string;
  asset_id: string | null;
  downloaded_at: Date | string;
}

export class AssetsRepository {
  constructor(private db: Db) {}

  /**
   * Get all assets for a listing, ordered by position
   */
  async getAssetsByListingId(listingId: string): Promise<ListingAssetRow[]> {
    return (await this.db
      .selectFrom("listing_assets")
      .selectAll()
      .where("listing_id", "=", listingId)
      .orderBy("position", "asc")
      .execute()) as unknown as ListingAssetRow[];
  }

  /**
   * Get a single asset by ID
   */
  async getAssetById(assetId: string): Promise<ListingAssetRow | undefined> {
    return (await this.db
      .selectFrom("listing_assets")
      .selectAll()
      .where("id", "=", assetId)
      .executeTakeFirst()) as unknown as ListingAssetRow | undefined;
  }

  /**
   * Create a new asset for a listing
   */
  async createAsset(
    listingId: string,
    s3Key: string,
    originalFilename: string,
    fileSizeBytes: number,
    contentType: string,
    checksumSha256: string | null,
    position: number
  ): Promise<ListingAssetRow> {
    return (await this.db
      .insertInto("listing_assets")
      .values({
        listing_id: listingId,
        s3_key: s3Key,
        original_filename: originalFilename,
        file_size_bytes: fileSizeBytes,
        content_type: contentType,
        checksum_sha256: checksumSha256,
        position,
      })
      .returningAll()
      .executeTakeFirstOrThrow()) as unknown as ListingAssetRow;
  }

  /**
   * Delete an asset by ID
   */
  async deleteAsset(assetId: string): Promise<void> {
    await this.db.deleteFrom("listing_assets").where("id", "=", assetId).execute();
  }

  /**
   * Get the highest position for a listing
   */
  async getMaxPositionForListing(listingId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listing_assets")
      .select(sql<number>`COALESCE(MAX(position), -1)`.as("max_pos"))
      .where("listing_id", "=", listingId)
      .executeTakeFirst();

    return result?.max_pos ?? -1;
  }

  /**
   * Count assets for a listing
   */
  async countAssetsByListingId(listingId: string): Promise<number> {
    const result = await this.db
      .selectFrom("listing_assets")
      .select(sql<number>`COUNT(*)`.as("count"))
      .where("listing_id", "=", listingId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  /**
   * Get the primary asset (position 0) for a listing
   */
  async getPrimaryAsset(listingId: string): Promise<ListingAssetRow | undefined> {
    return (await this.db
      .selectFrom("listing_assets")
      .selectAll()
      .where("listing_id", "=", listingId)
      .where("position", "=", 0)
      .executeTakeFirst()) as unknown as ListingAssetRow | undefined;
  }

  /**
   * Record a download
   */
  async recordDownload(
    listingId: string,
    userId: string,
    assetId: string | null
  ): Promise<DownloadRow> {
    return (await this.db
      .insertInto("downloads")
      .values({
        listing_id: listingId,
        user_id: userId,
        asset_id: assetId,
      })
      .returningAll()
      .executeTakeFirstOrThrow()) as unknown as DownloadRow;
  }

  /**
   * Update listing download count
   */
  async incrementListingDownloadCount(listingId: string): Promise<void> {
    await this.db
      .updateTable("listings")
      .set({ download_count: sql`download_count + 1` })
      .where("id", "=", listingId)
      .execute();
  }
}
