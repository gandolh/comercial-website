// @my-olx/core — the domain-agnostic plugin library of the my-olx backend: plugins/ (errors, http, auth, each a
// fastify-plugin with typed options, registered by name in the app's app.ts), lib/ (pure code, no Fastify) and
// db/ (Kysely over SQLite, the migrator). It reads no environment: the app's config.ts passes values in.
export const CORE_VERSION = "0.1.0";

export * from "./db/index.js";
export * from "./lib/api-error.js";
export * from "./lib/tokens.js";
export * from "./lib/email.js";
export * from "./lib/storage.js";
export * from "./plugins/errors.js";
export * from "./plugins/auth.js";
export * from "./plugins/http.js";
