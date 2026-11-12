// @my-olx/app — the entry: settings, the data folder, the app, shutdown, listen. Nothing else listens.
// The container starts this file (`node app/dist/server.js`, infrastructure/Dockerfile).
import closeWithGrace from "close-with-grace";
import { buildApp } from "./app.js";
import { loadConfig, loadEnvFile } from "./config.js";
import { prepareStorage } from "./startup/prepare-storage.js";

const envFile = loadEnvFile();
const config = loadConfig();
const prepared = await prepareStorage(config);

const { app } = await buildApp(config, {
  reminders: true,
  server: {
    logger: { level: config.logLevel },
    // Caddy fronts the container: believe X-Forwarded-For from these addresses only.
    trustProxy: config.trustedProxies,
    // A socket silent this long mid-request is cut. The longest silent wait is the ANAF lookup (8 s).
    connectionTimeout: 10_000,
    // requestTimeout stays at Fastify's default, 0 (no limit): a 500 MB upload on a slow line takes
    // minutes, and a whole-request limit would cut it. A limit, if one is ever wanted, is per route.
    // Longer than Caddy keeps an idle upstream connection (2 minutes), so Caddy never sends a request
    // down a socket the server has just closed.
    keepAliveTimeout: 125_000,
  },
});
app.log.info(envFile === undefined ? "no .env: settings from the environment" : `settings from ${envFile}`);
if (prepared.migrations.length > 0) app.log.info({ migrations: prepared.migrations }, "applied migrations");
if (prepared.movedAssets > 0)
  app.log.info(`moved ${prepared.movedAssets} asset file(s) out of the public uploads folder into ${config.assetsDir}`);

// SIGINT, SIGTERM, an uncaught error: stop taking requests, finish the ones in flight, run every onClose
// hook (the reminder job stops and the database closes there), and exit. After 10 s it exits anyway.
closeWithGrace({ delay: 10_000, logger: app.log }, async ({ signal, err }) => {
  if (err) app.log.error({ err }, "closing after an uncaught error");
  else app.log.info(`closing on ${signal ?? "request"}`);
  await app.close();
});

await app.listen({ host: config.host, port: config.port });
