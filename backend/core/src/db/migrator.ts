import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type pg from "pg";

/**
 * Minimal SQL migrator: runs every `*.sql` file in `migrationsDir` in filename
 * order exactly once, tracked in a `_migrations` table. Each file runs inside a
 * transaction. Mirrors the behaviour sqlx::migrate! gave the old Rust backend.
 */
export async function runMigrations(
  pool: pg.Pool,
  migrationsDir: string,
): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name        TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const entries = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const appliedRows = await pool.query<{ name: string }>(
    "SELECT name FROM _migrations",
  );
  const applied = new Set(appliedRows.rows.map((r) => r.name));

  const ran: string[] = [];
  for (const name of entries) {
    if (applied.has(name)) continue;

    const sql = await readFile(path.join(migrationsDir, name), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      ran.push(name);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${name} failed: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }
  return ran;
}
