/**
 * `npm run create-owner`: create or update the demo's one account, the owner's, from OWNER_EMAIL,
 * OWNER_PASSWORD and OWNER_NAME (sign-up is closed; corpus decisions.md). Idempotent: a rerun with
 * the same values changes nothing but the password hash, and a new OWNER_PASSWORD resets the
 * password. The email counts as verified. Applies the migrations first, so it works on a fresh database.
 *
 * `--if-missing` creates the account and leaves an existing one alone. The deploy runs it that way on
 * every deploy, so a password changed in Settings stays changed; a reset is a run without the flag.
 */
import Database from "better-sqlite3";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, runMigrations } from "@my-olx/core";
import { ConfigError, loadEnvFile, loadOwnerConfig } from "./config.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export async function createOwner(
  db: Database.Database,
  owner: { email: string; password: string; name: string },
  opts: { ifMissing?: boolean } = {},
): Promise<"created" | "updated" | "kept"> {
  const email = owner.email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE lower(email) = ?").get(email) as { id: string } | undefined;
  if (existing && opts.ifMissing) return "kept";
  const passwordHash = await hashPassword(owner.password);
  if (existing) {
    db.prepare(
      "UPDATE users SET password_hash = ?, display_name = ?, email_verified = 1, updated_at = datetime('now') WHERE id = ?",
    ).run(passwordHash, owner.name, existing.id);
    return "updated";
  }
  db.prepare("INSERT INTO users (email, password_hash, display_name, email_verified) VALUES (?, ?, ?, 1)").run(
    email,
    passwordHash,
    owner.name,
  );
  return "created";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  loadEnvFile();
  let owner: ReturnType<typeof loadOwnerConfig>;
  try {
    owner = loadOwnerConfig();
  } catch (err) {
    if (!(err instanceof ConfigError)) throw err;
    console.error(err.message);
    process.exit(1);
  }
  const { email, password, name, databasePath } = owner;
  await mkdir(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  runMigrations(db, path.resolve(here, "../../migrations"));
  const result = await createOwner(db, { email, password, name }, { ifMissing: process.argv.includes("--if-missing") });
  db.close();
  console.log(`create-owner: ${result} ${email.trim().toLowerCase()}`);
}
