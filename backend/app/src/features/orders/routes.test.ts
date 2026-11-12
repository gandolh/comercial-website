/**
 * The fake payment flow (the only one since 2026-11-03): an order on a paid listing, the buyer's
 * mark-paid, then the download. The Stripe provider and the payment webhook are gone.
 */
import { describe, it, expect, afterEach } from "vitest";
import { FakePaymentProvider } from "./service.js";
import { startTestApp } from "../../testing/test-app.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

describe("FakePaymentProvider", () => {
  it("returns the local return page marked paid, with the order id", async () => {
    const r = await new FakePaymentProvider().createCheckout({
      orderId: "o1",
      amountRon: 49,
      listingTitle: "X",
      returnUrl: "http://app/comanda",
      cancelUrl: "http://app/anunt",
    });
    expect(r.checkoutUrl).toBe("http://app/comanda?order_id=o1&provider=fake&status=paid");
    expect(r.providerRef).toBe("fake_ref_o1");
  });
});

describe("the fake purchase", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  async function seed() {
    t = await startTestApp();
    await t.ctx.db
      .insertInto("users")
      .values([
        { id: "seller", email: "seller@test.ro", password_hash: "x", email_verified: 1 },
        { id: "buyer", email: "buyer@test.ro", password_hash: "x", email_verified: 1 },
      ])
      .execute();
    await t.ctx.db
      .insertInto("listings")
      .values({
        id: "paid",
        user_id: "seller",
        title: "Pachet plătit",
        description: "Un pachet de test plătit",
        price_ron: 49,
        category: "grafica",
        expires_at: new Date(Date.now() + 86400_000).toISOString(),
        active: 1,
      })
      .execute();
  }

  it("creates an order, lets only the buyer mark it paid, and is idempotent", async () => {
    await seed();
    const created = await t.app.inject({
      method: "POST",
      url: "/orders",
      headers: t.bearer("buyer"),
      payload: {
        listing_id: "paid",
        return_url: "http://localhost:5173/comanda",
        cancel_url: "http://localhost:5173/",
      },
    });
    expect(created.statusCode).toBeLessThan(300);
    const orderId = created.json<{ order: { id: string } }>().order?.id ?? created.json<{ id: string }>().id;
    expect(orderId).toBeTruthy();

    const bySeller = await t.app.inject({
      method: "POST",
      url: `/orders/${orderId}/mark-paid`,
      headers: t.bearer("seller"),
    });
    expect(bySeller.statusCode).toBe(404);
    const paid = await t.app.inject({
      method: "POST",
      url: `/orders/${orderId}/mark-paid`,
      headers: t.bearer("buyer"),
    });
    expect(paid.statusCode).toBe(200);
    const again = await t.app.inject({
      method: "POST",
      url: `/orders/${orderId}/mark-paid`,
      headers: t.bearer("buyer"),
    });
    expect(again.json<{ message: string }>().message).toBe("Already paid");
  });

  it("has no payment webhook any more", async () => {
    await seed();
    const res = await t.app.inject({ method: "POST", url: "/orders/webhook", payload: { order_id: "x", paid: true } });
    expect(res.statusCode).toBe(404);
  });
});
