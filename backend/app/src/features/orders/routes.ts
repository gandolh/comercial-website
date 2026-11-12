/**
 * Orders module — the buy/pay/download flow for paid listings.
 *
 * Payments are fake (the demo decision of 2026-11-03, corpus decisions.md): `FakePaymentProvider`
 * returns a local return URL, and the buyer's own `POST /orders/:id/mark-paid` marks the order paid.
 * No money moves and there is no payment-provider webhook. The Stripe provider was removed then.
 */

import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError } from "@my-olx/core";
import { splitOrderAmount } from "../../lib/payout-fee.js";
import type { AppContext } from "../../context.js";
import { FakePaymentProvider, isFree } from "./service.js";
import type { CheckoutResult, PaymentProvider } from "./service.js";
import { requireUserId } from "@my-olx/core";

const psp: PaymentProvider = new FakePaymentProvider();

// ─── Validation schemas ───────────────────────────────────────────────────────

const CreateOrderSchema = z.object({
  listing_id: z.string().min(1),
  return_url: z.url().optional(),
  cancel_url: z.url().optional(),
});

const orderParamsSchema = z.object({ id: z.string() });

// ─── Reply schemas: output only, separate from the input one ─────────────────

const orderSchema = z.object({
  id: z.string(),
  buyer_user_id: z.string(),
  listing_id: z.string(),
  seller_user_id: z.string(),
  amount_ron: z.number(),
  currency: z.string(),
  status: z.string(),
  provider: z.string(),
  provider_ref: z.string().nullable(),
  created_at: z.string(),
  paid_at: z.string().nullable(),
});
const checkoutReplySchema = z.object({
  order: orderSchema,
  checkout_url: z.string().nullable(),
  already_paid: z.boolean(),
});
const markPaidReplySchema = z.object({ message: z.string(), order: orderSchema });

// ─── Response mapper ─────────────────────────────────────────────────────────

function toOrderResponse(row: any) {
  return {
    id: row.id,
    buyer_user_id: row.buyer_user_id,
    listing_id: row.listing_id,
    seller_user_id: row.seller_user_id,
    amount_ron: row.amount_ron,
    currency: row.currency,
    status: row.status,
    provider: row.provider,
    provider_ref: row.provider_ref ?? null,
    created_at: row.created_at,
    paid_at: row.paid_at ?? null,
  };
}

// ─── Route plugin ────────────────────────────────────────────────────────────

export const ordersRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  /**
   * POST /orders
   * Create an order for a paid listing and return a checkout URL.
   * Free listings are rejected — callers should check price_ron first.
   */
  app.post(
    "/orders",
    {
      preHandler: app.authenticate,
      schema: { body: CreateOrderSchema, response: { 200: checkoutReplySchema, 201: checkoutReplySchema } },
    },
    async (request, reply) => {
      const userId = requireUserId(request);
      const { listing_id: listingId, return_url, cancel_url } = request.body;

      // Resolve listing
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id", "title", "price_ron", "active"])
        .where("id", "=", listingId)
        .executeTakeFirst();
      if (!listing) throw AppError.notFound();
      if (!listing.active) throw AppError.validation("Anunțul nu este activ");
      if (isFree(listing.price_ron)) {
        throw AppError.validation("Anunțul este gratuit — descărcarea nu necesită plată");
      }
      if (listing.user_id === userId) {
        throw AppError.validation("Nu poți cumpăra propriul anunț");
      }

      // Idempotency: return existing pending/paid order if one exists
      const existingOrder = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("buyer_user_id", "=", userId)
        .where("listing_id", "=", listingId)
        .where("status", "in", ["pending", "paid"])
        .orderBy("created_at", "desc")
        .executeTakeFirst();

      if (existingOrder?.status === "paid") {
        return reply.status(200).send({
          order: toOrderResponse(existingOrder),
          checkout_url: null,
          already_paid: true,
        });
      }

      // Build return/cancel URLs (fallback to config base URL)
      const baseUrl = ctx.config.publicBaseUrl ?? "http://localhost:5173";
      const returnUrl = return_url ?? `${baseUrl}/comenzi/confirmare`;
      const cancelUrl = cancel_url ?? `${baseUrl}/anunturi/${listingId}`;

      // Re-use pending order if fresh (< 30 min)
      let orderId: string;
      if (existingOrder && existingOrder.status === "pending") {
        orderId = existingOrder.id;
      } else {
        // Create a new order row
        const insertResult = await ctx.db
          .insertInto("orders")
          .values({
            buyer_user_id: userId,
            listing_id: listingId,
            seller_user_id: listing.user_id,
            amount_ron: listing.price_ron as number,
            currency: "RON",
            status: "pending",
            provider: psp.name,
          })
          .returning("id")
          .executeTakeFirst();

        if (!insertResult?.id) throw AppError.internal();
        orderId = insertResult.id;
      }

      // Initiate checkout with PSP
      let checkoutResult: CheckoutResult;
      try {
        checkoutResult = await psp.createCheckout({
          orderId,
          amountRon: listing.price_ron as number,
          listingTitle: listing.title,
          returnUrl,
          cancelUrl,
        });
      } catch {
        // Mark order failed and rethrow
        await ctx.db.updateTable("orders").set({ status: "failed" }).where("id", "=", orderId).execute();
        throw AppError.internal();
      }

      // Store provider_ref
      await ctx.db
        .updateTable("orders")
        .set({ provider_ref: checkoutResult.providerRef })
        .where("id", "=", orderId)
        .execute();

      const order = await ctx.db.selectFrom("orders").selectAll().where("id", "=", orderId).executeTakeFirst();

      return reply.status(201).send({
        order: toOrderResponse(order),
        checkout_url: checkoutResult.checkoutUrl,
        already_paid: false,
      });
    },
  );

  /**
   * GET /orders
   * List all orders for the authenticated buyer (most recent first).
   */
  app.get(
    "/orders",
    { preHandler: app.authenticate, schema: { response: { 200: z.array(orderSchema) } } },
    async (request, reply) => {
      const userId = requireUserId(request);
      const rows = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("buyer_user_id", "=", userId)
        .orderBy("created_at", "desc")
        .execute();
      return reply.send(rows.map(toOrderResponse));
    },
  );

  /**
   * GET /orders/:id
   * Get a single order by ID (must belong to authenticated user).
   */
  app.get(
    "/orders/:id",
    { preHandler: app.authenticate, schema: { params: orderParamsSchema, response: { 200: orderSchema } } },
    async (request, reply) => {
      const userId = requireUserId(request);
      const { id } = request.params;
      const order = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("id", "=", id)
        .where("buyer_user_id", "=", userId)
        .executeTakeFirst();
      if (!order) throw AppError.notFound();
      return reply.send(toOrderResponse(order));
    },
  );

  /**
   * POST /orders/:id/mark-paid
   * The fake payment: the buyer marks their own order paid. Protected by JWT (must be the buyer).
   */
  {
    app.post(
      "/orders/:id/mark-paid",
      {
        preHandler: app.authenticate,
        schema: { params: orderParamsSchema, response: { 200: markPaidReplySchema } },
      },
      async (request, reply) => {
        const userId = requireUserId(request);
        const { id } = request.params;

        const order = await ctx.db
          .selectFrom("orders")
          .selectAll()
          .where("id", "=", id)
          .where("buyer_user_id", "=", userId)
          .executeTakeFirst();

        if (!order) throw AppError.notFound();
        if (order.status === "paid") {
          return reply.send({ message: "Already paid", order: toOrderResponse(order) });
        }

        await ctx.db
          .updateTable("orders")
          .set({
            status: "paid",
            paid_at: new Date().toISOString(),
            // The ledger: the fee and the seller's net at the moment of payment.
            platform_fee_ron: splitOrderAmount(order.amount_ron).feeRon,
            seller_net_ron: splitOrderAmount(order.amount_ron).netRon,
          })
          .where("id", "=", id)
          .execute();

        const updated = await ctx.db.selectFrom("orders").selectAll().where("id", "=", id).executeTakeFirst();

        return reply.send({ message: "Marked as paid", order: toOrderResponse(updated) });
      },
    );
  }
};
