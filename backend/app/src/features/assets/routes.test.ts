import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { startTestApp } from "../../testing/test-app.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

function multipart(filename: string, mime: string, content: string) {
  const boundary = "----piataro-test";
  const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n${content}\r\n--${boundary}--\r\n`;
  return { payload, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function paidListingWithAsset(t: TestApp) {
  const db = t.ctx.db;
  await db
    .insertInto("users")
    .values([
      { id: "seller", email: "seller@test.ro", password_hash: "x", email_verified: 1 },
      { id: "buyer", email: "buyer@test.ro", password_hash: "x", email_verified: 1 },
    ])
    .execute();
  const expires = new Date(Date.now() + 30 * 86400_000).toISOString();
  await db
    .insertInto("listings")
    .values({
      id: "paid",
      user_id: "seller",
      title: "Pachet plătit",
      description: "Un pachet de test plătit",
      price_ron: 49,
      category: "grafica",
      expires_at: expires,
      active: 1,
    })
    .execute();
  const key = "listings/paid/assets/pack.zip";
  await db
    .insertInto("listing_assets")
    .values({
      id: "a1",
      listing_id: "paid",
      s3_key: key,
      original_filename: "pack.zip",
      content_type: "application/zip",
      file_size_bytes: 4,
      position: 0,
    })
    .execute();
  mkdirSync(path.join(t.config.assetsDir, "listings", "paid", "assets"), { recursive: true });
  writeFileSync(path.join(t.config.assetsDir, key), "paid");
  return key;
}

describe("paid files", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  it("are not reachable through the public /uploads/ path", async () => {
    t = await startTestApp();
    const key = await paidListingWithAsset(t);
    const res = await t.app.inject({ method: "GET", url: `/uploads/${key}` });
    expect(res.statusCode).toBe(404);
  });

  it("download only with a paid order", async () => {
    t = await startTestApp();
    await paidListingWithAsset(t);
    const refused = await t.app.inject({ method: "GET", url: "/listings/paid/download", headers: t.bearer("buyer") });
    expect(refused.statusCode).toBe(403);

    await t.ctx.db
      .insertInto("orders")
      .values({
        buyer_user_id: "buyer",
        listing_id: "paid",
        seller_user_id: "seller",
        amount_ron: 49,
        status: "paid",
        provider: "fake",
      })
      .execute();
    const served = await t.app.inject({ method: "GET", url: "/listings/paid/download", headers: t.bearer("buyer") });
    expect(served.statusCode).toBe(200);
    expect(served.body).toBe("paid");
  });
});

describe("the asset upload's reply", () => {
  it("has no storage key", async () => {
    const t = await startTestApp();
    await paidListingWithAsset(t);
    const { payload, contentType } = multipart("extra.zip", "application/zip", "data");
    const res = await t.app.inject({
      method: "POST",
      url: "/listings/paid/assets",
      headers: { ...t.bearer("seller"), "content-type": contentType },
      payload,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).not.toHaveProperty("s3_key");
    expect(res.json()).toMatchObject({ listing_id: "paid", original_filename: "extra.zip" });
    await t.app.close();
  });
});
