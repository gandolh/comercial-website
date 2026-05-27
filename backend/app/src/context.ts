// Shared application context: the wired dependencies every route module receives.
// server.ts builds this once and passes it to each route registrar.
import type { Db } from "@my-olx/core";
import type { Config, EmailService, StorageService } from "@my-olx/core";

export interface AppContext {
  db: Db;
  config: Config;
  storage: StorageService;
  email: EmailService;
}

/**
 * A route module exports a `register` function of this shape. server.ts collects
 * them and registers each under the app. Each module declares its own routes
 * (full paths, e.g. "/auth/login") and uses `app.authenticate` (from @my-olx/core
 * registerAuth) as a preHandler for protected routes.
 */
import type { FastifyInstance } from "fastify";
export type RouteRegistrar = (app: FastifyInstance, ctx: AppContext) => void;
