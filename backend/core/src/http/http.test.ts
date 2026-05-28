import { describe, it, expect } from "vitest";
import { buildApp } from "./index.js";
import type { Config } from "../config/index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

async function makeTestConfig(overrides: Partial<Config> = {}): Promise<Config> {
  const uploadsDir = await mkdtemp(path.join(tmpdir(), "my-olx-test-"));
  return {
    databasePath: ":memory:",
    uploadsDir,
    publicBaseUrl: "http://localhost:8080",
    jwtSecret: "test-secret",
    jwtExpirySeconds: 86400,
    corsAllowedOrigins: "http://localhost:5173",
    host: "0.0.0.0",
    port: 8080,
    frontendBaseUrl: "http://localhost:5173",
    ...overrides,
  };
}

describe("buildApp", () => {
  it("should build a Fastify app with health endpoint", async () => {
    const app = await buildApp(await makeTestConfig());

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });

    await app.close();
  });

  it("should have CORS configured", async () => {
    const app = await buildApp(await makeTestConfig({
      corsAllowedOrigins: "http://localhost:5173,https://example.com",
    }));

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
    const app = await buildApp(await makeTestConfig());

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "accept-encoding": "gzip" },
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });
});
