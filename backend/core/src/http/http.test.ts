import { describe, it, expect } from "vitest";
import { buildApp } from "./index.js";
import type { Config } from "../config/index.js";

describe("buildApp", () => {
  it("should build a Fastify app with health endpoint", async () => {
    const testConfig: Config = {
      databaseUrl: "postgres://localhost/test",
      jwtSecret: "test-secret",
      jwtExpirySeconds: 86400,
      awsRegion: "eu-central-1",
      awsS3Bucket: "test-bucket",
      s3PublicBaseUrl: "http://localhost:4566/test-bucket",
      corsAllowedOrigins: "http://localhost:5173",
      host: "0.0.0.0",
      port: 8080,
      smtpHost: "localhost",
      smtpPort: 1025,
      smtpUsername: "",
      smtpPassword: "",
      smtpFrom: "noreply@test.ro",
      frontendBaseUrl: "http://localhost:5173",
      phoneProvider: "stub",
    };

    const app = await buildApp(testConfig);

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });

    await app.close();
  });

  it("should have CORS configured", async () => {
    const testConfig: Config = {
      databaseUrl: "postgres://localhost/test",
      jwtSecret: "test-secret",
      jwtExpirySeconds: 86400,
      awsRegion: "eu-central-1",
      awsS3Bucket: "test-bucket",
      s3PublicBaseUrl: "http://localhost:4566/test-bucket",
      corsAllowedOrigins: "http://localhost:5173,https://example.com",
      host: "0.0.0.0",
      port: 8080,
      smtpHost: "localhost",
      smtpPort: 1025,
      smtpUsername: "",
      smtpPassword: "",
      smtpFrom: "noreply@test.ro",
      frontendBaseUrl: "http://localhost:5173",
      phoneProvider: "stub",
    };

    const app = await buildApp(testConfig);

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        origin: "http://localhost:5173",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    await app.close();
  });

  it("should have compression registered", async () => {
    const testConfig: Config = {
      databaseUrl: "postgres://localhost/test",
      jwtSecret: "test-secret",
      jwtExpirySeconds: 86400,
      awsRegion: "eu-central-1",
      awsS3Bucket: "test-bucket",
      s3PublicBaseUrl: "http://localhost:4566/test-bucket",
      corsAllowedOrigins: "http://localhost:5173",
      host: "0.0.0.0",
      port: 8080,
      smtpHost: "localhost",
      smtpPort: 1025,
      smtpUsername: "",
      smtpPassword: "",
      smtpFrom: "noreply@test.ro",
      frontendBaseUrl: "http://localhost:5173",
      phoneProvider: "stub",
    };

    const app = await buildApp(testConfig);

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        "accept-encoding": "gzip",
      },
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });
});
