import { describe, it, expect } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

describe("the password change's schema", () => {
  it("answers a malformed body 422 with the first issue's message, before it asks for a session", async () => {
    const t = await startTestApp();
    for (const headers of [{}, t.bearer("someone")]) {
      const res = await t.app.inject({
        method: "PATCH",
        url: "/users/me/password",
        headers,
        payload: { current_password: "short", new_password: "long-enough" },
      });
      expect([res.statusCode, res.json()]).toEqual([
        422,
        { error: "Too small: expected string to have >=8 characters" },
      ]);
    }
    const signedOut = await t.app.inject({
      method: "PATCH",
      url: "/users/me/password",
      payload: { current_password: "long-enough", new_password: "long-enough" },
    });
    expect(signedOut.statusCode).toBe(401);
    await t.app.close();
  });
});
