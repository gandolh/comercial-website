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
