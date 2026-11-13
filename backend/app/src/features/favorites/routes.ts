import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import type { AppContext } from "../../context.js";
import type { Config } from "../../config.js";
import { listingCardSchema } from "../listings/index.js";
import { requireUserId } from "@my-olx/core";

interface ListingCardResponse {
  id: string;
  title: string;
  price_ron: number | null;
  category: string;
  cover_url: string | null;
  seller_verified: boolean;
  posted_at: string;
  active: boolean;
  expires_at: string;
}

function imageUrl(s3Key: string, config: Config): string | null {
  if (!s3Key) return null;
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }
  const base = config.publicBaseUrl.replace(/\/$/, "");
  const key = s3Key.replace(/^\//, "");
  return `${base}/uploads/${key}`;
}

function toDate(val: string | Date): Date {
  return val instanceof Date ? val : new Date(val);
}

function toISOString(val: string | Date): string {
  return toDate(val).toISOString();
}

const favoriteParamsSchema = z.object({ listing_id: z.string() });

// ─── Reply schemas ────────────────────────────────────────────────────────────

const favoriteIdsSchema = z.object({ ids: z.array(z.string()) });

export const favoritesRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  // POST /favorites/:listing_id — add to favorites
  app.post(
    "/favorites/:listing_id",
    { preHandler: app.authenticate, schema: { params: favoriteParamsSchema, response: { 200: z.object({}) } } },
    async (request, reply) => {
      const { listing_id } = request.params;
      const userId = requireUserId(request);

      // Insert with ON CONFLICT DO NOTHING
      await ctx.db
        .insertInto("favorites")
        .values({
          user_id: userId,
          listing_id,
        })
        .onConflict((oc) => oc.doNothing())
        .execute();

      return reply.send({});
    },
  );

  // DELETE /favorites/:listing_id — remove from favorites
  app.delete(
    "/favorites/:listing_id",
    { preHandler: app.authenticate, schema: { params: favoriteParamsSchema, response: { 200: z.object({}) } } },
    async (request, reply) => {
      const { listing_id } = request.params;
      const userId = requireUserId(request);

      await ctx.db.deleteFrom("favorites").where("user_id", "=", userId).where("listing_id", "=", listing_id).execute();

      return reply.send({});
    },
  );

  // GET /me/favorites — list favorited listings as cards
  app.get(
    "/me/favorites",
    { preHandler: app.authenticate, schema: { response: { 200: z.array(listingCardSchema) } } },
    async (request, reply) => {
      const userId = requireUserId(request);

      // Get favorite listing IDs
      const favorites = await ctx.db
        .selectFrom("favorites")
        .select(["listing_id"])
        .where("user_id", "=", userId)
        .execute();

      const favoriteListingIds = favorites.map((f) => f.listing_id);

      if (favoriteListingIds.length === 0) {
        return reply.send([]);
      }

      // Get the listings
      const listings = await ctx.db
        .selectFrom("listings")
        .select(["id", "title", "price_ron", "category", "active", "expires_at", "created_at", "user_id"])
        .where("id", "in", favoriteListingIds)
        .execute();

      // Get cover images
      const coverImages = await ctx.db
        .selectFrom("listing_images")
        .select(["listing_id", "s3_key"])
        .where("position", "=", 0)
        .execute();

      const coverMap = new Map(coverImages.map((img) => [img.listing_id, img.s3_key]));

      // Get seller info for each listing
      const sellerIds = [...new Set(listings.map((l) => l.user_id))];
      const sellers = await ctx.db
        .selectFrom("users")
        .select(["id", "phone_verified"])
        .where("id", "in", sellerIds)
        .execute();

      const sellerMap = new Map(sellers.map((s) => [s.id, s.phone_verified]));

      const response: ListingCardResponse[] = listings.map((l) => ({
        id: l.id,
        title: l.title,
        price_ron: l.price_ron,
        category: l.category,
        cover_url: coverMap.has(l.id) ? imageUrl(coverMap.get(l.id) ?? "", ctx.config) : null,
        seller_verified: Boolean(sellerMap.get(l.user_id)),
        posted_at: toISOString(l.created_at),
        active: Boolean(l.active),
        expires_at: toISOString(l.expires_at),
      }));

      return reply.send(response);
    },
  );

  // GET /me/favorites/ids — list favorite IDs
  app.get(
    "/me/favorites/ids",
    { preHandler: app.authenticate, schema: { response: { 200: favoriteIdsSchema } } },
    async (request, reply) => {
      const userId = requireUserId(request);

      const favorites = await ctx.db
        .selectFrom("favorites")
        .select(["listing_id"])
        .where("user_id", "=", userId)
        .execute();

      return reply.send({
        ids: favorites.map((f) => f.listing_id),
      });
    },
  );
};
