import type { AppContext } from "../../context.js";

// ─── PaymentProvider interface ────────────────────────────────────────────────

export interface CheckoutResult {
  /** URL the buyer should be redirected to (for fake: a local return page). */
  checkoutUrl: string;
  /** Provider-side reference/session ID. */
  providerRef: string;
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
}

// ─── FakePaymentProvider (the only provider) ──────────────────────────────────

export class FakePaymentProvider implements PaymentProvider {
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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isFree(priceRon: number | null | undefined): boolean {
  return priceRon == null || priceRon <= 0;
}

export async function hasPaidOrder(ctx: AppContext, userId: string, listingId: string): Promise<boolean> {
  const order = await ctx.db
    .selectFrom("orders")
    .select("id")
    .where("buyer_user_id", "=", userId)
    .where("listing_id", "=", listingId)
    .where("status", "=", "paid")
    .executeTakeFirst();
  return !!order;
}
