// @my-olx/app — Fastify entrypoint for the digital-asset marketplace.
import {
  buildApp,
  createDb,
  createEmailService,
  loadConfig,
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
import { runMigrations } from "@my-olx/core";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

async function main(): Promise<void> {
  const config = loadConfig();

  // Ensure data directories exist
  await mkdir(path.dirname(config.databasePath), { recursive: true });
  await mkdir(config.uploadsDir, { recursive: true });

  // Run migrations before starting the server
  const here = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.resolve(here, "../../migrations");
  const sqliteDb = new Database(config.databasePath);
  const ran = runMigrations(sqliteDb, migrationsDir);
  if (ran.length > 0) {
    console.log(`Applied ${ran.length} migration(s):`, ran);
  }
  sqliteDb.close();

  const app = await buildApp(config);
  registerErrorHandler(app);
  registerAuth(app, config.jwtSecret);

  const ctx: AppContext = {
    db: createDb(config.databasePath),
    config,
    storage: new StorageService({ uploadsDir: config.uploadsDir, publicBaseUrl: config.publicBaseUrl }),
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

  await app.listen({ host: config.host, port: config.port });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
