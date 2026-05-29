/**
 * Bundles module — manages bundle listings that group several child listings.
 *
 * A "bundle" is a listing with is_bundle=1. Purchasing the bundle grants
 * download access to all child listing assets (enforced in assets.ts via
 * BundlesRepository.hasBundlePurchaseForChild).
 *
 * Endpoints:
 *   POST /listings/:id/bundle-items  (auth, owner only) — set child listing IDs
 *   GET  /listings/:id/bundle-items             (public)  — get child listing cards
 */

import { z } from "zod";
import { AppError } from "@my-olx/core";
import type { RouteRegistrar, AppContext } from "../context.js";
import { BundlesRepository } from "../repositories/bundles.repo.js";
import { ListingsRepository } from "../repositories/listings.repo.js";
import { toListingCardResponse } from "../listings-helpers.js";
import type { FastifyInstance } from "fastify";

// ─── Validation schemas ───────────────────────────────────────────────────────

const SetBundleItemsSchema = z.object({
  child_listing_ids: z
    .array(z.string().min(1))
    .min(1, "Pachetul trebuie să conțină cel puțin un anunț copil")
    .max(50, "Pachetul poate conține cel mult 50 de anunțuri"),
});

// ─── Route registrar ─────────────────────────────────────────────────────────

export const registerBundlesRoutes: RouteRegistrar = (app, ctx) => {
  const bundlesRepo = new BundlesRepository(ctx.db);
  const listingsRepo = new ListingsRepository(ctx.db);
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * POST /listings/:id/bundle-items
   * Set (replace) the child listing IDs for a bundle the caller owns.
   * Marks the parent listing as is_bundle=1.
   * Validates: caller owns the bundle listing; all children exist.
   */
  app.post(
    "/listings/:id/bundle-items",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id: bundleId } = request.params as { id: string };

      const parsed = SetBundleItemsSchema.safeParse(request.body);
      if (!parsed.success) throw AppError.validation(parsed.error.message);

      const { child_listing_ids: childIds } = parsed.data;

      // Verify the bundle listing exists and belongs to the caller.
      const bundle = await listingsRepo.getById(bundleId);
      if (!bundle) throw AppError.notFound();
      if (bundle.user_id !== userId) throw AppError.forbidden();

      // Prevent a listing from being a child of itself.
      if (childIds.includes(bundleId)) {
        throw AppError.validation("Un pachet nu poate conține propriul anunț");
      }

      // Verify all child listings exist.
      const childRows = await Promise.all(
        childIds.map((id) => listingsRepo.getById(id))
      );
      const missingIdx = childRows.findIndex((r) => !r);
      if (missingIdx !== -1) {
        throw AppError.validation(
          `Anunțul copil cu ID-ul '${childIds[missingIdx]}' nu a fost găsit`
        );
      }

      await bundlesRepo.setBundleItems(bundleId, childIds);

      return reply.status(200).send({
        bundle_listing_id: bundleId,
        child_listing_ids: childIds,
      });
    }
  );

  /**
   * GET /listings/:id/bundle-items
   * Public endpoint — returns the child listings as listing cards.
   */
  app.get("/listings/:id/bundle-items", async (request, reply) => {
    const { id: bundleId } = request.params as { id: string };

    // Verify the bundle listing exists.
    const bundle = await listingsRepo.getById(bundleId);
    if (!bundle) throw AppError.notFound();

    const children = await bundlesRepo.getBundleChildren(bundleId);

    // Build card responses (images + seller verification needed for full card).
    const cards = await Promise.all(
      children.map(async (child) => {
        const images = await listingsRepo.getImages(child.id);
        const seller = await listingsRepo.getSeller(child.user_id);
        const sellerVerified = Boolean(seller?.phone_verified);
        return toListingCardResponse(child, images, sellerVerified, ctx.config);
      })
    );

    return reply.send(cards);
  });
};
