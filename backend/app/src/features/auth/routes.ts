import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/api-error.js";
import { verifyPassword, signToken } from "../../lib/tokens.js";
import type { AppContext } from "../../context.js";
import { UsersAuthRepository } from "./store.js";
import { requireUserId } from "../../plugins/auth.js";

/**
 * Type-safe UserSummary response object.
 */
interface UserSummary {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: UserSummary;
}

/**
 * Convert a user database row to UserSummary.
 */
function toUserSummary(user: {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: number | boolean;
  phone: string | null;
  phone_verified: number | boolean;
  created_at: string | Date;
}): UserSummary {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    email_verified: Boolean(user.email_verified),
    phone: user.phone,
    phone_verified: Boolean(user.phone_verified),
    created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
  };
}

/**
 * Email validation regex (standard RFC-ish pattern).
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex: ^(\+40|0)7\d{8}$
 */
const phoneRegex = /^(\+40|0)7\d{8}$/;

/**
 * Schema for POST /auth/login
 */
const loginSchema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "password is required"),
});

/**
 * Schema for POST /auth/email/verify
 */
const emailVerifySchema = z.object({
  token: z.string().min(1, "token is required"),
});

/**
 * Schema for POST /auth/email/resend
 */
const emailResendSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .refine((v) => emailRegex.test(v), "invalid email format"),
});

/**
 * Schema for POST /auth/phone/request-code
 */
const phoneRequestCodeSchema = z.object({
  phone: z
    .string()
    .min(1, "phone is required")
    .refine((v) => phoneRegex.test(v), "invalid phone format"),
});

/**
 * Schema for POST /auth/phone/verify
 */
const phoneVerifySchema = z.object({
  code: z
    .string()
    .length(6, "code must be exactly 6 digits")
    .refine((v) => /^\d{6}$/.test(v), "code must contain only digits"),
});

// ─── Reply schemas: output only, separate from the input ones ────────────────

const userSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  email_verified: z.boolean(),
  phone: z.string().nullable(),
  phone_verified: z.boolean(),
  created_at: z.string(),
});

const authReplySchema = z.object({ token: z.string(), user: userSummarySchema });

/** The empty acknowledgement most auth routes answer. */
const emptyReplySchema = z.object({});

export const authRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  const repo = new UsersAuthRepository(ctx.db);

  /**
   * POST /auth/register — closed. Only the owner signs in (the demo decision of 2026-11-03); their
   * account is made by `npm run create-owner` at deploy.
   */
  // It reads nothing and answers only 403, which the error plugin writes: an empty schema.
  app.post("/auth/register", { schema: {} }, async () => {
    throw AppError.forbidden();
  });

  /**
   * POST /auth/login
   * Authenticates a user with email and password.
   */
  app.post(
    "/auth/login",
    { schema: { body: loginSchema, response: { 200: authReplySchema } } },
    async (request, reply) => {
      const { email, password } = request.body;

      // Find user by email
      const user = await repo.findByEmail(email);
      if (!user) {
        throw AppError.unauthorized();
      }

      // Verify password
      const passwordMatch = await verifyPassword(user.password_hash, password);
      if (!passwordMatch) {
        throw AppError.unauthorized();
      }

      // Sign JWT token
      const jwtToken = signToken(user.id, ctx.config.jwtSecret, ctx.config.jwtExpirySeconds);

      // Return response
      const response: AuthResponse = {
        token: jwtToken,
        user: toUserSummary(user),
      };

      return reply.code(200).send(response);
    },
  );

  /**
   * POST /auth/logout
   * Stateless logout (just returns 200).
   */
  app.post("/auth/logout", { schema: { response: { 200: emptyReplySchema } } }, async (_request, reply) => {
    return reply.code(200).send({});
  });

  /**
   * POST /auth/email/verify
   * Verifies an email using a token.
   */
  app.post(
    "/auth/email/verify",
    { schema: { body: emailVerifySchema, response: { 200: emptyReplySchema } } },
    async (request, reply) => {
      const { token } = request.body;

      // Consume token and get user_id
      const userId = await repo.consumeEmailVerificationToken(token);
      if (!userId) {
        throw AppError.notFound();
      }

      // Mark user's email as verified
      await repo.markEmailVerified(userId);

      return reply.code(200).send({});
    },
  );

  /**
   * POST /auth/email/resend
   * Resends the verification email (always returns 200 to avoid user enumeration).
   */
  app.post(
    "/auth/email/resend",
    { schema: { body: emailResendSchema, response: { 200: emptyReplySchema } } },
    async (request, reply) => {
      try {
        const { email } = request.body;

        // Find user (no error if not found — user enumeration prevention)
        const user = await repo.findByEmail(email);
        if (user && !user.email_verified) {
          // Create new verification token
          const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
          const token = await repo.createEmailVerificationToken(user.id, expiresAtMs);

          // Send email
          const verificationLink = `${ctx.config.frontendBaseUrl}/verifica-email?token=${token}`;
          await ctx.email.send({
            to: user.email,
            subject: "Verify your email",
            html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
            text: `Verify your email: ${verificationLink}`,
          });
        }

        // Always return 200
        return reply.code(200).send({});
      } catch {
        // On any error, still return 200
        return reply.code(200).send({});
      }
    },
  );

  // The password reset (forgot + reset) was removed on 2026-11-03: it works by email, and the demo
  // sends none. The owner resets their password with `npm run create-owner`.

  /**
   * POST /auth/phone/request-code
   * Requests a phone verification code (PROTECTED).
   */
  app.post(
    "/auth/phone/request-code",
    { preHandler: app.authenticate, schema: { body: phoneRequestCodeSchema, response: { 200: emptyReplySchema } } },
    async (request, reply) => {
      const { phone } = request.body;
      const userId = requireUserId(request);

      // Store phone verification code (expires in 10 minutes)
      const expiresAtMs = Date.now() + 10 * 60 * 1000;
      await repo.storePhoneVerificationCode(userId, phone, expiresAtMs);

      // If stub provider, log the code; otherwise send via SMS provider
      // Phone provider is always stub (no SMS service configured)
      request.log.info(`[PHONE] Code for ${phone}: 123456`);

      return reply.code(200).send({});
    },
  );

  /**
   * POST /auth/phone/verify
   * Verifies phone with a code (PROTECTED).
   */
  app.post(
    "/auth/phone/verify",
    { preHandler: app.authenticate, schema: { body: phoneVerifySchema, response: { 200: emptyReplySchema } } },
    async (request, reply) => {
      const { code } = request.body;
      const userId = requireUserId(request);

      // Verify the code
      const result = await repo.verifyPhoneCode(userId, code);
      if (!result) {
        throw AppError.notFound();
      }

      // Mark user as phone verified and set phone
      await repo.markPhoneVerified(userId, result.phone);

      return reply.code(200).send({});
    },
  );
};
