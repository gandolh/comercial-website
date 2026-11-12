import { describe, it, expect } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

describe("the image reorder's schema", () => {
  it("answers a malformed body 422 with the first issue's message, before it asks for a session", async () => {
    const t = await startTestApp();
    for (const headers of [{}, t.bearer("someone")]) {
      const res = await t.app.inject({
        method: "PATCH",
        url: "/listings/some-listing/images/reorder",
        headers,
        payload: { order: "not-a-list" },
      });
      expect([res.statusCode, res.json()]).toEqual([422, { error: "Invalid input: expected array, received string" }]);
    }
    const signedOut = await t.app.inject({
      method: "PATCH",
      url: "/listings/some-listing/images/reorder",
      payload: { order: ["an-image"] },
    });
    expect(signedOut.statusCode).toBe(401);
    await t.app.close();
  });
});
