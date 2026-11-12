/**
 * Reviews through the API: a paid buyer's review, its schema, and deleting it.
 */
import { describe, it, expect, afterEach } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

describe("a buyer's review", () => {
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
    await t.ctx.db
      .insertInto("orders")
      .values({
        buyer_user_id: "buyer",
        listing_id: "paid",
        seller_user_id: "seller",
        amount_ron: 49,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .execute();
  }

  it("deletes the caller's review with an empty 204, then answers 404", async () => {
    await seed();
    const created = await t.app.inject({
      method: "POST",
      url: "/listings/paid/reviews",
      headers: t.bearer("buyer"),
      payload: { rating: 4, body: "Bun" },
    });
    expect(created.statusCode).toBe(201);
    const removed = await t.app.inject({
      method: "DELETE",
      url: "/listings/paid/reviews/mine",
      headers: t.bearer("buyer"),
    });
    expect([removed.statusCode, removed.body, removed.headers["content-type"]]).toEqual([204, "", undefined]);
    const again = await t.app.inject({
      method: "DELETE",
      url: "/listings/paid/reviews/mine",
      headers: t.bearer("buyer"),
    });
    expect([again.statusCode, again.json()]).toEqual([404, { error: "not found" }]);
  });

  it("answers a rating out of range 422 before the session and purchase checks (validation runs first)", async () => {
    await seed();
    for (const headers of [{}, t.bearer("seller"), t.bearer("buyer")]) {
      const res = await t.app.inject({
        method: "POST",
        url: "/listings/paid/reviews",
        headers,
        payload: { rating: 9 },
      });
      expect([res.statusCode, res.json()]).toEqual([422, { error: "Too big: expected number to be <=5" }]);
    }
    const notBought = await t.app.inject({
      method: "POST",
      url: "/listings/paid/reviews",
      headers: t.bearer("seller"),
      payload: { rating: 5 },
    });
    expect(notBought.statusCode).toBe(403);
  });
});
