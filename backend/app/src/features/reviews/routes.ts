/**
 * Reviews module — verified-purchase-gated ratings for digital-asset listings.
 *
 * A buyer must have a paid order for a listing before leaving a review.
 * One review per buyer per listing (upsert on re-submit).
 *
 * Endpoints:
 *   POST   /listings/:id/reviews         — create or update caller's review (auth required)
 *   GET    /listings/:id/reviews         — list reviews + aggregate (public)
 *   DELETE /listings/:id/reviews/mine    — delete caller's review (auth required)
 */

import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/api-error.js";
import type { AppContext } from "../../context.js";
import { ReviewsRepository } from "../../db/reviews-store.js";
import { hasPaidOrder } from "../orders/index.js";
import { requireUserId } from "../../plugins/auth.js";

// ─── Validation schemas ───────────────────────────────────────────────────────

const SubmitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).nullable().optional(),
});

const listingParamsSchema = z.object({ id: z.string() });

// ─── Reply schemas: output only, separate from the input ones ────────────────

const reviewSchema = z.object({
  id: z.string(),
  listing_id: z.string(),
  buyer_user_id: z.string(),
  buyer_display_name: z.string().nullable(),
  rating: z.number(),
  body: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const reviewsReplySchema = z.object({
  reviews: z.array(reviewSchema),
  rating_avg: z.number().nullable(),
  rating_count: z.number(),
});

// ─── Response mappers ─────────────────────────────────────────────────────────

function toReviewResponse(row: {
  id: string;
  listing_id: string;
  buyer_user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  updated_at: string;
  buyer_display_name?: string | null;
}) {
  return {
    id: row.id,
    listing_id: row.listing_id,
    buyer_user_id: row.buyer_user_id,
    buyer_display_name: row.buyer_display_name ?? null,
    rating: row.rating,
    body: row.body ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ─── Route plugin ─────────────────────────────────────────────────────────────

export const reviewsRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  const repo = new ReviewsRepository(ctx.db);

  /**
   * POST /listings/:id/reviews
   * Create or update the authenticated buyer's review for a listing.
   * Requires a paid order for the listing.
   */
  app.post(
    "/listings/:id/reviews",
    {
      preHandler: app.authenticate,
      schema: { params: listingParamsSchema, body: SubmitReviewSchema, response: { 201: reviewSchema } },
    },
    async (request, reply) => {
      const userId = requireUserId(request);
      const { id: listingId } = request.params;

      // Verify listing exists
      const listing = await ctx.db.selectFrom("listings").select("id").where("id", "=", listingId).executeTakeFirst();
      if (!listing) throw AppError.notFound();

      // Gate: buyer must have a paid order
      const purchased = await hasPaidOrder(ctx, userId, listingId);
      if (!purchased) {
        throw AppError.forbidden();
      }

      const { rating, body } = request.body;

      const review = await repo.upsert(listingId, userId, rating, body ?? null);

      return reply.status(201).send(toReviewResponse(review));
    },
  );

  /**
   * GET /listings/:id/reviews
   * Public — returns the review list and aggregate (avg + count).
   */
  app.get(
    "/listings/:id/reviews",
    { schema: { params: listingParamsSchema, response: { 200: reviewsReplySchema } } },
    async (request, reply) => {
      const { id: listingId } = request.params;

      // Verify listing exists
      const listing = await ctx.db.selectFrom("listings").select("id").where("id", "=", listingId).executeTakeFirst();
      if (!listing) throw AppError.notFound();

      const [reviews, aggregate] = await Promise.all([repo.listByListing(listingId), repo.getAggregate(listingId)]);

      return reply.send({
        reviews: reviews.map(toReviewResponse),
        rating_avg: aggregate.rating_avg !== null ? Number(aggregate.rating_avg.toFixed(2)) : null,
        rating_count: aggregate.rating_count,
      });
    },
  );

  /**
   * DELETE /listings/:id/reviews/mine
   * Remove the authenticated caller's review for a listing.
   * Returns 404 if no review exists.
   */
  app.delete(
    "/listings/:id/reviews/mine",
    { preHandler: app.authenticate, schema: { params: listingParamsSchema, response: { 204: z.null() } } },
    async (request, reply) => {
      const userId = requireUserId(request);
      const { id: listingId } = request.params;

      const existing = await repo.getByBuyerAndListing(userId, listingId);
      if (!existing) throw AppError.notFound();

      await repo.deleteByBuyerAndListing(userId, listingId);

      reply.code(204);
      return null;
    },
  );
};
