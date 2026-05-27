import { createHmac, randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { hash, verify } from "argon2";

/**
 * Encodes a Buffer as base64url (RFC 4648 §5)
 */
function base64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decodes base64url back to Buffer
 */
function base64urlDecode(str: string): Buffer {
  let padded = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if necessary
  const remainder = padded.length % 4;
  if (remainder) {
    padded += "=".repeat(4 - remainder);
  }
  return Buffer.from(padded, "base64");
}

/**
 * JWT Claims: { sub, exp, iat? }
 */
interface JWTPayload {
  sub: string;
  exp: number;
  iat?: number;
}

/**
 * Sign a JWT token using HS256.
 * Claims: { sub: userId, exp: unix seconds }
 *
 * @param userId - The user ID to embed in the `sub` claim
 * @param secret - HMAC secret key (shared with verifier)
 * @param expirySeconds - Seconds until the token expires
 * @returns Signed JWT token
 */
export function signToken(userId: string, secret: string, expirySeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: userId,
    exp: now + expirySeconds,
    iat: now,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerEncoded = base64urlEncode(Buffer.from(JSON.stringify(header)));
  const payloadEncoded = base64urlEncode(Buffer.from(JSON.stringify(payload)));

  const message = `${headerEncoded}.${payloadEncoded}`;
  const signature = createHmac("sha256", secret).update(message).digest();
  const signatureEncoded = base64urlEncode(signature);

  return `${message}.${signatureEncoded}`;
}

/**
 * Verify and decode a JWT token.
 * Returns the `sub` (user ID) if valid, throws otherwise.
 *
 * @param token - The JWT token to verify
 * @param secret - HMAC secret key (must match the one used for signing)
 * @returns The user ID (`sub` claim)
 * @throws Error if the token is invalid, tampered, or expired
 */
export function verifyToken(token: string, secret: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const headerEncoded = parts[0];
  const payloadEncoded = parts[1];
  const signatureEncoded = parts[2];

  if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
    throw new Error("Invalid token format");
  }

  // Reconstruct and verify signature
  const message = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = createHmac("sha256", secret).update(message).digest();
  const expectedSignatureEncoded = base64urlEncode(expectedSignature);

  if (signatureEncoded !== expectedSignatureEncoded) {
    throw new Error("Invalid token signature");
  }

  // Decode and validate payload
  let payload: JWTPayload;
  try {
    const decoded = base64urlDecode(payloadEncoded);
    const parsed = JSON.parse(decoded.toString("utf8")) as unknown;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid payload object");
    }
    payload = parsed as JWTPayload;
  } catch (err) {
    throw new Error("Failed to decode token payload");
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    throw new Error("Token expired");
  }

  // Return the subject (user ID)
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid token: missing or invalid 'sub' claim");
  }

  return payload.sub;
}

/**
 * Hash a plain password using Argon2.
 * Use this for user registration.
 *
 * @param plainPassword - The plain text password
 * @returns Hashed password (Argon2 format)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword);
}

/**
 * Verify a plain password against a hash.
 * Returns true if the password matches, false otherwise.
 *
 * @param hash - The Argon2 hash from the database
 * @param plainPassword - The plain text password to check
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(hashValue: string, plainPassword: string): Promise<boolean> {
  try {
    return await verify(hashValue, plainPassword);
  } catch {
    return false;
  }
}

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
 * On failure, throws an error with statusCode 401.
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param secret - JWT secret for verification
 */
export async function authenticationPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  secret: string
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized");
    (err as any).statusCode = 401;
    throw err;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const userId = verifyToken(token, secret);
    request.userId = userId;
  } catch (err) {
    const error = new Error("Unauthorized");
    (error as any).statusCode = 401;
    throw error;
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
