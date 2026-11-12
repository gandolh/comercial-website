// The one reader of the environment. The server, the seed commands, the owner command and the migrator take
// their settings from here; nothing else in backend/app/src or backend/core/src reads process.env.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { wardClientOptionsFromEnv } from "../vendor/ward/ward-auth.js";
import type { WardClientOptions } from "../vendor/ward/ward-auth.js";

/** backend/.env, two levels up from app/src (dev) and from app/dist (a build), never from the working directory. */
export const ENV_FILE = fileURLToPath(new URL("../../.env", import.meta.url));

export const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface Config {
  databasePath: string;
  uploadsDir: string;
  /** Files for sale. Outside `uploadsDir`, which is served publicly: assets go out only through the download routes. */
  assetsDir: string;
  publicBaseUrl: string;
  jwtSecret: string;
  jwtExpirySeconds: number;
  corsAllowedOrigins: string;
  host: string;
  port: number;
  frontendBaseUrl: string;
  /** `LOG_LEVEL`, `info` by default. */
  logLevel: LogLevel;
  /** `TRUSTED_PROXIES`, comma-separated addresses or CIDR ranges whose `X-Forwarded-For` Fastify believes. */
  trustedProxies: string[];
  /** The five `WARD_OIDC_*` settings, or undefined when `WARD_OIDC_ISSUER` is unset (local login only). */
  ward: WardClientOptions | undefined;
}

/** The environment can't run the command. The message names what is wrong. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** `KEY=` copied from an example file counts as unset, so the default applies rather than an empty string. */
function unset(value: unknown): unknown {
  return value === "" ? undefined : value;
}

/** A whole number, or undefined when the value isn't one: the default then applies, as it always has. */
function lenientInt(value: unknown): unknown {
  if (typeof value !== "string" || value === "") return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

const dataPathsSchema = z.object({
  DATABASE_PATH: z.preprocess(unset, z.string().optional()),
  UPLOADS_DIR: z.preprocess(unset, z.string().optional()),
  ASSETS_DIR: z.preprocess(unset, z.string().optional()),
});

const envSchema = z.object({
  JWT_SECRET: z.preprocess(unset, z.string({ error: "JWT_SECRET environment variable is required" })),
  PORT: z.preprocess(lenientInt, z.number().int().default(8080)),
  PUBLIC_BASE_URL: z.preprocess(unset, z.string().optional()),
  JWT_EXPIRY_SECONDS: z.preprocess(lenientInt, z.number().int().default(86400)),
  CORS_ALLOWED_ORIGINS: z.preprocess(unset, z.string().default("http://localhost:5173")),
  HOST: z.preprocess(unset, z.string().default("0.0.0.0")),
  FRONTEND_BASE_URL: z.preprocess(unset, z.string().default("http://localhost:5173")),
  LOG_LEVEL: z.preprocess(unset, z.enum(LOG_LEVELS).default("info")),
  TRUSTED_PROXIES: z.preprocess(unset, z.string().default("loopback")),
});

/** A zod failure as one line per bad variable. */
function describe(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join("\n");
}

/**
 * The SQLite file and the two file folders. A relative default is from the folder the command runs in
 * (`data/` beside it), as it always was; the container sets all three. The server and the seed
 * commands share this rule.
 */
export function resolveDataPaths(env: NodeJS.ProcessEnv = process.env): {
  databasePath: string;
  uploadsDir: string;
  assetsDir: string;
} {
  const parsed = dataPathsSchema.parse(env);
  return {
    databasePath: parsed.DATABASE_PATH ?? path.resolve("data/my-olx.db"),
    uploadsDir: parsed.UPLOADS_DIR ?? path.resolve("data/uploads"),
    assetsDir: parsed.ASSETS_DIR ?? path.resolve("data/assets"),
  };
}

/**
 * The server's settings, parsed once at start. Throws `ConfigError` when the environment can't run it:
 * `JWT_SECRET` is required everywhere, a container included, so a deploy that forgets it fails at start
 * rather than signing tokens with nothing. Tests pass their own `env`.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) throw new ConfigError(describe(parsed.error));
  const e = parsed.data;
  return {
    ...resolveDataPaths(env),
    publicBaseUrl: e.PUBLIC_BASE_URL ?? `http://localhost:${e.PORT}`,
    jwtSecret: e.JWT_SECRET,
    jwtExpirySeconds: e.JWT_EXPIRY_SECONDS,
    corsAllowedOrigins: e.CORS_ALLOWED_ORIGINS,
    host: e.HOST,
    port: e.PORT,
    frontendBaseUrl: e.FRONTEND_BASE_URL,
    logLevel: e.LOG_LEVEL,
    trustedProxies: e.TRUSTED_PROXIES.split(",")
      .map((item) => item.trim())
      .filter((item) => item !== ""),
    // An incomplete set throws here, at start: always a deploy mistake.
    ward: wardClientOptionsFromEnv(env),
  };
}

/** The owner's account, for `npm run create-owner` (sign-up is closed). */
export function loadOwnerConfig(env: NodeJS.ProcessEnv = process.env): {
  email: string;
  password: string;
  name: string;
  databasePath: string;
} {
  const { OWNER_EMAIL: email, OWNER_PASSWORD: password, OWNER_NAME: name } = env;
  if (!email || !password || !name)
    throw new ConfigError("create-owner needs OWNER_EMAIL, OWNER_PASSWORD and OWNER_NAME.");
  if (password.length < 12) throw new ConfigError("OWNER_PASSWORD must be at least 12 characters.");
  return { email, password, name, databasePath: resolveDataPaths(env).databasePath };
}

/**
 * `npm run seed:dev` makes accounts with a known password, so it runs only in development. This is the
 * one place that reads `NODE_ENV` (an exception in scripts/conventions.json): the guard must not go.
 */
export function loadDevSeedConfig(env: NodeJS.ProcessEnv = process.env): { databasePath: string } {
  if (env.NODE_ENV !== "development")
    throw new ConfigError("seed:dev creates accounts with a known password; it runs only with NODE_ENV=development.");
  return { databasePath: resolveDataPaths(env).databasePath };
}

/**
 * Reads backend/.env into the environment when there is one, and returns its path. Optional on purpose: a
 * container has none and passes real variables. A variable the environment already has keeps its value.
 */
export function loadEnvFile(file: string = ENV_FILE): string | undefined {
  if (!existsSync(file)) return undefined;
  process.loadEnvFile(file);
  return file;
}

export function getCorsOrigins(corsAllowedOrigins: string): string[] {
  return corsAllowedOrigins.split(",").map((origin) => origin.trim());
}
