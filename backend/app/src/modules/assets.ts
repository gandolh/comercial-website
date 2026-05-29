import "@fastify/multipart";
import { z } from "zod";
import { sql } from "kysely";
import { listingAssetKey, AppError, firstDownloadEmail } from "@my-olx/core";
import type { RouteRegistrar, AppContext } from "../context.js";
import { AssetsRepository } from "../repositories/assets.repo.js";
import { ListingsRepository } from "../repositories/listings.repo.js";
import type { FastifyInstance } from "fastify";
import { pipeline } from "node:stream/promises";
import { createWriteStream, createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Fire-and-forget: notify the listing owner when their asset reaches 1 download.
 * Never throws — a failed email must not break the download response.
 */
async function sendFirstDownloadNotification(
  ctx: AppContext,
  listingId: string,
  downloadCount: number
): Promise<void> {
  if (downloadCount !== 1) return; // only trigger on the very first download

  try {
    const listing = await ctx.db
      .selectFrom("listings")
      .select(["title", "user_id"])
      .where("id", "=", listingId)
      .executeTakeFirst();

    if (!listing) return;

    const owner = await ctx.db
      .selectFrom("users")
      .select(["email", "display_name", "email_notifications"])
      .where("id", "=", listing.user_id)
      .executeTakeFirst();

    if (!owner) return;
    if (!owner.email_notifications) return; // opted out

    const msg = firstDownloadEmail({
      ownerEmail: owner.email,
      ownerName: owner.display_name,
      listingTitle: listing.title,
      listingId,
      downloadCount,
      unsubscribeUserId: listing.user_id,
    });

    await ctx.email.send(msg);
  } catch (err) {
    console.error("[assets] failed to send first-download notification:", err);
  }
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

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts[parts.length - 1]?.toLowerCase() ?? "") : "";
}

export const registerAssetsRoutes: RouteRegistrar = (app, ctx) => {
  const assetsRepo = new AssetsRepository(ctx.db);
  const listingsRepo = new ListingsRepository(ctx.db);
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * POST /listings/:id/assets  (multipart upload)
   * Upload and register a downloadable asset file.
   */
  app.post(
    "/listings/:id/assets",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();
      if (listing.user_id !== userId) throw AppError.forbidden();

      const assetCount = await assetsRepo.countAssetsByListingId(listingId);
      if (assetCount >= 10) throw AppError.validation("Maxim 10 fișiere pe anunț");

      const data = await request.file();
      if (!data) throw AppError.validation("no file provided");

      const originalFilename = data.filename || "file";
      const contentType = data.mimetype || "application/octet-stream";
      const key = listingAssetKey(listingId, originalFilename);
      const dest = path.join(ctx.config.uploadsDir, key);
      await mkdir(path.dirname(dest), { recursive: true });
      await pipeline(data.file, createWriteStream(dest));

      const fileStat = await stat(dest);
      const fileSizeBytes = fileStat.size;

      const maxPos = await assetsRepo.getMaxPositionForListing(listingId);
      const nextPosition = maxPos + 1;

      const asset = await assetsRepo.createAsset(
        listingId,
        key,
        originalFilename,
        fileSizeBytes,
        contentType,
        null,
        nextPosition
      );

      if (nextPosition === 0) {
        const ext = getFileExtension(originalFilename);
        await listingsRepo.update(listingId, undefined, undefined, undefined, undefined, undefined, undefined, ext, fileSizeBytes);
      }

      return reply.send(toAssetResponse(asset));
    }
  );

  /**
   * DELETE /listings/:id/assets/:asset_id
   */
  app.delete(
    "/listings/:id/assets/:asset_id",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId, asset_id: assetId } = request.params as { id: string; asset_id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();
      if (listing.user_id !== userId) throw AppError.forbidden();

      const asset = await assetsRepo.getAssetById(assetId);
      if (!asset || asset.listing_id !== listingId) throw AppError.notFound();

      await ctx.storage.deleteObject(asset.s3_key);
      await assetsRepo.deleteAsset(assetId);

      return reply.send({});
    }
  );

  /**
   * GET /listings/:id/assets  (public — metadata only)
   */
  app.get("/listings/:id/assets", async (request, reply) => {
    const { id: listingId } = request.params as { id: string };

    const listing = await listingsRepo.getById(listingId);
    if (!listing) throw AppError.notFound();

    const assets = await assetsRepo.getAssetsByListingId(listingId);

    return reply.send(assets.map((asset) => ({
      id: asset.id,
      original_filename: asset.original_filename,
      file_size_bytes: asset.file_size_bytes,
      content_type: asset.content_type,
      position: asset.position,
    })));
  });

  /**
   * GET /listings/:id/download  (protected — streams the primary asset file)
   */
  app.get(
    "/listings/:id/download",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const listing = await listingsRepo.getById(listingId);
      if (!listing) throw AppError.notFound();

      const asset = await assetsRepo.getPrimaryAsset(listingId);
      if (!asset) throw AppError.notFound();

      await assetsRepo.recordDownload(listingId, userId, asset.id);
      const updatedListing = await ctx.db
        .updateTable("listings")
        .set({ download_count: sql`download_count + 1` })
        .where("id", "=", listingId)
        .returning("download_count")
        .executeTakeFirst();

      // Notify owner on first download (fire-and-forget)
      const newDownloadCount = updatedListing?.download_count ?? 1;
      void sendFirstDownloadNotification(ctx, listingId, Number(newDownloadCount));

      const filePath = path.join(ctx.config.uploadsDir, asset.s3_key);
      const fileStat = await stat(filePath).catch(() => null);
      if (!fileStat) throw AppError.notFound();

      reply.header("Content-Disposition", `attachment; filename="${asset.original_filename}"`);
      reply.header("Content-Type", asset.content_type);
      reply.header("Content-Length", fileStat.size);

      return reply.send(createReadStream(filePath));
    }
  );
};
