import Fastify, { type FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { mkdir } from "node:fs/promises";
import type { Config } from "../config/index.js";
import { getCorsOrigins } from "../config/index.js";

export async function buildApp(config: Config): Promise<FastifyInstance> {
  const logLevel = process.env.LOG_LEVEL ?? "info";

  const app = Fastify({ logger: { level: logLevel } });

  const corsOrigins = getCorsOrigins(config.corsAllowedOrigins);

  await app.register(fastifyCors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    credentials: true,
  });

  await app.register(fastifyCompress);

  await app.register(fastifyMultipart, {
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  });

  // Serve uploaded files at /uploads/<key>
  await mkdir(config.uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: config.uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
  });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
