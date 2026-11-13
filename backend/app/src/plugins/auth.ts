import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
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

export interface AuthOptions {
  /** JWT secret for verifying tokens (the config's `jwtSecret`). */
  secret: string;
}

/**
 * Authentication, wrapped in fastify-plugin so it reaches every route: decorates the app with the
 * `authenticate` preHandler (the one decorator, listed in scripts/conventions.json), which protected
 * routes name in their options.
 */
const authPlugin: FastifyPluginAsync<AuthOptions> = async (app, { secret }) => {
  app.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    await authenticationPreHandler(request, reply, secret);
  });
};

export const auth = fp(authPlugin, { name: "auth" });

/**
 * The signed-in user's id. The `authenticate` preHandler sets it before a protected handler runs, so a miss
 * here means a route forgot the preHandler: answer 401 instead of carrying an undefined id into a query.
 */
export function requireUserId(request: FastifyRequest): string {
  if (request.userId === undefined) throw AppError.unauthorized();
  return request.userId;
}
