import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Minimal SQL migrator for SQLite: runs every `*.sql` file in `migrationsDir`
 * in filename order exactly once, tracked in a `_migrations` table.
 * Each file runs inside a transaction.
 */
export function runMigrations(db: Database.Database, migrationsDir: string): string[] {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name        TEXT PRIMARY KEY,
      applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const entries = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = new Set(
    (db.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name)
  );

  const ran: string[] = [];
  for (const name of entries) {
    if (applied.has(name)) continue;

    const sql = readFileSync(path.join(migrationsDir, name), "utf8");
    const insert = db.prepare("INSERT INTO _migrations (name) VALUES (?)");

    try {
      db.transaction(() => {
        db.exec(sql);
        insert.run(name);
      })();
      ran.push(name);
    } catch (err) {
      throw new Error(`Migration ${name} failed: ${(err as Error).message}`);
    }
  }
  return ran;
}
