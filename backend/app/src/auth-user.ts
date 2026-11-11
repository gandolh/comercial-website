import { AppError } from "@my-olx/core";
import type { FastifyRequest } from "fastify";

/**
 * The signed-in user's id. The `authenticate` preHandler sets it before a protected handler runs, so a miss
 * here means a route forgot the preHandler: answer 401 instead of carrying an undefined id into a query.
 */
export function requireUserId(request: FastifyRequest): string {
  if (request.userId === undefined) throw AppError.unauthorized();
  return request.userId;
}
