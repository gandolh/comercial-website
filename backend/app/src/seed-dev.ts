/**
 * `npm run seed:dev`: the demo accounts, listings and assets for local development, from
 * `backend/seed/dev/*.sql` in name order. Development only: the accounts share the known password
 * `12345678`, so this refuses to run unless NODE_ENV=development. Applies the migrations first,
 * so it works on a fresh database; the SQL uses INSERT OR IGNORE, so a rerun is harmless.
 */
import Database from "better-sqlite3";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "@my-olx/core";

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.resolve(here, "../../.env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

if (process.env.NODE_ENV !== "development") {
  console.error("seed:dev creates accounts with a known password; it runs only with NODE_ENV=development.");
  process.exit(1);
}

const databasePath = process.env.DATABASE_PATH ?? path.resolve("data/my-olx.db");
await mkdir(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
runMigrations(db, path.resolve(here, "../../migrations"));
const seedDir = path.resolve(here, "../../seed/dev");
for (const file of readdirSync(seedDir).filter((f) => f.endsWith(".sql")).sort()) {
  db.exec(readFileSync(path.join(seedDir, file), "utf8"));
  console.log(`seed:dev applied ${file}`);
}
db.close();
