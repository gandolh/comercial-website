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
import { startExpiryReminderJob } from "./jobs/expiry-reminders.js";
import { registerReviewsRoutes } from "./modules/reviews.js";
import { registerBundlesRoutes } from "./modules/bundles.js";
import { runMigrations } from "@my-olx/core";
import Database from "better-sqlite3";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

// backend/.env, two levels up from app/src (dev) and from app/dist (a build). Optional: a container
// passes real environment variables and has no file. Read before loadConfig() runs in main().
const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

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
  registerReviewsRoutes(app, ctx);
  registerBundlesRoutes(app, ctx);

  await app.listen({ host: config.host, port: config.port });

  if (process.env.NODE_ENV !== "test") {
    startExpiryReminderJob(ctx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
