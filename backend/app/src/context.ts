// Shared application context: the wired dependencies every route module receives.
// app.ts builds this once and registers each feature plugin with it as the plugin's options.
import type { FastifyBaseLogger } from "fastify";
import type { Db } from "./db/index.js";
import type { EmailService } from "./lib/email.js";
import type { StorageService } from "./lib/storage.js";
import type { Config } from "./config.js";
import type { AttemptLimiter } from "./lib/attempt-limiter.js";

export interface AppContext {
  db: Db;
  config: Config;
  /** Listing images, under the publicly served uploads folder. */
  storage: StorageService;
  /** Files for sale, outside it (`config.assetsDir`). */
  assetStorage: StorageService;
  email: EmailService;
  /** The one limit on wrong password tries, shared by the sign-in, change-password and Ward link routes. */
  passwordLimiter: AttemptLimiter;
  /** The app's logger, for code that runs outside a request (the reminder job, fire-and-forget emails). */
  log: FastifyBaseLogger;
}
