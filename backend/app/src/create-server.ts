// Builds the API: data folders, migrations, the asset move, the Fastify app and every route.
// server.ts listens on it; tests build the same app on a temporary database (test-app.ts).
import {
  buildApp,
  createDb,
  createEmailService,
  registerAuth,
  registerErrorHandler,
  StorageService,
} from "@my-olx/core";
import type { AppContext } from "./context.js";
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
import { moveAssetsOutOfUploads } from "./move-assets.js";
import { registerWardRoutes } from "./modules/ward.js";
import { wardClientFromEnv } from "./ward-client.js";
import type { WardClient } from "../vendor/ward/ward-auth.js";
import { runMigrations } from "@my-olx/core";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

import type { FastifyInstance } from "fastify";
import type { Config } from "@my-olx/core";

/**
 * `ward` overrides the client the `WARD_OIDC_*` settings would make: tests pass a fake, or `null`
 * for local login only.
 */
export async function createServer(
  config: Config,
  options: { ward?: WardClient | null } = {},
): Promise<{ app: FastifyInstance; ctx: AppContext }> {
  // Ensure data directories exist
  await mkdir(path.dirname(config.databasePath), { recursive: true });
  await mkdir(config.uploadsDir, { recursive: true });
  await mkdir(config.assetsDir, { recursive: true });

  // Run migrations before starting the server
  const here = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.resolve(here, "../../migrations");
  const sqliteDb = new Database(config.databasePath);
  const ran = runMigrations(sqliteDb, migrationsDir);
  if (ran.length > 0) {
    console.log(`Applied ${ran.length} migration(s):`, ran);
  }
  const movedAssets = await moveAssetsOutOfUploads(sqliteDb, config.uploadsDir, config.assetsDir);
  if (movedAssets > 0) {
    console.log(`Moved ${movedAssets} asset file(s) out of the public uploads folder into ${config.assetsDir}`);
  }
  sqliteDb.close();

  const app = await buildApp(config);
  registerErrorHandler(app);
  registerAuth(app, config.jwtSecret);

  const ctx: AppContext = {
    db: createDb(config.databasePath),
    config,
    storage: new StorageService({ uploadsDir: config.uploadsDir, publicBaseUrl: config.publicBaseUrl }),
    assetStorage: new StorageService({ uploadsDir: config.assetsDir, publicBaseUrl: config.publicBaseUrl }),
    email: createEmailService({}),
  };

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
  const ward = options.ward === undefined ? await wardClientFromEnv() : (options.ward ?? undefined);
  registerWardRoutes(app, ctx, ward);

  return { app, ctx };
}
