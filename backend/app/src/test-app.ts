// Tests only: the real API (createServer) on a temporary database and data folders, plus helpers
// to sign a user in. Each call gets its own folder, so tests don't share state.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { signToken } from "@my-olx/core";
import type { Config } from "@my-olx/core";
import { createServer } from "./create-server.js";
import type { WardClient } from "../vendor/ward/ward-auth.js";

export const TEST_JWT_SECRET = "test-app-secret";

export async function startTestApp(overrides: Partial<Config> = {}, ward: WardClient | null = null) {
  const root = mkdtempSync(path.join(tmpdir(), "piataro-test-"));
  const config: Config = {
    databasePath: path.join(root, "test.db"),
    uploadsDir: path.join(root, "uploads"),
    assetsDir: path.join(root, "assets"),
    publicBaseUrl: "http://localhost:8080",
    jwtSecret: TEST_JWT_SECRET,
    jwtExpirySeconds: 3600,
    corsAllowedOrigins: "http://localhost:5173",
    host: "127.0.0.1",
    port: 0,
    frontendBaseUrl: "http://localhost:5173",
    ...overrides,
  };
  const { app, ctx } = await createServer(config, { ward });
  await app.ready();
  /** An Authorization header for `userId`. */
  const bearer = (userId: string) => ({ authorization: `Bearer ${signToken(userId, TEST_JWT_SECRET, 3600)}` });
  return { app, ctx, config, root, bearer };
}
