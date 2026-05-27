// Runs all SQL migrations in backend/migrations against DATABASE_URL.
// Usage: npm run migrate  (from backend/ or backend/app/)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPool, runMigrations } from "@my-olx/core";
import { loadConfig } from "@my-olx/core";

const here = path.dirname(fileURLToPath(import.meta.url));
// src/migrate.ts -> ../../migrations (backend/migrations)
const migrationsDir = path.resolve(here, "../../migrations");

async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  try {
    const ran = await runMigrations(pool, migrationsDir);
    if (ran.length === 0) {
      console.log("No pending migrations.");
    } else {
      console.log(`Applied ${ran.length} migration(s):`);
      for (const name of ran) console.log(`  - ${name}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
