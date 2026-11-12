import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ConfigError, loadConfig, loadDevSeedConfig, loadOwnerConfig, resolveDataPaths } from "./config.js";

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

  it("refuses to start without JWT_SECRET in production, a container's environment included", () => {
    const env = { NODE_ENV: "production", PORT: "8807", DATABASE_PATH: "/data/my-olx.db" };
    expect(() => loadConfig(env)).toThrow(ConfigError);
    expect(() => loadConfig(env)).toThrow("JWT_SECRET environment variable is required");
    expect(() => loadConfig({ ...env, JWT_SECRET: "" })).toThrow("JWT_SECRET environment variable is required");
  });

  it("reads LOG_LEVEL, refuses an unknown one, and names the Ward settings", () => {
    expect(loadConfig({ JWT_SECRET: "s" }).logLevel).toBe("info");
    expect(loadConfig({ JWT_SECRET: "s", LOG_LEVEL: "debug" }).logLevel).toBe("debug");
    expect(() => loadConfig({ JWT_SECRET: "s", LOG_LEVEL: "loud" })).toThrow(ConfigError);
    expect(loadConfig({ JWT_SECRET: "s" }).ward).toBeUndefined();
  });

  it("resolves the data paths one way for the server and the seed commands", () => {
    const env = { JWT_SECRET: "s", DATABASE_PATH: "/d/db.sqlite", UPLOADS_DIR: "/d/up", ASSETS_DIR: "/d/as" };
    const { databasePath, uploadsDir, assetsDir } = loadConfig(env);
    expect({ databasePath, uploadsDir, assetsDir }).toEqual(resolveDataPaths(env));
    expect(resolveDataPaths({}).assetsDir).toMatch(/data[\\/]assets$/);
  });
});

describe("the command settings", () => {
  it("runs the dev seed only in development", () => {
    expect(() => loadDevSeedConfig({})).toThrow(ConfigError);
    expect(() => loadDevSeedConfig({ NODE_ENV: "production" })).toThrow(ConfigError);
    expect(loadDevSeedConfig({ NODE_ENV: "development", DATABASE_PATH: "/d/x.db" })).toEqual({
      databasePath: "/d/x.db",
    });
  });

  it("needs the owner's three settings and a 12-character password", () => {
    expect(() => loadOwnerConfig({ OWNER_EMAIL: "a@b.ro", OWNER_NAME: "A" })).toThrow("create-owner needs");
    expect(() => loadOwnerConfig({ OWNER_EMAIL: "a@b.ro", OWNER_NAME: "A", OWNER_PASSWORD: "short" })).toThrow(
      "OWNER_PASSWORD must be at least 12 characters.",
    );
    expect(loadOwnerConfig({ OWNER_EMAIL: "a@b.ro", OWNER_NAME: "A", OWNER_PASSWORD: "long-enough-pw" }).name).toBe(
      "A",
    );
  });
});
