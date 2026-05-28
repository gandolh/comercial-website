// Runs all SQL migrations in backend/migrations against DATABASE_PATH.
// Usage: npm run migrate  (from backend/ or backend/app/)
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { runMigrations } from "@my-olx/core";
import { loadConfig } from "@my-olx/core";

const here = path.dirname(fileURLToPath(import.meta.url));
// src/migrate.ts -> ../../migrations (backend/migrations)
const migrationsDir = path.resolve(here, "../../migrations");

async function main(): Promise<void> {
  const config = loadConfig();
  const db = new Database(config.databasePath);
  try {
    const ran = runMigrations(db, migrationsDir);
    if (ran.length === 0) {
      console.log("No pending migrations.");
    } else {
      console.log(`Applied ${ran.length} migration(s):`);
      for (const name of ran) console.log(`  - ${name}`);
    }
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
