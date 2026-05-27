import { z } from "zod";
import { verifyToken } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import { ListingsRepository } from "../repositories/listings.repo.js";
import { AssetsRepository } from "../repositories/assets.repo.js";
import {
  categoryLabel,
  imageUrl,
  toListingCardResponse,
  toListingResponse,
  toListingDetailResponse,
  toSellerSummary,
  type ListingCardResponse,
  type ListingsPageResponse,
  type ListingDetailResponse,
  type SellerSummary,
  type AssetResponse,
} from "../listings-helpers.js";
import { AppError } from "@my-olx/core";
import type { FastifyInstance } from "fastify";

/**
 * Helper: Extract optional user ID from Authorization header
 */
function extractOptionalUserId(authHeader: string | undefined, jwtSecret: string): string | undefined {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authHeader.slice(7);
  try {
    return verifyToken(token, jwtSecret);
  } catch {
    return undefined;
  }
}

/**
 * Validation schemas
 */
const CreateListingRequestSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  price_ron: z.number().int().nullable().optional(),
  is_negotiable: z.boolean().default(true),
  category: z.string().min(1),
  city: z.string().default(""),
  active: z.boolean().default(true),
});

const UpdateListingRequestSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
  price_ron: z.number().int().nullable().optional(),
  is_negotiable: z.boolean().optional(),
  category: z.string().min(1).optional(),
  city: z.string().optional(),
});

const ListingFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  date: z.enum(["24h", "saptamana", "oricand"]).optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["noi", "pret_asc", "pret_desc", "relevanta"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(12),
  user_id: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

const SuggestQuerySchema = z.object({
  q: z.string(),
  limit: z.coerce.number().int().min(1).default(20),
});

export const registerListingsRoutes: RouteRegistrar = (app, ctx) => {
  const repo = new ListingsRepository(ctx.db);
  const assetsRepo = new AssetsRepository(ctx.db);
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * GET /listings — List listings with search/filter
   * Optional auth for personalized results
   */
  app.get("/listings", async (request, reply) => {
    const parsed = ListingFiltersSchema.safeParse(request.query);
    if (!parsed.success) {
      throw AppError.validation("Invalid query parameters");
    }

    const query = parsed.data;
    const optionalUserId = extractOptionalUserId(
      request.headers.authorization,
      ctx.config.jwtSecret
    );

    const { listings, total } = await repo.search(
      query.q,
      query.category,
      query.city,
      query.price_min,
      query.price_max,
      query.date as "24h" | "saptamana" | "oricand" | undefined,
      query.verified,
      query.sort as "noi" | "pret_asc" | "pret_desc" | "relevanta" | undefined,
      query.page,
      query.per_page,
      query.user_id,
      query.active
    );

    const cards: ListingCardResponse[] = [];
    for (const listing of listings) {
      const images = await repo.getImages(listing.id);
      const seller = await repo.getSeller(listing.user_id);
      if (seller) {
        const card = toListingCardResponse(
          listing,
          images,
          seller.phone_verified,
          ctx.config
        );
        cards.push(card);
      }
    }

    const totalPages = Math.ceil(total / query.per_page);
    const response: ListingsPageResponse = {
      listings: cards,
      total_count: total,
      total_pages: totalPages,
      page: query.page,
    };

    return reply.send(response);
  });

  /**
   * POST /listings — Create a new listing (protected)
   */
  app.post("/listings", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;

    const parsed = CreateListingRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      throw AppError.validation("Invalid request body");
    }

    const body = parsed.data;

    // Get user
    const user = await ctx.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) throw AppError.notFound();

    // User must be email verified
    if (!user.email_verified) {
      throw AppError.forbidden();
    }

    // Check weekly limit (5 per week) if active
    if (body.active) {
      const weeklyCount = await repo.countWeeklyListings(userId);
      if (weeklyCount >= 5) {
        throw AppError.rateLimit();
      }
    }

    const listing = await repo.create(
      userId,
      body.title,
      body.description,
      body.price_ron ?? null,
      body.is_negotiable,
      body.category,
      body.city,
      body.active
    );

    return reply.send(toListingResponse(listing));
  });

  /**
   * GET /listings/featured — Featured listings (8, seller_verified desc, created_at desc)
   */
  app.get("/listings/featured", async (request, reply) => {
    const listings = await repo.getFeatured();

    const cards: ListingCardResponse[] = [];
    for (const listing of listings) {
      const images = await repo.getImages(listing.id);
      const seller = await repo.getSeller(listing.user_id);
      if (seller) {
        const card = toListingCardResponse(
          listing,
          images,
          seller.phone_verified,
          ctx.config
        );
        cards.push(card);
      }
    }

    return reply.send(cards);
  });

  /**
   * GET /listings/suggest — Suggest titles
   */
  app.get("/listings/suggest", async (request, reply) => {
    const parsed = SuggestQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw AppError.validation("Invalid query parameters");
    }

    const { q, limit } = parsed.data;
    const suggestions = await repo.getSuggestTitles(q, limit);

    return reply.send(suggestions);
  });

  /**
   * GET /listings/:id — Get listing detail (optional auth)
   */
  app.get("/listings/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const optionalUserId = extractOptionalUserId(
      request.headers.authorization,
      ctx.config.jwtSecret
    );

    const listing = await repo.getById(id);
    if (!listing) {
      throw AppError.notFound();
    }

    // Non-owner cannot see inactive/expired
    if (optionalUserId !== listing.user_id) {
      const expiresAt = typeof listing.expires_at === 'string'
        ? new Date(listing.expires_at)
        : listing.expires_at;
      if (!listing.active || expiresAt <= new Date()) {
        throw AppError.notFound();
      }
    }

    // Increment view count
    await repo.incrementViewCount(id);

    // Get images
    const images = await repo.getImages(id);

    // Get assets
    const assets = await assetsRepo.getAssetsByListingId(id);
    const assetResponses: AssetResponse[] = assets.map((asset) => ({
      id: asset.id,
      original_filename: asset.original_filename,
      file_size_bytes: asset.file_size_bytes,
      content_type: asset.content_type,
      position: asset.position,
    }));

    // Get seller info
    const seller = await repo.getSeller(listing.user_id);
    if (!seller) throw AppError.notFound();

    const activeListingsCount = await repo.countActiveListings(listing.user_id);
    const sellerSummary = toSellerSummary(seller, activeListingsCount, ctx.config);

    const detail = toListingDetailResponse(listing, images, sellerSummary, ctx.config, assetResponses);

    return reply.send(detail);
  });

  /**
   * PATCH /listings/:id — Update listing (protected, owner only)
   */
  app.patch("/listings/:id", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) throw AppError.notFound();

    // Owner only
    if (listing.user_id !== userId) {
      throw AppError.forbidden();
    }

    const parsed = UpdateListingRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      throw AppError.validation("Invalid request body");
    }

    const body = parsed.data;

    const updated = await repo.update(
      id,
      body.title,
      body.description,
      body.price_ron,
      body.is_negotiable,
      body.category,
      body.city
    );

    return reply.send(toListingResponse(updated));
  });

  /**
   * DELETE /listings/:id — Delete listing (protected, owner only)
   */
  app.delete("/listings/:id", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) throw AppError.notFound();

    if (listing.user_id !== userId) {
      throw AppError.forbidden();
    }

    await repo.delete(id);

    return reply.send({});
  });

  /**
   * POST /listings/:id/publish — Publish listing (protected, owner only)
   * Rules: email_verified, ≥1 asset (downloadable file), weekly limit 5, then set active=true
   */
  app.post("/listings/:id/publish", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) throw AppError.notFound();

    if (listing.user_id !== userId) {
      throw AppError.forbidden();
    }

    // Check email verified
    const user = await ctx.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user || !user.email_verified) {
      throw AppError.forbidden();
    }

    // Validate title, description, category
    if (
      listing.title.length < 5 ||
      listing.title.length > 200 ||
      listing.description.length < 10 ||
      !listing.category
    ) {
      throw AppError.validation("Invalid listing data");
    }

    // Check ≥1 asset (downloadable file)
    const assets = await ctx.db
      .selectFrom("listing_assets")
      .selectAll()
      .where("listing_id", "=", id)
      .execute();
    if (assets.length === 0) {
      throw AppError.validation("cel puțin un fișier descărcabil este necesar pentru publicare");
    }

    // Check weekly limit (5)
    const weeklyCount = await repo.countWeeklyListings(userId);
    if (weeklyCount >= 5) {
      throw AppError.rateLimit();
    }

    // Set active=true
    const updated = await repo.setActive(id, true);

    return reply.send(toListingResponse(updated));
  });

  /**
   * POST /listings/:id/renew — Renew listing (protected, owner only, 1/hour rate limit)
   */
  app.post("/listings/:id/renew", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) throw AppError.notFound();

    if (listing.user_id !== userId) {
      throw AppError.forbidden();
    }

    // Check rate limit: if last_renewal > now-1h → 429
    // last_renewal = expires_at - 30 days
    const expiresAtDate = typeof listing.expires_at === 'string'
      ? new Date(listing.expires_at)
      : listing.expires_at;
    const lastRenewalTime = new Date(expiresAtDate);
    lastRenewalTime.setDate(lastRenewalTime.getDate() - 30);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (lastRenewalTime > oneHourAgo) {
      throw AppError.rateLimit();
    }

    // Set expires_at = now + 30 days
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    const updated = await repo.setExpiry(id, newExpiresAt);

    return reply.send(toListingResponse(updated));
  });

  /**
   * POST /listings/:id/deactivate — Deactivate listing (protected, owner only)
   */
  app.post(
    "/listings/:id/deactivate",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };

      const listing = await repo.getById(id);
      if (!listing) throw AppError.notFound();

      if (listing.user_id !== userId) {
        throw AppError.forbidden();
      }

      const updated = await repo.setActive(id, false);

      return reply.send(toListingResponse(updated));
    }
  );

  /**
   * POST /listings/:id/activate — Activate listing (protected, owner only, 409 if expired)
   */
  app.post("/listings/:id/activate", { preHandler: appWithAuth.authenticate }, async (request, reply) => {
    const userId = request.userId!;
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) throw AppError.notFound();

    if (listing.user_id !== userId) {
      throw AppError.forbidden();
    }

    // 409 if expired
    const expiresAtForActivate = typeof listing.expires_at === 'string'
      ? new Date(listing.expires_at)
      : listing.expires_at;
    if (expiresAtForActivate <= new Date()) {
      throw AppError.conflict("listing has expired");
    }

    const updated = await repo.setActive(id, true);

    return reply.send(toListingResponse(updated));
  });

  /**
   * GET /listings/:id/related — Get related listings (4, same category, exclude self, active & not expired)
   */
  app.get("/listings/:id/related", async (request, reply) => {
    const { id } = request.params as { id: string };

    const listing = await repo.getById(id);
    if (!listing) {
      throw AppError.notFound();
    }

    const related = await repo.getRelated(id, listing.category);

    const cards: ListingCardResponse[] = [];
    for (const item of related) {
      const images = await repo.getImages(item.id);
      const seller = await repo.getSeller(item.user_id);
      if (seller) {
        const card = toListingCardResponse(
          item,
          images,
          seller.phone_verified,
          ctx.config
        );
        cards.push(card);
      }
    }

    return reply.send(cards);
  });

  /**
   * GET /listings/:id/seller-phone — Get seller phone (protected, 403 if viewer is owner, 404 if no phone)
   */
  app.get(
    "/listings/:id/seller-phone",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };

      const listing = await repo.getById(id);
      if (!listing) throw AppError.notFound();

      // 403 if viewer is owner
      if (listing.user_id === userId) {
        throw AppError.forbidden();
      }

      // Get seller phone
      const seller = await ctx.db
        .selectFrom("users")
        .select("phone")
        .where("id", "=", listing.user_id)
        .executeTakeFirst();

      if (!seller || !seller.phone) {
        throw AppError.notFound();
      }

      return reply.send({ phone: seller.phone });
    }
  );
};
