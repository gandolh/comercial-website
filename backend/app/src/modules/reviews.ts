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

import { z } from "zod";
import { AppError } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import type { FastifyInstance } from "fastify";
import { ReviewsRepository } from "../repositories/reviews.repo.js";
import { hasPaidOrder } from "./orders.js";

// ─── Validation schemas ───────────────────────────────────────────────────────

const SubmitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).nullable().optional(),
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

// ─── Route registrar ──────────────────────────────────────────────────────────

export const registerReviewsRoutes: RouteRegistrar = (app, ctx) => {
  const repo = new ReviewsRepository(ctx.db);
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * POST /listings/:id/reviews
   * Create or update the authenticated buyer's review for a listing.
   * Requires a paid order for the listing.
   */
  app.post(
    "/listings/:id/reviews",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      // Verify listing exists
      const listing = await ctx.db
        .selectFrom("listings")
        .select("id")
        .where("id", "=", listingId)
        .executeTakeFirst();
      if (!listing) throw AppError.notFound();

      // Gate: buyer must have a paid order
      const purchased = await hasPaidOrder(ctx, userId, listingId);
      if (!purchased) {
        throw AppError.forbidden();
      }

      const parsed = SubmitReviewSchema.safeParse(request.body);
      if (!parsed.success) throw AppError.validation(parsed.error.message);

      const { rating, body } = parsed.data;

      const review = await repo.upsert(listingId, userId, rating, body ?? null);

      return reply.status(201).send(toReviewResponse(review));
    }
  );

  /**
   * GET /listings/:id/reviews
   * Public — returns the review list and aggregate (avg + count).
   */
  app.get("/listings/:id/reviews", async (request, reply) => {
    const { id: listingId } = request.params as { id: string };

    // Verify listing exists
    const listing = await ctx.db
      .selectFrom("listings")
      .select("id")
      .where("id", "=", listingId)
      .executeTakeFirst();
    if (!listing) throw AppError.notFound();

    const [reviews, aggregate] = await Promise.all([
      repo.listByListing(listingId),
      repo.getAggregate(listingId),
    ]);

    return reply.send({
      reviews: reviews.map(toReviewResponse),
      rating_avg: aggregate.rating_avg !== null ? Number(aggregate.rating_avg.toFixed(2)) : null,
      rating_count: aggregate.rating_count,
    });
  });

  /**
   * DELETE /listings/:id/reviews/mine
   * Remove the authenticated caller's review for a listing.
   * Returns 404 if no review exists.
   */
  app.delete(
    "/listings/:id/reviews/mine",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: listingId } = request.params as { id: string };

      const existing = await repo.getByBuyerAndListing(userId, listingId);
      if (!existing) throw AppError.notFound();

      await repo.deleteByBuyerAndListing(userId, listingId);

      return reply.status(204).send();
    }
  );
};
