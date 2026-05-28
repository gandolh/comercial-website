import "@fastify/multipart";
import { z } from "zod";
import { AppError, listingImageKey } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

interface ImageResponse {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

const reorderSchema = z.object({
  order: z.array(z.string().min(1)),
});

function toImageResponse(
  row: { id: string; listing_id: string; s3_key: string; position: number },
  publicBaseUrl: string
): ImageResponse {
  const base = publicBaseUrl.replace(/\/$/, "");
  const url = row.s3_key.startsWith("http") ? row.s3_key : `${base}/uploads/${row.s3_key}`;
  return { id: row.id, listing_id: row.listing_id, url, position: row.position };
}

export const registerImagesRoutes: RouteRegistrar = (app, ctx) => {
  // POST /listings/:id/images  (multipart upload — replaces the two-step presign+commit flow)
  app.post<{ Params: { id: string } }>(
    "/listings/:id/images",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = request.userId!;

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
          width: data.fields?.width ? Number((data.fields.width as any).value) : undefined,
          height: data.fields?.height ? Number((data.fields.height as any).value) : undefined,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return reply.code(200).send(toImageResponse(image, ctx.config.publicBaseUrl));
    }
  );

  // PATCH /listings/:id/images/reorder
  app.patch<{ Params: { id: string } }>(
    "/listings/:id/images/reorder",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const userId = request.userId!;

      const body = reorderSchema.parse(request.body);

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

        for (let i = 0; i < body.order.length; i++) {
          await trx
            .updateTable("listing_images")
            .set({ position: -(i + 1) })
            .where("id", "=", body.order[i]!)
            .execute();
        }

        for (let i = 0; i < body.order.length; i++) {
          await trx
            .updateTable("listing_images")
            .set({ position: i })
            .where("id", "=", body.order[i]!)
            .execute();
        }

        return trx
          .selectFrom("listing_images")
          .selectAll()
          .where("listing_id", "=", listingId)
          .orderBy("position", "asc")
          .execute();
      });

      return reply.code(200).send(images.map((img) => toImageResponse(img, ctx.config.publicBaseUrl)));
    }
  );

  // DELETE /listings/:id/images/:image_id
  app.delete<{ Params: { id: string; image_id: string } }>(
    "/listings/:id/images/:image_id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const listingId = request.params.id;
      const imageId = request.params.image_id;
      const userId = request.userId!;

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

      await ctx.db
        .deleteFrom("listing_images")
        .where("id", "=", imageId)
        .execute();

      return reply.code(200).send({});
    }
  );
};
