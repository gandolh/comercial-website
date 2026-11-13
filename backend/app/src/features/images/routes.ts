import "@fastify/multipart";
import type { MultipartValue } from "@fastify/multipart";
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/api-error.js";
import { listingImageKey } from "../../lib/storage.js";
import type { AppContext } from "../../context.js";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { requireUserId } from "../../plugins/auth.js";

interface ImageResponse {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

const reorderSchema = z.object({
  order: z.array(z.string().min(1)),
});

const listingParamsSchema = z.object({ id: z.string() });
const imageParamsSchema = z.object({ id: z.string(), image_id: z.string() });

// ─── Reply schemas: output only, separate from the input ones ────────────────

const imageSchema = z.object({
  id: z.string(),
  listing_id: z.string(),
  url: z.string(),
  position: z.number(),
});

function toImageResponse(
  row: { id: string; listing_id: string; s3_key: string; position: number },
  publicBaseUrl: string,
): ImageResponse {
  const base = publicBaseUrl.replace(/\/$/, "");
  const url = row.s3_key.startsWith("http") ? row.s3_key : `${base}/uploads/${row.s3_key}`;
  return { id: row.id, listing_id: row.listing_id, url, position: row.position };
}

export const imagesRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  // POST /listings/:id/images  (multipart upload — replaces the two-step presign+commit flow)
  // The body is multipart, read by request.file(): no body schema.
  app.post(
    "/listings/:id/images",
    { preHandler: app.authenticate, schema: { params: listingParamsSchema, response: { 200: imageSchema } } },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = requireUserId(request);

      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) throw AppError.notFound();
      if (listing.user_id !== userId) throw AppError.forbidden();

      const imageCount = await ctx.db
        .selectFrom("listing_images")
        .select(ctx.db.fn.count<number>("id").as("count"))
        .where("listing_id", "=", listingId)
        .executeTakeFirstOrThrow();

      if (imageCount.count >= 10) {
        throw AppError.validation("maximum 10 images per listing");
      }

      const data = await request.file();
      if (!data) throw AppError.validation("no file provided");

      const contentType = data.mimetype;
      let ext: string;
      if (contentType === "image/jpeg") ext = "jpg";
      else if (contentType === "image/png") ext = "png";
      else if (contentType === "image/webp") ext = "webp";
      else throw AppError.validation("unsupported content type");

      const key = listingImageKey(listingId, ext);
      const dest = path.join(ctx.config.uploadsDir, key);
      await mkdir(path.dirname(dest), { recursive: true });
      await pipeline(data.file, createWriteStream(dest));

      const maxPos = await ctx.db
        .selectFrom("listing_images")
        .select(ctx.db.fn.max<number | null>("position").as("max_pos"))
        .where("listing_id", "=", listingId)
        .executeTakeFirstOrThrow();

      const nextPosition = (maxPos.max_pos ?? -1) + 1;

      const image = await ctx.db
        .insertInto("listing_images")
        .values({
          listing_id: listingId,
          s3_key: key,
          position: nextPosition,
          width: data.fields?.width ? Number((data.fields.width as MultipartValue).value) : undefined,
          height: data.fields?.height ? Number((data.fields.height as MultipartValue).value) : undefined,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return reply.code(200).send(toImageResponse(image, ctx.config.publicBaseUrl));
    },
  );

  // PATCH /listings/:id/images/reorder
  app.patch(
    "/listings/:id/images/reorder",
    {
      preHandler: app.authenticate,
      schema: { params: listingParamsSchema, body: reorderSchema, response: { 200: z.array(imageSchema) } },
    },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = requireUserId(request);

      const body = request.body;

      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) throw AppError.notFound();
      if (listing.user_id !== userId) throw AppError.forbidden();

      const images = await ctx.db.transaction().execute(async (trx) => {
        const existing = await trx
          .selectFrom("listing_images")
          .select(["id"])
          .where("listing_id", "=", listingId)
          .execute();

        const existingIds = new Set(existing.map((r) => r.id));

        for (const id of body.order) {
          if (!existingIds.has(id)) throw AppError.notFound();
        }

        for (const [i, id] of body.order.entries()) {
          await trx
            .updateTable("listing_images")
            .set({ position: -(i + 1) })
            .where("id", "=", id)
            .execute();
        }

        for (const [i, id] of body.order.entries()) {
          await trx.updateTable("listing_images").set({ position: i }).where("id", "=", id).execute();
        }

        return trx
          .selectFrom("listing_images")
          .selectAll()
          .where("listing_id", "=", listingId)
          .orderBy("position", "asc")
          .execute();
      });

      return reply.code(200).send(images.map((img) => toImageResponse(img, ctx.config.publicBaseUrl)));
    },
  );

  // DELETE /listings/:id/images/:image_id
  app.delete(
    "/listings/:id/images/:image_id",
    { preHandler: app.authenticate, schema: { params: imageParamsSchema, response: { 200: z.object({}) } } },
    async (request, reply) => {
      const listingId = request.params.id;
      const imageId = request.params.image_id;
      const userId = requireUserId(request);

      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) throw AppError.notFound();
      if (listing.user_id !== userId) throw AppError.forbidden();

      const image = await ctx.db
        .selectFrom("listing_images")
        .select(["id", "s3_key"])
        .where("id", "=", imageId)
        .where("listing_id", "=", listingId)
        .executeTakeFirst();

      if (!image) throw AppError.notFound();

      await ctx.storage.deleteObject(image.s3_key);

      await ctx.db.deleteFrom("listing_images").where("id", "=", imageId).execute();

      return reply.code(200).send({});
    },
  );
};
