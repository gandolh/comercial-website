import { describe, it, expect } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

describe("the auth bodies' schemas", () => {
  it("answer a malformed login 422 with the schema's own message", async () => {
    const t = await startTestApp();
    const res = await t.app.inject({ method: "POST", url: "/auth/login", payload: { email: "", password: "x" } });
    expect([res.statusCode, res.json()]).toEqual([422, { error: "email is required" }]);
    await t.app.close();
  });

  it("answer a malformed phone code 422 before they ask for a session", async () => {
    const t = await startTestApp();
    for (const headers of [{}, t.bearer("someone")]) {
      const res = await t.app.inject({
        method: "POST",
        url: "/auth/phone/verify",
        headers,
        payload: { code: "12a456" },
      });
      expect([res.statusCode, res.json()]).toEqual([422, { error: "code must contain only digits" }]);
    }
    const signedOut = await t.app.inject({ method: "POST", url: "/auth/phone/verify", payload: { code: "123456" } });
    expect(signedOut.statusCode).toBe(401);
    await t.app.close();
  });
});

describe("Fastify's own 4xx through the whole app", () => {
  it("answers bad JSON 400 and an unknown route 404, in the { error } body, not 500", async () => {
    const t = await startTestApp();
    const bad = await t.app.inject({
      method: "POST",
      url: "/auth/login",
      headers: { "content-type": "application/json" },
      payload: "{{{",
    });
    expect([bad.statusCode, bad.json()]).toEqual([
      400,
      { error: "Body is not valid JSON but content-type is set to 'application/json'" },
    ]);
    const unknown = await t.app.inject({ method: "GET", url: "/nothing-here" });
    expect([unknown.statusCode, unknown.json()]).toEqual([404, { error: "not found" }]);
    await t.app.close();
  });
});
