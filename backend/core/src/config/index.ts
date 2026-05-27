export interface Config {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpirySeconds: number;
  awsRegion: string;
  awsEndpointUrl?: string;
  awsS3Bucket: string;
  s3PublicBaseUrl: string;
  corsAllowedOrigins: string;
  host: string;
  port: number;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFrom: string;
  frontendBaseUrl: string;
  phoneProvider: string;
}

function parseIntWithDefault(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): Config {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return {
    databaseUrl,
    jwtSecret,
    jwtExpirySeconds: parseIntWithDefault(process.env.JWT_EXPIRY_SECONDS, 86400),
    awsRegion: process.env.AWS_REGION ?? "eu-central-1",
    awsEndpointUrl: process.env.AWS_ENDPOINT_URL,
    awsS3Bucket: process.env.AWS_S3_BUCKET ?? "my-olx-uploads",
    s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? "http://localhost:4566/my-olx-uploads",
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173",
    host: process.env.HOST ?? "0.0.0.0",
    port: parseIntWithDefault(process.env.PORT, 8080),
    smtpHost: process.env.SMTP_HOST ?? "localhost",
    smtpPort: parseIntWithDefault(process.env.SMTP_PORT, 1025),
    smtpUsername: process.env.SMTP_USERNAME ?? "",
    smtpPassword: process.env.SMTP_PASSWORD ?? "",
    smtpFrom: process.env.SMTP_FROM ?? "noreply@piataro.ro",
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "http://localhost:5173",
    phoneProvider: process.env.PHONE_PROVIDER ?? "stub",
  };
}

export function getCorsOrigins(corsAllowedOrigins: string): string[] {
  return corsAllowedOrigins.split(",").map((origin) => origin.trim());
}
