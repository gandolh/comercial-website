import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "./index.js";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "secret123";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load required fields from environment", () => {
    const config = loadConfig();
    expect(config.jwtSecret).toBe("secret123");
  });

  it("should throw when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;
    expect(() => loadConfig()).toThrow("JWT_SECRET environment variable is required");
  });

  it("should use default for jwtExpirySeconds", () => {
    delete process.env.JWT_EXPIRY_SECONDS;
    expect(loadConfig().jwtExpirySeconds).toBe(86400);
  });

  it("should parse jwtExpirySeconds as number", () => {
    process.env.JWT_EXPIRY_SECONDS = "3600";
    expect(loadConfig().jwtExpirySeconds).toBe(3600);
  });

  it("should fall back to default for invalid jwtExpirySeconds", () => {
    process.env.JWT_EXPIRY_SECONDS = "not-a-number";
    expect(loadConfig().jwtExpirySeconds).toBe(86400);
  });

  it("should use default for corsAllowedOrigins", () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    expect(loadConfig().corsAllowedOrigins).toBe("http://localhost:5173");
  });

  it("should use provided corsAllowedOrigins", () => {
    process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000,https://example.com";
    expect(loadConfig().corsAllowedOrigins).toBe("http://localhost:3000,https://example.com");
  });

  it("should use default for host", () => {
    delete process.env.HOST;
    expect(loadConfig().host).toBe("0.0.0.0");
  });

  it("should use default for port", () => {
    delete process.env.PORT;
    expect(loadConfig().port).toBe(8080);
  });

  it("should parse port as number", () => {
    process.env.PORT = "3000";
    expect(loadConfig().port).toBe(3000);
  });

  it("should use default for frontendBaseUrl", () => {
    delete process.env.FRONTEND_BASE_URL;
    expect(loadConfig().frontendBaseUrl).toBe("http://localhost:5173");
  });
});
