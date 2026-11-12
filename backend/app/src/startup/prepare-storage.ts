// Before the app is built: the data folders, the migrations and the asset move. server.ts runs it once at
// start, and the test helper on each temporary folder; buildApp then does no I/O of its own beyond opening
// the database.
import Database from "better-sqlite3";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "@my-olx/core";
import type { Config } from "../config.js";
import { moveAssetsOutOfUploads } from "./move-assets.js";

/** backend/migrations, from app/src/startup (dev) and app/dist/startup (a build) alike. */
const MIGRATIONS_DIR = fileURLToPath(new URL("../../../migrations", import.meta.url));

/** What the preparation did, for the caller to log. */
export interface PreparedStorage {
  /** The migrations applied now, by file name. */
  migrations: string[];
  /** Asset files moved out of the public uploads folder. */
  movedAssets: number;
}

export async function prepareStorage(
  config: Pick<Config, "databasePath" | "uploadsDir" | "assetsDir">,
): Promise<PreparedStorage> {
  await mkdir(path.dirname(config.databasePath), { recursive: true });
  await mkdir(config.uploadsDir, { recursive: true });
  await mkdir(config.assetsDir, { recursive: true });

  const sqliteDb = new Database(config.databasePath);
  try {
    const migrations = runMigrations(sqliteDb, MIGRATIONS_DIR);
    const movedAssets = await moveAssetsOutOfUploads(sqliteDb, config.uploadsDir, config.assetsDir);
    return { migrations, movedAssets };
  } finally {
    sqliteDb.close();
  }
}
