import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";

/** What the HTTP plugins need from the app's settings. */
export interface HttpOptions {
  /** The origins CORS allows, each one whole (`http://localhost:5173`). */
  corsOrigins: string[];
  /** The public uploads folder, served at `/uploads/`. prepareStorage creates it before the app is built. */
  uploadsDir: string;
}

/**
 * CORS, compression, multipart (500 MB a file) and the static `/uploads/` route, wrapped in
 * fastify-plugin so they reach every route.
 */
const httpPlugin: FastifyPluginAsync<HttpOptions> = async (app, options) => {
  await app.register(fastifyCors, {
    origin: options.corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    credentials: true,
  });

  await app.register(fastifyCompress);

  await app.register(fastifyMultipart, {
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  });

  // Serve uploaded files at /uploads/<key>
  await app.register(fastifyStatic, {
    root: options.uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
  });
};

export const http = fp(httpPlugin, { name: "http" });
