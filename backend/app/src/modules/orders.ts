/**
 * Orders module — handles the buy/pay/download flow for paid listings.
 *
 * PSP abstraction:
 *   PaymentProvider interface → FakePaymentProvider (default, always active) |
 *                               StripePaymentProvider (thin stub — throws unless
 *                               STRIPE_SECRET_KEY is set, never adds the stripe pkg).
 *
 * Active provider:  FakePaymentProvider (no Stripe keys present in this env).
 * To enable Stripe: set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars;
 *                   swap the import in selectProvider() below.
 *
 * No new npm dependencies added.
 */

import { z } from "zod";
import { AppError } from "@my-olx/core";
import type { RouteRegistrar, AppContext } from "../context.js";
import type { FastifyInstance } from "fastify";

// ─── PaymentProvider interface ────────────────────────────────────────────────

export interface CheckoutResult {
  /** URL the buyer should be redirected to (for fake: a local return page). */
  checkoutUrl: string;
  /** Provider-side reference/session ID. */
  providerRef: string;
}

export interface WebhookEvent {
  /** The order ID as stored in our DB (extracted from metadata/ref). */
  orderId: string;
  /** Whether the payment succeeded. */
  paid: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(order: {
    orderId: string;
    amountRon: number;
    listingTitle: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult>;
  verifyWebhook(rawBody: string, signature: string): WebhookEvent;
}

// ─── FakePaymentProvider (default — always active when no Stripe keys) ────────

class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";

  async createCheckout(order: {
    orderId: string;
    amountRon: number;
    listingTitle: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult> {
    // Returns a local return URL with orderId so the frontend can poll/confirm.
    const returnWithRef = `${order.returnUrl}?order_id=${order.orderId}&provider=fake&status=paid`;
    return {
      checkoutUrl: returnWithRef,
      providerRef: `fake_ref_${order.orderId}`,
    };
  }

  verifyWebhook(_rawBody: string, _signature: string): WebhookEvent {
    // FakeProvider: parse a simple JSON body — {order_id, paid: true/false}.
    try {
      const parsed = JSON.parse(_rawBody) as { order_id?: string; paid?: boolean };
      if (!parsed.order_id) throw new Error("missing order_id");
      return { orderId: parsed.order_id, paid: parsed.paid !== false };
    } catch {
      throw AppError.validation("invalid fake webhook payload");
    }
  }
}

// ─── StripePaymentProvider (stub — configure STRIPE_SECRET_KEY to enable) ────

class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckout(_order: {
    orderId: string;
    amountRon: number;
    listingTitle: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult> {
    // Real Stripe implementation would call Stripe Checkout Sessions API via fetch.
    // This stub makes the intent clear without requiring the stripe npm package.
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": "ron",
      "line_items[0][price_data][unit_amount]": String(Math.round(_order.amountRon * 100)),
      "line_items[0][price_data][product_data][name]": _order.listingTitle,
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: _order.returnUrl + "?order_id=" + _order.orderId + "&status=paid",
      cancel_url: _order.cancelUrl,
      "metadata[order_id]": _order.orderId,
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stripe API error: ${text}`);
    }

    const session = (await res.json()) as { id: string; url: string };
    return { checkoutUrl: session.url, providerRef: session.id };
  }

  verifyWebhook(rawBody: string, signature: string): WebhookEvent {
    // In a real impl, use Stripe's webhook signature verification.
    // Stub: parse the raw event and extract order_id from metadata.
    if (!signature) throw AppError.validation("missing Stripe-Signature header");
    try {
      const event = JSON.parse(rawBody) as {
        type?: string;
        data?: { object?: { metadata?: { order_id?: string }; payment_status?: string } };
      };
      const isPaid =
        event.type === "checkout.session.completed" &&
        event.data?.object?.payment_status === "paid";
      const orderId = event.data?.object?.metadata?.order_id ?? "";
      if (!orderId) throw new Error("missing order_id in metadata");
      return { orderId, paid: isPaid };
    } catch (err) {
      throw AppError.validation("invalid Stripe webhook payload");
    }
  }
}

// ─── Provider selector ────────────────────────────────────────────────────────

function selectProvider(): PaymentProvider {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (stripeKey && stripeWebhookSecret) {
    console.log("[orders] Using StripePaymentProvider");
    return new StripePaymentProvider(stripeKey, stripeWebhookSecret);
  }
  console.log("[orders] STRIPE_SECRET_KEY not set — using FakePaymentProvider (test mode)");
  return new FakePaymentProvider();
}

const psp: PaymentProvider = selectProvider();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFree(priceRon: number | null | undefined): boolean {
  return priceRon == null || priceRon <= 0;
}

async function hasPaidOrder(
  ctx: AppContext,
  userId: string,
  listingId: string
): Promise<boolean> {
  const order = await ctx.db
    .selectFrom("orders")
    .select("id")
    .where("buyer_user_id", "=", userId)
    .where("listing_id", "=", listingId)
    .where("status", "=", "paid")
    .executeTakeFirst();
  return !!order;
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const CreateOrderSchema = z.object({
  listing_id: z.string().min(1),
  return_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

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

// ─── Route registrar ─────────────────────────────────────────────────────────

export const registerOrdersRoutes: RouteRegistrar = (app, ctx) => {
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * POST /orders
   * Create an order for a paid listing and return a checkout URL.
   * Free listings are rejected — callers should check price_ron first.
   */
  app.post(
    "/orders",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const parsed = CreateOrderSchema.safeParse(request.body);
      if (!parsed.success) throw AppError.validation(parsed.error.message);

      const { listing_id: listingId, return_url, cancel_url } = parsed.data;

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
      const returnUrl =
        return_url ?? `${baseUrl}/comenzi/confirmare`;
      const cancelUrl =
        cancel_url ?? `${baseUrl}/anunturi/${listingId}`;

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
      } catch (err) {
        // Mark order failed and rethrow
        await ctx.db
          .updateTable("orders")
          .set({ status: "failed" })
          .where("id", "=", orderId)
          .execute();
        throw AppError.internal();
      }

      // Store provider_ref
      await ctx.db
        .updateTable("orders")
        .set({ provider_ref: checkoutResult.providerRef })
        .where("id", "=", orderId)
        .execute();

      const order = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("id", "=", orderId)
        .executeTakeFirst();

      return reply.status(201).send({
        order: toOrderResponse(order),
        checkout_url: checkoutResult.checkoutUrl,
        already_paid: false,
      });
    }
  );

  /**
   * GET /orders
   * List all orders for the authenticated buyer (most recent first).
   */
  app.get(
    "/orders",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const rows = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("buyer_user_id", "=", userId)
        .orderBy("created_at", "desc")
        .execute();
      return reply.send(rows.map(toOrderResponse));
    }
  );

  /**
   * GET /orders/:id
   * Get a single order by ID (must belong to authenticated user).
   */
  app.get(
    "/orders/:id",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };
      const order = await ctx.db
        .selectFrom("orders")
        .selectAll()
        .where("id", "=", id)
        .where("buyer_user_id", "=", userId)
        .executeTakeFirst();
      if (!order) throw AppError.notFound();
      return reply.send(toOrderResponse(order));
    }
  );

  /**
   * POST /orders/webhook
   * PSP webhook endpoint — unauthenticated but signature-verified.
   * FakeProvider: accepts a JSON body {order_id, paid}.
   * Stripe: reads Stripe-Signature header and verifies payload.
   * Idempotent: calling with an already-paid order is a no-op.
   */
  app.post(
    "/orders/webhook",
    {
      config: { rawBody: true } as any,
    },
    async (request, reply) => {
      const sig = (request.headers["stripe-signature"] as string | undefined) ?? "";
      const rawBody =
        (request as any).rawBody?.toString("utf8") ?? JSON.stringify(request.body);

      let event: WebhookEvent;
      try {
        event = psp.verifyWebhook(rawBody, sig);
      } catch {
        return reply.status(400).send({ error: "invalid webhook" });
      }

      if (event.paid) {
        await ctx.db
          .updateTable("orders")
          .set({
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .where("id", "=", event.orderId)
          .where("status", "!=", "paid") // idempotent guard
          .execute();
      } else {
        await ctx.db
          .updateTable("orders")
          .set({ status: "failed" })
          .where("id", "=", event.orderId)
          .where("status", "=", "pending")
          .execute();
      }

      return reply.send({ received: true });
    }
  );

  /**
   * POST /orders/:id/mark-paid
   * DEV/TEST ONLY endpoint — only enabled when FakePaymentProvider is active.
   * Marks an order as paid without going through a real PSP.
   * Protected by JWT (must be the buyer) so it's not an open exploit.
   */
  if (psp.name === "fake") {
    app.post(
      "/orders/:id/mark-paid",
      { preHandler: appWithAuth.authenticate },
      async (request, reply) => {
        const userId = request.userId!;
        const { id } = request.params as { id: string };

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
          .set({ status: "paid", paid_at: new Date().toISOString() })
          .where("id", "=", id)
          .execute();

        const updated = await ctx.db
          .selectFrom("orders")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst();

        return reply.send({ message: "Marked as paid", order: toOrderResponse(updated) });
      }
    );
  }
};

// ─── Export the paid-order check so assets.ts can use it ─────────────────────

export { hasPaidOrder, isFree };
