/**
 * `npm run seed:dev`: the demo accounts, listings and assets for local development, from
 * `backend/seed/dev/*.sql` in name order. Development only: the accounts share the known password
 * `12345678`, so it refuses to run outside development (`loadDevSeedConfig`). Applies the migrations first,
 * so it works on a fresh database; the SQL uses INSERT OR IGNORE, so a rerun is harmless.
 */
import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "@my-olx/core";
import { ConfigError, loadDevSeedConfig, loadEnvFile } from "./config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
loadEnvFile();

let databasePath: string;
try {
  ({ databasePath } = loadDevSeedConfig());
} catch (err) {
  if (!(err instanceof ConfigError)) throw err;
  console.error(err.message);
  process.exit(1);
}
await mkdir(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
runMigrations(db, path.resolve(here, "../../migrations"));
const seedDir = path.resolve(here, "../../seed/dev");
for (const file of readdirSync(seedDir)
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  db.exec(readFileSync(path.join(seedDir, file), "utf8"));
  console.log(`seed:dev applied ${file}`);
}
db.close();
