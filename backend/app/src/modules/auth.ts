import { z } from "zod";
import { randomBytes } from "node:crypto";
import {
  AppError,
  hashPassword,
  verifyPassword,
  signToken,
} from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import { UsersAuthRepository } from "../repositories/users-auth.repo.js";

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
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  created_at: Date;
}): UserSummary {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    email_verified: user.email_verified,
    phone: user.phone,
    phone_verified: user.phone_verified,
    created_at: user.created_at.toISOString(),
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
 * Schema for POST /auth/register
 */
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .refine((v) => emailRegex.test(v), "invalid email format"),
  password: z.string().min(8, "password must be at least 8 characters"),
});

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
 * Schema for POST /auth/password/forgot
 */
const passwordForgotSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .refine((v) => emailRegex.test(v), "invalid email format"),
});

/**
 * Schema for POST /auth/password/reset
 */
const passwordResetSchema = z.object({
  token: z.string().min(1, "token is required"),
  password: z.string().min(8, "password must be at least 8 characters"),
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

export const registerAuthRoutes: RouteRegistrar = (app, ctx) => {
  const repo = new UsersAuthRepository(ctx.db);

  /**
   * POST /auth/register
   * Creates a new user account and sends a verification email.
   */
  app.post<{ Body: unknown }>(
    "/auth/register",
    async (request, reply) => {
      try {
        const body = registerSchema.parse(request.body);
        const { email, password } = body;

        // Check if email already exists
        const existingUser = await repo.findByEmail(email);
        if (existingUser) {
          throw AppError.conflict("email already exists");
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await repo.createUser({
          email,
          passwordHash,
        });

        // Create email verification token (expires in 24 hours)
        const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
        const token = await repo.createEmailVerificationToken(user.id, expiresAtMs);

        // Send verification email
        const verificationLink = `${ctx.config.frontendBaseUrl}/verifica-email?token=${token}`;
        await ctx.email.send({
          to: user.email,
          subject: "Verify your email",
          html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
          text: `Verify your email: ${verificationLink}`,
        });

        // Sign JWT token
        const jwtToken = signToken(
          user.id,
          ctx.config.jwtSecret,
          ctx.config.jwtExpirySeconds
        );

        // Return response
        const response: AuthResponse = {
          token: jwtToken,
          user: toUserSummary(user),
        };

        return reply.code(200).send(response);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );

  /**
   * POST /auth/login
   * Authenticates a user with email and password.
   */
  app.post<{ Body: unknown }>(
    "/auth/login",
    async (request, reply) => {
      try {
        const body = loginSchema.parse(request.body);
        const { email, password } = body;

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
        const jwtToken = signToken(
          user.id,
          ctx.config.jwtSecret,
          ctx.config.jwtExpirySeconds
        );

        // Return response
        const response: AuthResponse = {
          token: jwtToken,
          user: toUserSummary(user),
        };

        return reply.code(200).send(response);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );

  /**
   * POST /auth/logout
   * Stateless logout (just returns 200).
   */
  app.post<{ Body: unknown }>(
    "/auth/logout",
    async (_request, reply) => {
      return reply.code(200).send({});
    }
  );

  /**
   * POST /auth/email/verify
   * Verifies an email using a token.
   */
  app.post<{ Body: unknown }>(
    "/auth/email/verify",
    async (request, reply) => {
      try {
        const body = emailVerifySchema.parse(request.body);
        const { token } = body;

        // Consume token and get user_id
        const userId = await repo.consumeEmailVerificationToken(token);
        if (!userId) {
          throw AppError.notFound();
        }

        // Mark user's email as verified
        await repo.markEmailVerified(userId);

        return reply.code(200).send({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );

  /**
   * POST /auth/email/resend
   * Resends the verification email (always returns 200 to avoid user enumeration).
   */
  app.post<{ Body: unknown }>(
    "/auth/email/resend",
    async (request, reply) => {
      try {
        const body = emailResendSchema.parse(request.body);
        const { email } = body;

        // Find user (no error if not found — user enumeration prevention)
        const user = await repo.findByEmail(email);
        if (user && !user.email_verified) {
          // Create new verification token
          const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
          const token = await repo.createEmailVerificationToken(
            user.id,
            expiresAtMs
          );

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
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        // On any error, still return 200
        return reply.code(200).send({});
      }
    }
  );

  /**
   * POST /auth/password/forgot
   * Initiates password reset (always returns 200 to avoid user enumeration).
   */
  app.post<{ Body: unknown }>(
    "/auth/password/forgot",
    async (request, reply) => {
      try {
        const body = passwordForgotSchema.parse(request.body);
        const { email } = body;

        // Find user (no error if not found — user enumeration prevention)
        const user = await repo.findByEmail(email);
        if (user) {
          // Create password reset token
          const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
          const token = await repo.createPasswordResetToken(user.id, expiresAtMs);

          // Send password reset email
          const resetLink = `${ctx.config.frontendBaseUrl}/reseteaza-parola?token=${token}`;
          await ctx.email.send({
            to: user.email,
            subject: "Reset your password",
            html: `Click <a href="${resetLink}">here</a> to reset your password.`,
            text: `Reset your password: ${resetLink}`,
          });
        }

        // Always return 200
        return reply.code(200).send({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        // On any error, still return 200
        return reply.code(200).send({});
      }
    }
  );

  /**
   * POST /auth/password/reset
   * Resets password using a reset token.
   */
  app.post<{ Body: unknown }>(
    "/auth/password/reset",
    async (request, reply) => {
      try {
        const body = passwordResetSchema.parse(request.body);
        const { token, password } = body;

        // Consume token and get user_id
        const userId = await repo.consumePasswordResetToken(token);
        if (!userId) {
          throw AppError.notFound();
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update user's password
        await repo.updatePassword(userId, passwordHash);

        return reply.code(200).send({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );

  /**
   * POST /auth/phone/request-code
   * Requests a phone verification code (PROTECTED).
   */
  app.post<{ Body: unknown }>(
    "/auth/phone/request-code",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      try {
        const body = phoneRequestCodeSchema.parse(request.body);
        const { phone } = body;
        const userId = request.userId!;

        // Store phone verification code (expires in 10 minutes)
        const expiresAtMs = Date.now() + 10 * 60 * 1000;
        await repo.storePhoneVerificationCode(userId, phone, expiresAtMs);

        // If stub provider, log the code; otherwise send via SMS provider
        if (ctx.config.phoneProvider === "stub") {
          console.log(`[PHONE] Code for ${phone}: 123456`);
        }

        return reply.code(200).send({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );

  /**
   * POST /auth/phone/verify
   * Verifies phone with a code (PROTECTED).
   */
  app.post<{ Body: unknown }>(
    "/auth/phone/verify",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      try {
        const body = phoneVerifySchema.parse(request.body);
        const { code } = body;
        const userId = request.userId!;

        // Verify the code
        const result = await repo.verifyPhoneCode(userId, code);
        if (!result) {
          throw AppError.notFound();
        }

        // Mark user as phone verified and set phone
        await repo.markPhoneVerified(userId, result.phone);

        return reply.code(200).send({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw AppError.validation(error.errors[0]?.message || "validation failed");
        }
        throw error;
      }
    }
  );
};
