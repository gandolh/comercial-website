import { z } from "zod";
import { AppError, listingImageKey } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";

// Helper to build public URL from S3 key
function imageUrl(key: string, config: { s3PublicBaseUrl: string }): string {
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  const baseUrl = config.s3PublicBaseUrl.replace(/\/$/, "");
  const cleanKey = key.replace(/^\//, "");
  return `${baseUrl}/${cleanKey}`;
}

// Response shape for images
interface ImageResponse {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

// Request validation schemas
const uploadUrlSchema = z.object({
  content_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  filename: z.string().min(1),
});

const commitImageSchema = z.object({
  s3_key: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
});

const reorderSchema = z.object({
  order: z.array(z.string().min(1)),
});

// Helper to get file extension from content type
function getExtFromContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new AppError(422, "unsupported content type");
  }
}

// Helper to serialize image row to response
function toImageResponse(row: {
  id: string;
  listing_id: string;
  s3_key: string;
  position: number;
}, config: { s3PublicBaseUrl: string }): ImageResponse {
  return {
    id: row.id,
    listing_id: row.listing_id,
    url: imageUrl(row.s3_key, config),
    position: row.position,
  };
}

export const registerImagesRoutes: RouteRegistrar = (app, ctx) => {
  // POST /listings/:id/images/upload-url
  // Get presigned URL for uploading image to S3
  app.post<{ Params: { id: string } }>(
    "/listings/:id/images/upload-url",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = request.userId!;

      // Validate request body
      const body = uploadUrlSchema.parse(request.body);

      // Check listing exists and belongs to user
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) {
        throw AppError.notFound();
      }

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      // Count existing committed images
      const imageCount = await ctx.db
        .selectFrom("listing_images")
        .select(ctx.db.fn.count<number>("id").as("count"))
        .where("listing_id", "=", listingId)
        .executeTakeFirstOrThrow();

      if (imageCount.count >= 10) {
        throw AppError.validation("maximum 10 images per listing");
      }

      // Get extension from content type
      const ext = getExtFromContentType(body.content_type);

      // Generate S3 key
      const s3Key = listingImageKey(listingId, ext);

      // Get presigned PUT URL
      const uploadUrl = await ctx.storage.presignPut(s3Key, body.content_type);

      // Get public URL
      const publicUrl = imageUrl(s3Key, ctx.config);

      return reply.code(200).send({
        upload_url: uploadUrl,
        s3_key: s3Key,
        public_url: publicUrl,
      });
    },
  );

  // POST /listings/:id/images
  // Commit an image (after upload to S3)
  app.post<{ Params: { id: string } }>(
    "/listings/:id/images",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = request.userId!;

      // Validate request body
      const body = commitImageSchema.parse(request.body);

      // Check listing exists and belongs to user
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) {
        throw AppError.notFound();
      }

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      // Count existing images
      const imageCount = await ctx.db
        .selectFrom("listing_images")
        .select(ctx.db.fn.count<number>("id").as("count"))
        .where("listing_id", "=", listingId)
        .executeTakeFirstOrThrow();

      if (imageCount.count >= 10) {
        throw AppError.validation("maximum 10 images per listing");
      }

      // Get next position (max position + 1, or 0 if none exist)
      const maxPos = await ctx.db
        .selectFrom("listing_images")
        .select(ctx.db.fn.max<number | null>("position").as("max_pos"))
        .where("listing_id", "=", listingId)
        .executeTakeFirstOrThrow();

      const nextPosition = (maxPos.max_pos ?? -1) + 1;

      // Insert image
      const image = await ctx.db
        .insertInto("listing_images")
        .values({
          listing_id: listingId,
          s3_key: body.s3_key,
          position: nextPosition,
          width: body.width,
          height: body.height,
          bytes: body.bytes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return reply.code(200).send(toImageResponse(image, ctx.config));
    },
  );

  // PATCH /listings/:id/images/reorder
  // Reorder images
  app.patch<{ Params: { id: string } }>(
    "/listings/:id/images/reorder",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = request.userId!;

      // Validate request body
      const body = reorderSchema.parse(request.body);

      // Check listing exists and belongs to user
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) {
        throw AppError.notFound();
      }

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      // Use transaction to avoid position conflicts
      const images = await ctx.db.transaction().execute(async (trx) => {
        // First, get all images to verify they exist
        const existing = await trx
          .selectFrom("listing_images")
          .select(["id"])
          .where("listing_id", "=", listingId)
          .execute();

        const existingIds = new Set(existing.map((r) => r.id));

        // Verify all requested IDs exist and belong to this listing
        for (const id of body.order) {
          if (!existingIds.has(id)) {
            throw AppError.notFound();
          }
        }

        // Set all images to negative temp positions first to avoid conflicts
        for (let i = 0; i < body.order.length; i++) {
          await trx
            .updateTable("listing_images")
            .set({ position: -(i + 1) })
            .where("id", "=", body.order[i]!)
            .execute();
        }

        // Now set to final positions
        for (let i = 0; i < body.order.length; i++) {
          await trx
            .updateTable("listing_images")
            .set({ position: i })
            .where("id", "=", body.order[i]!)
            .execute();
        }

        // Fetch all images in order
        return trx
          .selectFrom("listing_images")
          .selectAll()
          .where("listing_id", "=", listingId)
          .orderBy("position", "asc")
          .execute();
      });

      return reply.code(200).send(images.map((img) => toImageResponse(img, ctx.config)));
    },
  );

  // DELETE /listings/:id/images/:image_id
  // Delete an image
  app.delete<{ Params: { id: string; image_id: string } }>(
    "/listings/:id/images/:image_id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id!;
      const imageId = request.params.image_id!;
      const userId = request.userId!;

      // Check listing exists and belongs to user
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) {
        throw AppError.notFound();
      }

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      // Get image to find S3 key
      const image = await ctx.db
        .selectFrom("listing_images")
        .select(["id", "s3_key"])
        .where("id", "=", imageId)
        .where("listing_id", "=", listingId)
        .executeTakeFirst();

      if (!image) {
        throw AppError.notFound();
      }

      // Delete from S3
      await ctx.storage.deleteObject(image.s3_key);

      // Delete from database
      await ctx.db
        .deleteFrom("listing_images")
        .where("id", "=", imageId)
        .execute();

      return reply.code(200).send({});
    },
  );
};
