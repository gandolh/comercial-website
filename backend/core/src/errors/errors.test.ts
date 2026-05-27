import { describe, it, expect } from "vitest";
import { AppError } from "./index.js";

describe("AppError", () => {
  describe("factories", () => {
    it("notFound returns 404 with 'not found'", () => {
      const error = AppError.notFound();
      expect(error.statusCode).toBe(404);
      expect(error.publicMessage).toBe("not found");
    });

    it("unauthorized returns 401 with 'unauthorized'", () => {
      const error = AppError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.publicMessage).toBe("unauthorized");
    });

    it("forbidden returns 403 with 'forbidden'", () => {
      const error = AppError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.publicMessage).toBe("forbidden");
    });

    it("validation returns 422 with provided message", () => {
      const msg = "email is required";
      const error = AppError.validation(msg);
      expect(error.statusCode).toBe(422);
      expect(error.publicMessage).toBe(msg);
    });

    it("conflict returns 409 with provided message", () => {
      const msg = "email already in use";
      const error = AppError.conflict(msg);
      expect(error.statusCode).toBe(409);
      expect(error.publicMessage).toBe(msg);
    });

    it("rateLimit returns 429 with 'rate limit exceeded'", () => {
      const error = AppError.rateLimit();
      expect(error.statusCode).toBe(429);
      expect(error.publicMessage).toBe("rate limit exceeded");
    });

    it("internal returns 500 with 'internal error' and optional cause", () => {
      const cause = new Error("db connection failed");
      const error = AppError.internal(cause);
      expect(error.statusCode).toBe(500);
      expect(error.publicMessage).toBe("internal error");
      expect(error.cause).toBe(cause);
    });

    it("internal without cause still works", () => {
      const error = AppError.internal();
      expect(error.statusCode).toBe(500);
      expect(error.publicMessage).toBe("internal error");
      expect(error.cause).toBeUndefined();
    });
  });

  describe("instance checks", () => {
    it("is an instanceof Error", () => {
      const error = AppError.notFound();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("can be caught and re-thrown", () => {
      const error = AppError.validation("test");
      expect(() => {
        throw error;
      }).toThrow(AppError);
      expect(() => {
        throw error;
      }).toThrow("test");
    });
  });
});
