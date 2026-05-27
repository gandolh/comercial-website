import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "./index.js";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load required fields from environment", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";

    const config = loadConfig();

    expect(config.databaseUrl).toBe("postgres://localhost/test");
    expect(config.jwtSecret).toBe("secret123");
  });

  it("should throw when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.JWT_SECRET = "secret123";

    expect(() => loadConfig()).toThrow("DATABASE_URL environment variable is required");
  });

  it("should throw when JWT_SECRET is missing", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    delete process.env.JWT_SECRET;

    expect(() => loadConfig()).toThrow("JWT_SECRET environment variable is required");
  });

  it("should use default for jwtExpirySeconds", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.JWT_EXPIRY_SECONDS;

    const config = loadConfig();
    expect(config.jwtExpirySeconds).toBe(86400);
  });

  it("should parse jwtExpirySeconds as number", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.JWT_EXPIRY_SECONDS = "3600";

    const config = loadConfig();
    expect(config.jwtExpirySeconds).toBe(3600);
  });

  it("should fall back to default for invalid jwtExpirySeconds", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.JWT_EXPIRY_SECONDS = "not-a-number";

    const config = loadConfig();
    expect(config.jwtExpirySeconds).toBe(86400);
  });

  it("should use default for awsRegion", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.AWS_REGION;

    const config = loadConfig();
    expect(config.awsRegion).toBe("eu-central-1");
  });

  it("should use provided awsRegion", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.AWS_REGION = "us-east-1";

    const config = loadConfig();
    expect(config.awsRegion).toBe("us-east-1");
  });

  it("should use default for awsS3Bucket", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.AWS_S3_BUCKET;

    const config = loadConfig();
    expect(config.awsS3Bucket).toBe("my-olx-uploads");
  });

  it("should use default for s3PublicBaseUrl", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.S3_PUBLIC_BASE_URL;

    const config = loadConfig();
    expect(config.s3PublicBaseUrl).toBe("http://localhost:4566/my-olx-uploads");
  });

  it("should use default for corsAllowedOrigins", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.CORS_ALLOWED_ORIGINS;

    const config = loadConfig();
    expect(config.corsAllowedOrigins).toBe("http://localhost:5173");
  });

  it("should use provided corsAllowedOrigins", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000,https://example.com";

    const config = loadConfig();
    expect(config.corsAllowedOrigins).toBe("http://localhost:3000,https://example.com");
  });

  it("should use default for host", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.HOST;

    const config = loadConfig();
    expect(config.host).toBe("0.0.0.0");
  });

  it("should use default for port", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.PORT;

    const config = loadConfig();
    expect(config.port).toBe(8080);
  });

  it("should parse port as number", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.PORT = "3000";

    const config = loadConfig();
    expect(config.port).toBe(3000);
  });

  it("should use defaults for SMTP config", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";

    const config = loadConfig();
    expect(config.smtpHost).toBe("localhost");
    expect(config.smtpPort).toBe(1025);
    expect(config.smtpUsername).toBe("");
    expect(config.smtpPassword).toBe("");
    expect(config.smtpFrom).toBe("noreply@piataro.ro");
  });

  it("should use default for frontendBaseUrl", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.FRONTEND_BASE_URL;

    const config = loadConfig();
    expect(config.frontendBaseUrl).toBe("http://localhost:5173");
  });

  it("should use default for phoneProvider", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.PHONE_PROVIDER;

    const config = loadConfig();
    expect(config.phoneProvider).toBe("stub");
  });

  it("should handle awsEndpointUrl as optional", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    delete process.env.AWS_ENDPOINT_URL;

    const config = loadConfig();
    expect(config.awsEndpointUrl).toBeUndefined();
  });

  it("should use provided awsEndpointUrl", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.JWT_SECRET = "secret123";
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";

    const config = loadConfig();
    expect(config.awsEndpointUrl).toBe("http://localhost:4566");
  });
});
