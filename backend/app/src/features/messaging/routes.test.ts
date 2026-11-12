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
