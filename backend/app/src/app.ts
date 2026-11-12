// Builds the API: the Fastify app, its plugins and every route, on a prepared data folder (prepareStorage).
// server.ts listens on it; tests build the same app on a temporary database (test-app.ts). It never listens.
import { auth, createDb, createEmailService, errors, http, StorageService } from "@my-olx/core";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { Config } from "./config.js";
import { getCorsOrigins } from "./config.js";
import type { AppContext } from "./context.js";
import { startExpiryReminderJob } from "./jobs/expiry-reminders.js";
import { registerAuthRoutes } from "./modules/auth.js";
import { registerUsersRoutes } from "./modules/users.js";
import { registerFavoritesRoutes } from "./modules/favorites.js";
import { registerListingsRoutes } from "./modules/listings.js";
import { registerImagesRoutes } from "./modules/images.js";
import { registerAssetsRoutes } from "./modules/assets.js";
import { registerMessagingRoutes } from "./modules/messaging.js";
import { registerAnafRoutes } from "./modules/anaf.js";
import { registerInvoicesRoutes } from "./modules/invoices.js";
import { registerOrdersRoutes } from "./modules/orders.js";
import { registerReviewsRoutes } from "./modules/reviews.js";
import { registerBundlesRoutes } from "./modules/bundles.js";
import { registerWardRoutes } from "./modules/ward.js";
import { registerPayoutsRoutes } from "./modules/payouts.js";
import { wardClientFrom } from "./ward-client.js";
import type { WardClient } from "../vendor/ward/ward-auth.js";

/** Fastify's options that belong to the process. server.ts sets them; a test leaves them out. */
export type ServerOptions = Pick<
  FastifyServerOptions,
  "logger" | "trustProxy" | "connectionTimeout" | "requestTimeout" | "keepAliveTimeout"
>;

export interface BuildAppOptions {
  server?: ServerOptions;
  /** Overrides the client `config.ward` would make: tests pass a fake, or `null` for local login only. */
  ward?: WardClient | null;
  /** Run the expiry-reminder job while the app is up. server.ts turns it on; tests leave it off. */
  reminders?: boolean;
}

/**
 * The app, ready to listen and not listening. Closing it stops the reminder job and closes the database.
 */
export async function buildApp(
  config: Config,
  options: BuildAppOptions = {},
): Promise<{ app: FastifyInstance; ctx: AppContext }> {
  const app = Fastify(options.server);
  // Zod checks every request and encodes every reply, in every plugin registered below.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // The error plugin first: it sets the error and 404 handlers on the root, so every plugin after it,
  // and every route, answers in its body.
  await app.register(errors);
  // Then the other cross-cutting plugins, by name: CORS, compression, multipart and /uploads/, then auth.
  await app.register(http, { corsOrigins: getCorsOrigins(config.corsAllowedOrigins), uploadsDir: config.uploadsDir });
  await app.register(auth, { secret: config.jwtSecret });

  const ctx: AppContext = {
    db: createDb(config.databasePath),
    config,
    storage: new StorageService({ uploadsDir: config.uploadsDir, publicBaseUrl: config.publicBaseUrl }),
    assetStorage: new StorageService({ uploadsDir: config.assetsDir, publicBaseUrl: config.publicBaseUrl }),
    email: createEmailService({}),
  };

  let stopReminders: (() => void) | undefined;
  if (options.reminders === true) {
    app.addHook("onReady", async () => {
      stopReminders = startExpiryReminderJob(ctx);
    });
  }
  app.addHook("onClose", async () => {
    stopReminders?.();
    await ctx.db.destroy();
  });

  app.get("/health", async () => ({ status: "ok" }));

  registerAuthRoutes(app, ctx);
  registerUsersRoutes(app, ctx);
  registerFavoritesRoutes(app, ctx);
  registerListingsRoutes(app, ctx);
  registerImagesRoutes(app, ctx);
  registerAssetsRoutes(app, ctx);
  registerMessagingRoutes(app, ctx);
  registerAnafRoutes(app, ctx);
  registerInvoicesRoutes(app, ctx);
  registerOrdersRoutes(app, ctx);
  registerReviewsRoutes(app, ctx);
  registerBundlesRoutes(app, ctx);
  registerPayoutsRoutes(app, ctx);
  const ward = options.ward === undefined ? await wardClientFrom(config.ward) : (options.ward ?? undefined);
  registerWardRoutes(app, ctx, ward);

  return { app, ctx };
}
