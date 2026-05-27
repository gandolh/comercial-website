import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

/**
 * AppError — domain error class mirroring the Rust backend's error enum.
 * Each instance carries statusCode and publicMessage for HTTP responses.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly publicMessage: string,
    public readonly cause?: unknown,
  ) {
    super(publicMessage);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(): AppError {
    return new AppError(404, "not found");
  }

  static unauthorized(): AppError {
    return new AppError(401, "unauthorized");
  }

  static forbidden(): AppError {
    return new AppError(403, "forbidden");
  }

  static validation(message: string): AppError {
    return new AppError(422, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static rateLimit(): AppError {
    return new AppError(429, "rate limit exceeded");
  }

  static internal(cause?: unknown): AppError {
    return new AppError(500, "internal error", cause);
  }
}

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
function isFastifyValidationError(
  error: unknown,
): error is Error & { validation?: unknown } {
  return (
    error instanceof Error &&
    typeof error === "object" &&
    "validation" in error &&
    error.validation !== undefined
  );
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
      const message =
        error.message || "validation failed";
      return reply.code(422).send({
        error: message,
      });
    }

    // Zod validation error
    if (isZodError(error)) {
      const message =
        (error as ZodError).errors[0]?.message || "validation failed";
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
