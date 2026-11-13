import { hasZodFastifySchemaValidationErrors, ResponseSerializationError } from "@fastify/type-provider-zod";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../lib/api-error.js";

/** The status a thrown value carries, if it carries one (Fastify's own errors and its plugins' do). */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

/**
 * The one error handler and the 404 handler, in the body the frontend reads: `{ error: "<message>" }`.
 * Wrapped in fastify-plugin, so they are set on the root and every route inherits them. In order:
 *
 * 1. `AppError` answers its status with its public message (a route's fixed validation message included).
 * 2. A request that fails its route schema answers 422 with the first issue's message.
 * 3. A `ZodError` thrown in a handler answers 422 the same way.
 * 4. A reply that doesn't match its response schema is a 500 `internal error`, logged, never shown.
 * 5. A 4xx that Fastify or a plugin raised (bad JSON, a body too large, an unsupported media type, a
 *    request that isn't multipart) keeps its status and its message, which were written for clients.
 * 6. Anything else is a 500 `internal error`, logged with the request. A thrown message never reaches
 *    the client.
 */
const errorHandling: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) request.log.error({ err: error.cause ?? error }, error.publicMessage);
      return reply.code(error.statusCode).send({ error: error.publicMessage });
    }

    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(422).send({ error: error.validation[0]?.message ?? "validation failed" });
    }

    if (error instanceof ZodError) {
      return reply.code(422).send({ error: error.issues[0]?.message || "validation failed" });
    }

    if (error instanceof ResponseSerializationError) {
      // A handler sent what its response schema doesn't allow: a bug to fix, never the client's fault. The
      // reply's own values stay out of the log.
      request.log.error(
        { code: error.code, method: error.method, url: error.url },
        "the reply doesn't match its response schema",
      );
      return reply.code(500).send({ error: "internal error" });
    }

    const status = statusOf(error);
    if (status !== undefined && status >= 400 && status < 500) {
      return reply.code(status).send({ error: error instanceof Error ? error.message : "bad request" });
    }

    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ error: "internal error" });
  });

  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ error: "not found" }));
};

export const errors = fp(errorHandling, { name: "errors" });
