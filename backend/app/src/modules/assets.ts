import { z } from "zod";
import { sql } from "kysely";
import { listingAssetKey, AppError } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import { AssetsRepository } from "../repositories/assets.repo.js";
import { ListingsRepository } from "../repositories/listings.repo.js";
import type { FastifyInstance } from "fastify";

/**
 * Validation schemas
 */
const UploadUrlRequestSchema = z.object({
  content_type: z.string().min(1),
  filename: z.string().min(1),
});

const CreateAssetRequestSchema = z.object({
  s3_key: z.string().min(1),
  original_filename: z.string().min(1),
  file_size_bytes: z.number().int().positive(),
  content_type: z.string().min(1),
  checksum_sha256: z.string().optional(),
});

/**
 * Response types
 */
interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  public_url: string;
}

interface AssetResponse {
  id: string;
  listing_id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
  created_at: string;
}

interface DownloadResponse {
  download_url: string;
  filename: string;
}

/**
 * Helper to extract file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1];
    return ext ? ext.toLowerCase() : "";
  }
  return "";
}

/**
 * Map listing asset row to response
 */
function toAssetResponse(asset: any): AssetResponse {
  const createdAt = typeof asset.created_at === "string"
    ? asset.created_at
    : asset.created_at.toISOString();
  return {
    id: asset.id,
    listing_id: asset.listing_id,
    s3_key: asset.s3_key,
    original_filename: asset.original_filename,
    file_size_bytes: asset.file_size_bytes,
    content_type: asset.content_type,
    position: asset.position,
    created_at: createdAt,
  };
}

export const registerAssetsRoutes: RouteRegistrar = (app, ctx) => {
  const assetsRepo = new AssetsRepository(ctx.db);
  const listingsRepo = new ListingsRepository(ctx.db);
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * POST /listings/:id/assets/upload-url (protected, owner-only)
   * Generate a presigned upload URL for an asset
   */
  app.post(
    "/listings/:id/assets/upload-url",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      const parsed = UploadUrlRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid request body");
      }

      const { content_type, filename } = parsed.data;

      // Check max 10 assets
      const assetCount = await assetsRepo.countAssetsByListingId(listingId);
      if (assetCount >= 10) {
        throw AppError.validation("Maxim 10 fișiere pe anunț");
      }

      // Generate S3 key
      const s3Key = listingAssetKey(listingId, filename);

      // Generate presigned URL
      const uploadUrl = await ctx.storage.presignPut(s3Key, content_type);
      const publicUrl = ctx.storage.publicUrl(s3Key);

      const response: UploadUrlResponse = {
        upload_url: uploadUrl,
        s3_key: s3Key,
        public_url: publicUrl,
      };

      return reply.send(response);
    }
  );

  /**
   * POST /listings/:id/assets (protected, owner-only)
   * Create an asset after file is uploaded to S3
   */
  app.post(
    "/listings/:id/assets",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      const parsed = CreateAssetRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid request body");
      }

      const { s3_key, original_filename, file_size_bytes, content_type, checksum_sha256 } =
        parsed.data;

      // Check max 10 assets
      const assetCount = await assetsRepo.countAssetsByListingId(listingId);
      if (assetCount >= 10) {
        throw AppError.validation("Maxim 10 fișiere pe anunț");
      }

      // Get next position
      const maxPos = await assetsRepo.getMaxPositionForListing(listingId);
      const nextPosition = maxPos + 1;

      // Create asset
      const asset = await assetsRepo.createAsset(
        listingId,
        s3_key,
        original_filename,
        file_size_bytes,
        content_type,
        checksum_sha256 ?? null,
        nextPosition
      );

      // If this is the primary (position 0), update listing file_format and file_size_bytes
      if (nextPosition === 0) {
        const ext = getFileExtension(original_filename);
        await listingsRepo.update(listingId, undefined, undefined, undefined, undefined, undefined, undefined, ext, file_size_bytes);
      }

      return reply.send(toAssetResponse(asset));
    }
  );

  /**
   * DELETE /listings/:id/assets/:asset_id (protected, owner-only)
   * Delete an asset and its S3 object
   */
  app.delete(
    "/listings/:id/assets/:asset_id",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId, asset_id: assetId } = request.params as { id: string; asset_id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      const asset = await assetsRepo.getAssetById(assetId);
      if (!asset || asset.listing_id !== listingId) {
        throw AppError.notFound();
      }

      // Delete from S3
      await ctx.storage.deleteObject(asset.s3_key);

      // Delete from DB
      await assetsRepo.deleteAsset(assetId);

      return reply.send({});
    }
  );

  /**
   * GET /listings/:id/assets (public)
   * Get all assets for a listing (metadata only, no download URLs)
   */
  app.get("/listings/:id/assets", async (request, reply) => {
    const { id: listingId } = request.params as { id: string };

    const listing = await listingsRepo.getById(listingId);
    if (!listing) throw AppError.notFound();

    const assets = await assetsRepo.getAssetsByListingId(listingId);

    const response = assets.map((asset) => ({
      id: asset.id,
      original_filename: asset.original_filename,
      file_size_bytes: asset.file_size_bytes,
      content_type: asset.content_type,
      position: asset.position,
    }));

    return reply.send(response);
  });

  /**
   * GET /listings/:id/download (protected)
   * Download the primary asset (position 0)
   */
  app.get(
    "/listings/:id/download",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();

      // Get primary asset (position 0)
      const asset = await assetsRepo.getPrimaryAsset(listingId);
      if (!asset) {
        throw AppError.notFound();
      }

      // Record download
      await assetsRepo.recordDownload(listingId, userId, asset.id);

      // Increment listing download count
      await ctx.db
        .updateTable("listings")
        .set({ download_count: sql`download_count + 1` })
        .where("id", "=", listingId)
        .execute();

      // Generate presigned download URL (5 min expiry)
      const downloadUrl = await ctx.storage.presignGet(asset.s3_key, 300);

      const response: DownloadResponse = {
        download_url: downloadUrl,
        filename: asset.original_filename,
      };

      return reply.send(response);
    }
  );
};
