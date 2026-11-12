import type { FastifyInstance } from "fastify";

/** GET /health: the container's health check (infrastructure/Dockerfile). */
export function registerHealthRoutes(app: FastifyInstance): void {
  app.get("/health", async () => ({ status: "ok" }));
}
