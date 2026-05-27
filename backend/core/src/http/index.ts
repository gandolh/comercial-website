import Fastify, { type FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import type { Config } from "../config/index.js";
import { getCorsOrigins } from "../config/index.js";

export async function buildApp(config: Config): Promise<FastifyInstance> {
  const logLevel = process.env.LOG_LEVEL ?? "info";

  const app = Fastify({
    logger: {
      level: logLevel,
    },
  });

  const corsOrigins = getCorsOrigins(config.corsAllowedOrigins);

  await app.register(fastifyCors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    credentials: true,
  });

  await app.register(fastifyCompress);

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
