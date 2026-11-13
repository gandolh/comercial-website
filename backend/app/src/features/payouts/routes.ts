/**
 * The simulated payout ledger (corpus decisions.md → *A fake payout ledger, 2.5% platform fee*).
 *
 * - GET  /me/earnings  the seller's balance, totals, recent sales (gross, fee, net) and payouts
 * - POST /me/payouts   { request_id }: pays out the whole available balance at once, simulated (no
 *                      money moves); a repeat with the same request_id returns the same payout, and a
 *                      zero balance is refused
 *
 * Balance = the seller's net on paid orders − what has been paid out.
 */
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { sql } from "kysely";
import { AppError, fixedValidationMessage } from "../../lib/api-error.js";
import type { Kysely } from "kysely";
import type { Database } from "../../db/schema.js";
import type { AppContext } from "../../context.js";
import { PLATFORM_FEE_RATE } from "../../lib/payout-fee.js";
import { requireUserId } from "../../plugins/auth.js";

const PayoutRequestSchema = z.object({ request_id: z.string().min(8).max(100) });

// The replies: output schemas, separate from the input one.
const payoutSchema = z.object({
  id: z.string(),
  amount_ron: z.number(),
  created_at: z.string(),
  simulated: z.boolean(),
});
const earningsSchema = z.object({
  fee_rate: z.number(),
  balance_ron: z.number(),
  gross_ron: z.number(),
  fees_ron: z.number(),
  net_ron: z.number(),
  paid_out_ron: z.number(),
  sales_count: z.number(),
  sales: z.array(
    z.object({
      order_id: z.string(),
      listing_id: z.string(),
      title: z.string(),
      amount_ron: z.number(),
      fee_ron: z.number(),
      net_ron: z.number(),
      paid_at: z.string().nullable(),
    }),
  ),
  payouts: z.array(payoutSchema),
});
const payoutReplySchema = z.object({ payout: payoutSchema });

const money = (v: number | null | undefined) => Math.round((v ?? 0) * 100) / 100;

async function balanceOf(db: Kysely<Database>, sellerId: string): Promise<{ net: number; paidOut: number }> {
  const earned = await db
    .selectFrom("orders")
    .select(sql<number>`coalesce(sum(seller_net_ron), 0)`.as("net"))
    .where("seller_user_id", "=", sellerId)
    .where("status", "=", "paid")
    .executeTakeFirst();
  const paid = await db
    .selectFrom("payouts")
    .select(sql<number>`coalesce(sum(amount_ron), 0)`.as("out"))
    .where("seller_user_id", "=", sellerId)
    .executeTakeFirst();
  return { net: money(earned?.net), paidOut: money(paid?.out) };
}

const toPayout = (p: { id: string; amount_ron: number; created_at: string; simulated: number }) => ({
  id: p.id,
  amount_ron: money(p.amount_ron),
  created_at: p.created_at,
  simulated: Boolean(p.simulated),
});

export const payoutsRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  app.get(
    "/me/earnings",
    { preHandler: app.authenticate, schema: { response: { 200: earningsSchema } } },
    async (request) => {
      const sellerId = requireUserId(request);
      const { net, paidOut } = await balanceOf(ctx.db, sellerId);
      const totals = await ctx.db
        .selectFrom("orders")
        .select([
          sql<number>`coalesce(sum(amount_ron), 0)`.as("gross"),
          sql<number>`coalesce(sum(platform_fee_ron), 0)`.as("fees"),
          sql<number>`count(*)`.as("count"),
        ])
        .where("seller_user_id", "=", sellerId)
        .where("status", "=", "paid")
        .executeTakeFirst();
      const sales = await ctx.db
        .selectFrom("orders")
        .innerJoin("listings", "listings.id", "orders.listing_id")
        .select([
          "orders.id as order_id",
          "orders.listing_id",
          "listings.title",
          "orders.amount_ron",
          "orders.platform_fee_ron",
          "orders.seller_net_ron",
          "orders.paid_at",
        ])
        .where("orders.seller_user_id", "=", sellerId)
        .where("orders.status", "=", "paid")
        .orderBy("orders.paid_at", "desc")
        .limit(20)
        .execute();
      const payouts = await ctx.db
        .selectFrom("payouts")
        .selectAll()
        .where("seller_user_id", "=", sellerId)
        .orderBy("created_at", "desc")
        .limit(20)
        .execute();
      return {
        fee_rate: PLATFORM_FEE_RATE,
        balance_ron: money(net - paidOut),
        gross_ron: money(totals?.gross),
        fees_ron: money(totals?.fees),
        net_ron: net,
        paid_out_ron: paidOut,
        sales_count: Number(totals?.count ?? 0),
        sales: sales.map((s) => ({
          order_id: s.order_id,
          listing_id: s.listing_id,
          title: s.title,
          amount_ron: money(s.amount_ron),
          fee_ron: money(s.platform_fee_ron),
          net_ron: money(s.seller_net_ron),
          paid_at: s.paid_at,
        })),
        payouts: payouts.map(toPayout),
      };
    },
  );

  app.post(
    "/me/payouts",
    {
      preHandler: app.authenticate,
      schema: { body: PayoutRequestSchema, response: { 200: payoutReplySchema, 201: payoutReplySchema } },
      schemaErrorFormatter: fixedValidationMessage("request_id is required"),
    },
    async (request, reply) => {
      const sellerId = requireUserId(request);
      const requestId = request.body.request_id;

      const result = await ctx.db.transaction().execute(async (trx) => {
        const existing = await trx
          .selectFrom("payouts")
          .selectAll()
          .where("request_id", "=", requestId)
          .executeTakeFirst();
        if (existing) {
          if (existing.seller_user_id !== sellerId) throw AppError.conflict("request_id already used");
          return { payout: existing, created: false };
        }
        const { net, paidOut } = await balanceOf(trx, sellerId);
        const amount = money(net - paidOut);
        if (amount <= 0) throw AppError.validation("Nu ai sold disponibil pentru retragere");
        const payout = await trx
          .insertInto("payouts")
          .values({ seller_user_id: sellerId, amount_ron: amount, request_id: requestId })
          .returningAll()
          .executeTakeFirstOrThrow();
        return { payout, created: true };
      });
      return reply.status(result.created ? 201 : 200).send({ payout: toPayout(result.payout) });
    },
  );
};
