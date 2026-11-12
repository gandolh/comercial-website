import { describe, it, expect } from "vitest";
import { CreateListingRequestSchema } from "./routes.js";
import { startTestApp } from "../../testing/test-app.js";

describe("CreateListingRequestSchema", () => {
  it("accepts the wizard's empty, inactive draft", () => {
    const r = CreateListingRequestSchema.safeParse({
      title: "",
      description: "",
      price_ron: null,
      category: "grafica",
      active: false,
    });
    expect(r.success).toBe(true);
  });

  it("refuses a live listing with a short title or description", () => {
    expect(
      CreateListingRequestSchema.safeParse({ title: "Abc", description: "long enough text", category: "grafica" })
        .success,
    ).toBe(false);
    expect(
      CreateListingRequestSchema.safeParse({
        title: "A fine title",
        description: "short",
        category: "grafica",
        active: true,
      }).success,
    ).toBe(false);
  });

  it("accepts a complete live listing, active by default", () => {
    const r = CreateListingRequestSchema.safeParse({
      title: "A fine title",
      description: "A description long enough",
      category: "grafica",
    });
    expect(r.success && r.data.active).toBe(true);
  });

  it("still needs a category, even for a draft", () => {
    expect(
      CreateListingRequestSchema.safeParse({ title: "", description: "", category: "", active: false }).success,
    ).toBe(false);
  });
});

describe("the listings routes' schemas", () => {
  it("answer a bad query and a bad body with their fixed messages, before they ask for a session", async () => {
    const t = await startTestApp();
    const query = await t.app.inject({ method: "GET", url: "/listings?per_page=500" });
    expect([query.statusCode, query.json()]).toEqual([422, { error: "Invalid query parameters" }]);
    for (const headers of [{}, t.bearer("someone")]) {
      const mine = await t.app.inject({ method: "GET", url: "/me/listings?active=maybe", headers });
      expect([mine.statusCode, mine.json()]).toEqual([422, { error: "Invalid query parameters" }]);
      const res = await t.app.inject({ method: "POST", url: "/listings", headers, payload: { title: 5 } });
      expect([res.statusCode, res.json()]).toEqual([422, { error: "Invalid request body" }]);
    }
    const signedOut = await t.app.inject({
      method: "POST",
      url: "/listings",
      payload: { title: "", description: "", category: "grafica", active: false },
    });
    expect(signedOut.statusCode).toBe(401);
    await t.app.close();
  });
});
