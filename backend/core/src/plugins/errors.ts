import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../lib/api-error.js";

/**
 * Check if an error is an AppError instance.
 */
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if an error is a Zod validation error.
 */
function isZodError(error: unknown): error is ZodError<unknown> {
  return error instanceof ZodError;
}

/**
 * Check if an error is a Fastify validation error.
 */
function isFastifyValidationError(error: unknown): error is Error & { validation?: unknown } {
  return error instanceof Error && typeof error === "object" && "validation" in error && error.validation !== undefined;
}

/**
 * Register the global error handler with Fastify.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(async (error, request, reply) => {
    // AppError — use its statusCode and publicMessage
    if (isAppError(error)) {
      return reply.code(error.statusCode).send({
        error: error.publicMessage,
      });
    }

    // Fastify validation error
    if (isFastifyValidationError(error)) {
      const message = error.message || "validation failed";
      return reply.code(422).send({
        error: message,
      });
    }

    // Zod validation error
    if (isZodError(error)) {
      const message = error.issues[0]?.message || "validation failed";
      return reply.code(422).send({
        error: message,
      });
    }

    // Fallback: log and return 500
    request.log.error(error);
    return reply.code(500).send({
      error: "internal error",
    });
  });
}
