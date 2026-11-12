import { it, expect } from "vitest";
import { startTestApp } from "../../testing/test-app.js";

it("answers the health check through the whole app", async () => {
  const t = await startTestApp();
  const res = await t.app.inject({ method: "GET", url: "/health" });
  expect([res.statusCode, res.json()]).toEqual([200, { status: "ok" }]);
  await t.app.close();
});
