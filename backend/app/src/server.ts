// @my-olx/app — Fastify entrypoint for the digital-asset marketplace.
import { loadConfig } from "@my-olx/core";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "./create-server.js";
import { startExpiryReminderJob } from "./jobs/expiry-reminders.js";

// backend/.env, two levels up from app/src (dev) and from app/dist (a build). Optional: a container
// passes real environment variables and has no file. Read before loadConfig() runs in main().
const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

async function main(): Promise<void> {
  const config = loadConfig();
  const { app, ctx } = await createServer(config);

  await app.listen({ host: config.host, port: config.port });

  if (process.env.NODE_ENV !== "test") {
    startExpiryReminderJob(ctx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
