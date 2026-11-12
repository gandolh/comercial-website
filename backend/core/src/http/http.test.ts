import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { registerHttp } from "./index.js";
import type { HttpOptions } from "./index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/** A bare Fastify with the HTTP plugins and a health route, as the app registers them. */
async function buildApp(overrides: Partial<HttpOptions> = {}) {
  const uploadsDir = await mkdtemp(path.join(tmpdir(), "my-olx-test-"));
  const app = Fastify();
  await registerHttp(app, { corsOrigins: ["http://localhost:5173"], uploadsDir, ...overrides });
  app.get("/health", async () => ({ status: "ok" }));
  return app;
}

describe("buildApp", () => {
  it("should build a Fastify app with health endpoint", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });

    await app.close();
  });

  it("should have CORS configured", async () => {
    const app = await buildApp({ corsOrigins: ["http://localhost:5173", "https://example.com"] });

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:5173" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    await app.close();
  });

  it("should have compression registered", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "accept-encoding": "gzip" },
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });
});
