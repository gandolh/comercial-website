import path from "node:path";

export interface Config {
  databasePath: string;
  uploadsDir: string;
  publicBaseUrl: string;
  jwtSecret: string;
  jwtExpirySeconds: number;
  corsAllowedOrigins: string;
  host: string;
  port: number;
  frontendBaseUrl: string;
}

function parseIntWithDefault(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): Config {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const port = parseIntWithDefault(process.env.PORT, 8080);
  const defaultPublicBaseUrl = `http://localhost:${port}`;

  return {
    databasePath: process.env.DATABASE_PATH ?? path.resolve("data/my-olx.db"),
    uploadsDir: process.env.UPLOADS_DIR ?? path.resolve("data/uploads"),
    publicBaseUrl: process.env.PUBLIC_BASE_URL ?? defaultPublicBaseUrl,
    jwtSecret,
    jwtExpirySeconds: parseIntWithDefault(process.env.JWT_EXPIRY_SECONDS, 86400),
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173",
    host: process.env.HOST ?? "0.0.0.0",
    port,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "http://localhost:5173",
  };
}

export function getCorsOrigins(corsAllowedOrigins: string): string[] {
  return corsAllowedOrigins.split(",").map((origin) => origin.trim());
}
