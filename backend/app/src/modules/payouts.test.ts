import { describe, it, expect, afterEach } from "vitest";
import { splitOrderAmount, PLATFORM_FEE_RATE } from "../payout-fee.js";
import { startTestApp } from "../test-app.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

describe("the platform fee", () => {
  it("is 2.5%, rounded to the ban half up", () => {
    expect(PLATFORM_FEE_RATE).toBe(0.025);
    expect(splitOrderAmount(100)).toEqual({ feeRon: 2.5, netRon: 97.5 });
    expect(splitOrderAmount(49)).toEqual({ feeRon: 1.23, netRon: 47.77 }); // 1.225 rounds up
    expect(splitOrderAmount(0.19)).toEqual({ feeRon: 0, netRon: 0.19 });
    expect(splitOrderAmount(129.99)).toEqual({ feeRon: 3.25, netRon: 126.74 });
  });
});

describe("the simulated ledger", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  async function sell(price: number) {
    const id = `l${price}`;
    await t.ctx.db
      .insertInto("listings")
      .values({
        id,
        user_id: "seller",
        title: `Pachet ${price}`,
        description: "Un pachet de test plătit",
        price_ron: price,
        category: "grafica",
        expires_at: new Date(Date.now() + 86400_000).toISOString(),
        active: 1,
      })
      .execute();
    const created = await t.app.inject({
      method: "POST",
      url: "/orders",
      headers: t.bearer("buyer"),
      payload: { listing_id: id },
    });
    const orderId = (created.json() as { order: { id: string } }).order.id;
    await t.app.inject({ method: "POST", url: `/orders/${orderId}/mark-paid`, headers: t.bearer("buyer") });
  }

  async function setup() {
    t = await startTestApp();
    await t.ctx.db
      .insertInto("users")
      .values([
        { id: "seller", email: "seller@test.ro", password_hash: "x", email_verified: 1 },
        { id: "buyer", email: "buyer@test.ro", password_hash: "x", email_verified: 1 },
      ])
      .execute();
  }

  const earnings = async () =>
    (await t.app.inject({ method: "GET", url: "/me/earnings", headers: t.bearer("seller") })).json();

  it("records the fee on each paid order and sums the seller's balance", async () => {
    await setup();
    await sell(100);
    await sell(49);
    const e = await earnings();
    expect(e.sales_count).toBe(2);
    expect(e.gross_ron).toBe(149);
    expect(e.fees_ron).toBe(3.73);
    expect(e.net_ron).toBe(145.27);
    expect(e.balance_ron).toBe(145.27);
    const sale = e.sales.find((s: { amount_ron: number }) => s.amount_ron === 100);
    expect(sale).toMatchObject({ fee_ron: 2.5, net_ron: 97.5 });
  });

  it("pays out the whole balance once per request id, simulated, and refuses an empty balance", async () => {
    await setup();
    await sell(100);
    const first = await t.app.inject({
      method: "POST",
      url: "/me/payouts",
      headers: t.bearer("seller"),
      payload: { request_id: "req-00000001" },
    });
    expect(first.statusCode).toBe(201);
    expect(first.json().payout).toMatchObject({ amount_ron: 97.5, simulated: true });
    const repeat = await t.app.inject({
      method: "POST",
      url: "/me/payouts",
      headers: t.bearer("seller"),
      payload: { request_id: "req-00000001" },
    });
    expect(repeat.statusCode).toBe(200);
    expect(repeat.json().payout.id).toBe(first.json().payout.id);
    const empty = await t.app.inject({
      method: "POST",
      url: "/me/payouts",
      headers: t.bearer("seller"),
      payload: { request_id: "req-00000002" },
    });
    expect(empty.statusCode).toBe(422);
    const e = await earnings();
    expect(e.balance_ron).toBe(0);
    expect(e.paid_out_ron).toBe(97.5);
    expect(e.payouts).toHaveLength(1);
  });
});

describe("the ledger migration", () => {
  it("backfills the fee on orders paid before it", async () => {
    const { default: Database } = await import("better-sqlite3");
    const { runMigrations } = await import("@my-olx/core");
    const { mkdtempSync, readdirSync, copyFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const all = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../migrations");
    const before = mkdtempSync(path.join(tmpdir(), "ledger-mig-"));
    const ledger = "20261103020000_payout_ledger.sql";
    for (const f of readdirSync(all)) if (f !== ledger) copyFileSync(path.join(all, f), path.join(before, f));
    const db = new Database(":memory:");
    runMigrations(db, before);
    db.prepare("INSERT INTO users (id, email, password_hash) VALUES ('s', 's@t.ro', 'x'), ('b', 'b@t.ro', 'x')").run();
    db.prepare(
      "INSERT INTO listings (id, user_id, title, description, category, expires_at) VALUES ('l', 's', 'T', 'Descriere', 'grafica', '2999-01-01')",
    ).run();
    db.prepare(
      "INSERT INTO orders (buyer_user_id, listing_id, seller_user_id, amount_ron, status) VALUES ('b', 'l', 's', 49, 'paid'), ('b', 'l', 's', 30, 'pending')",
    ).run();
    copyFileSync(path.join(all, ledger), path.join(before, ledger));
    runMigrations(db, before);
    const rows = db
      .prepare("SELECT status, platform_fee_ron, seller_net_ron FROM orders ORDER BY amount_ron DESC")
      .all();
    expect(rows).toEqual([
      { status: "paid", platform_fee_ron: 1.23, seller_net_ron: 47.77 },
      { status: "pending", platform_fee_ron: null, seller_net_ron: null },
    ]);
  });
});
