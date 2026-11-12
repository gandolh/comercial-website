import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";

/** GET /health: the container's health check (infrastructure/Dockerfile). */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", { schema: { response: { 200: z.object({ status: z.literal("ok") }) } } }, async () => ({
    status: "ok" as const,
  }));
};
