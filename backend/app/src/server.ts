// @my-olx/app — Fastify entrypoint for the digital-asset marketplace.
// Reuses the @my-olx/core engine and wires the implementation route modules.
import {
  buildApp,
  createDb,
  createEmailService,
  createS3Client,
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
import { registerMessagingRoutes } from "./modules/messaging.js";
import { registerLocationsRoutes } from "./modules/locations.js";

async function main(): Promise<void> {
  const config = loadConfig();

  const app = await buildApp(config);
  registerErrorHandler(app);
  registerAuth(app, config.jwtSecret);

  const storageConfig = {
    region: config.awsRegion,
    bucket: config.awsS3Bucket,
    endpointUrl: config.awsEndpointUrl,
    publicBaseUrl: config.s3PublicBaseUrl,
  };
  const ctx: AppContext = {
    db: createDb(config.databaseUrl),
    config,
    storage: new StorageService(createS3Client(storageConfig), storageConfig),
    email: createEmailService({
      host: config.smtpHost,
      port: config.smtpPort,
      username: config.smtpUsername,
      password: config.smtpPassword,
      from: config.smtpFrom,
    }),
  };

  registerAuthRoutes(app, ctx);
  registerUsersRoutes(app, ctx);
  registerFavoritesRoutes(app, ctx);
  registerListingsRoutes(app, ctx);
  registerImagesRoutes(app, ctx);
  registerMessagingRoutes(app, ctx);
  registerLocationsRoutes(app, ctx);

  await app.listen({ host: config.host, port: config.port });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
