import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./schema.js";

export * from "./schema.js";
export { runMigrations } from "./migrator.js";

/**
 * BIGINT (OID 20) comes back from node-postgres as a string by default to avoid
 * precision loss. Our bigint columns (price_ron, view_count, bytes) fit safely in
 * a JS number, and the rest of the code treats them as numbers — parse them here.
 */
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

export type Db = Kysely<Database>;

let pool: pg.Pool | undefined;

export function createPool(databaseUrl: string): pg.Pool {
  pool = new pg.Pool({ connectionString: databaseUrl });
  return pool;
}

export function createDb(databaseUrl: string): Db {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: createPool(databaseUrl) }),
  });
}
