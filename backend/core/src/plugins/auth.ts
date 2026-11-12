import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../lib/api-error.js";
import { verifyToken } from "../lib/tokens.js";

/**
 * Module augmentation for FastifyRequest and FastifyReply
 */
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Fastify preHandler to authenticate requests using Bearer token.
 * Extracts the token from the `Authorization: Bearer <token>` header,
 * verifies it, and sets `request.userId` on success.
 * On failure, throws `AppError.unauthorized()` (401).
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param secret - JWT secret for verification
 */
export async function authenticationPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  secret: string,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized();
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const userId = verifyToken(token, secret);
    request.userId = userId;
  } catch {
    // An AppError, so the error handler answers 401; a plain Error with a statusCode came out as 500.
    throw AppError.unauthorized();
  }
}

/**
 * Register authentication on a Fastify app.
 * Decorates the app with an `authenticate` preHandler and sets up JWT error handling.
 *
 * @param app - Fastify instance
 * @param secret - JWT secret for signing/verifying tokens
 */
export function registerAuth(app: FastifyInstance, secret: string): void {
  app.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    await authenticationPreHandler(request, reply, secret);
  });
}
