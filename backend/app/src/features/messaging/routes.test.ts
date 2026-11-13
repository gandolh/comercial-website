import { describe, it, expect } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

describe("the message body's schema", () => {
  it("answers a malformed body 422 with its fixed message, before it asks for a session", async () => {
    const t = await startTestApp();
    for (const url of ["/listings/some-listing/conversations", "/conversations/some-conversation/messages"]) {
      for (const headers of [{}, t.bearer("someone")]) {
        for (const payload of [{}, { body: "" }, { body: 5 }]) {
          const res = await t.app.inject({ method: "POST", url, headers, payload });
          expect([res.statusCode, res.json()]).toEqual([422, { error: "body must be 1-2000 characters" }]);
        }
      }
      const signedOut = await t.app.inject({ method: "POST", url, payload: { body: "Bună ziua" } });
      expect(signedOut.statusCode).toBe(401);
    }
    await t.app.close();
  });
});

describe("the conversation summary", () => {
  it("shows the other party's name and avatar only, with the flags as booleans", async () => {
    const t = await startTestApp();
    await t.ctx.db
      .insertInto("users")
      .values([
        {
          id: "seller",
          email: "seller@test.ro",
          password_hash: "x",
          email_verified: 1,
          phone: "+40700000000",
          phone_verified: 1,
          display_name: "Vânzător",
        },
        {
          id: "buyer",
          email: "buyer@test.ro",
          password_hash: "x",
          email_verified: 1,
          phone: null,
          phone_verified: 0,
          display_name: null,
        },
      ])
      .execute();
    await t.ctx.db
      .insertInto("listings")
      .values({
        id: "l1",
        user_id: "seller",
        title: "Pachet",
        description: "Un pachet de test",
        price_ron: 10,
        category: "grafica",
        expires_at: new Date(Date.now() + 86400_000).toISOString(),
        active: 1,
      })
      .execute();
    const res = await t.app.inject({
      method: "POST",
      url: "/listings/l1/conversations",
      headers: t.bearer("buyer"),
      payload: { body: "Bună ziua" },
    });
    expect(res.statusCode).toBe(200);
    const summary = res.json();
    expect(Object.keys(summary.counterparty).sort()).toEqual(["avatar_url", "display_name", "id"]);
    expect(summary.counterparty).toMatchObject({ id: "seller", display_name: "Vânzător" });
    expect(JSON.stringify(summary)).not.toContain("seller@test.ro");
    expect(JSON.stringify(summary)).not.toContain("+40700000000");
    expect(summary.listing.seller_verified).toBe(true);
    expect(summary.listing.active).toBe(true);
    await t.app.close();
  });
});
