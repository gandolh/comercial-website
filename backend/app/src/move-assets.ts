import { existsSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import path from "node:path";
import type Database from "better-sqlite3";

/**
 * Move every asset file still under the publicly served uploads folder into the assets folder.
 * Until 2026-11-03 assets were stored beside listing images, so anyone with a key could fetch a
 * paid file from `/uploads/` without an order. Runs at start; a file already moved is skipped.
 * Returns how many files moved.
 */
export async function moveAssetsOutOfUploads(db: Database.Database, uploadsDir: string, assetsDir: string): Promise<number> {
  const rows = db.prepare("SELECT s3_key FROM listing_assets").all() as { s3_key: string }[];
  let moved = 0;
  for (const { s3_key } of rows) {
    const from = path.join(uploadsDir, s3_key);
    const to = path.join(assetsDir, s3_key);
    if (!existsSync(from) || existsSync(to)) continue;
    await mkdir(path.dirname(to), { recursive: true });
    await rename(from, to);
    moved += 1;
  }
  return moved;
}
