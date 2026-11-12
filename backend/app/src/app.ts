// Builds the API: the Fastify app, its plugins and every route, on a prepared data folder (prepareStorage).
// server.ts listens on it; tests build the same app on a temporary database (test-app.ts). It never listens.
import { auth, createDb, createEmailService, errors, http, StorageService } from "@my-olx/core";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { Config } from "./config.js";
import { getCorsOrigins } from "./config.js";
import type { AppContext } from "./context.js";
import { startExpiryReminderJob } from "./features/reminders/index.js";
import { registerAuthRoutes } from "./features/auth/index.js";
import { healthRoutes } from "./features/health/index.js";
import { registerUsersRoutes } from "./features/users/index.js";
import { favoritesRoutes } from "./features/favorites/index.js";
import { registerListingsRoutes } from "./features/listings/index.js";
import { registerImagesRoutes } from "./features/images/index.js";
import { registerAssetsRoutes } from "./features/assets/index.js";
import { registerMessagingRoutes } from "./features/messaging/index.js";
import { anafRoutes } from "./features/anaf/index.js";
import { registerInvoicesRoutes } from "./features/invoices/index.js";
import { registerOrdersRoutes } from "./features/orders/index.js";
import { reviewsRoutes } from "./features/reviews/index.js";
import { bundlesRoutes } from "./features/bundles/index.js";
import { registerWardRoutes } from "./features/ward/index.js";
import { payoutsRoutes } from "./features/payouts/index.js";
import { wardClientFrom } from "./features/ward/index.js";
import type { WardClient } from "../vendor/ward/ward-auth.js";

/** Fastify's options that belong to the process. server.ts sets them; a test leaves them out. */
type ServerOptions = Pick<
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

  // The features, each an encapsulated plugin given the context: its hooks stay inside it.
  await app.register(healthRoutes);

  registerAuthRoutes(app, ctx);
  registerUsersRoutes(app, ctx);
  await app.register(favoritesRoutes, ctx);
  registerListingsRoutes(app, ctx);
  registerImagesRoutes(app, ctx);
  registerAssetsRoutes(app, ctx);
  registerMessagingRoutes(app, ctx);
  await app.register(anafRoutes);
  registerInvoicesRoutes(app, ctx);
  registerOrdersRoutes(app, ctx);
  await app.register(reviewsRoutes, ctx);
  await app.register(bundlesRoutes, ctx);
  await app.register(payoutsRoutes, ctx);
  const ward = options.ward === undefined ? await wardClientFrom(config.ward) : (options.ward ?? undefined);
  registerWardRoutes(app, ctx, ward);

  return { app, ctx };
}
