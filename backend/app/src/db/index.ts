import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DbSchema } from "./schema.js";

export * from "./schema.js";
export { runMigrations } from "./migrator.js";

export type Db = Kysely<DbSchema>;

export function createDb(databasePath: string): Db {
  return new Kysely<DbSchema>({
    dialect: new SqliteDialect({
      database: new Database(databasePath),
    }),
  });
}
