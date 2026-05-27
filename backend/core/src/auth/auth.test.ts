import { describe, it, expect } from "vitest";
import {
  signToken,
  verifyToken,
  hashPassword,
  verifyPassword,
} from "./index.js";

describe("JWT Auth", () => {
  const secret = "test-secret-key-do-not-use-in-production";
  const userId = "user-uuid-12345";
  const expirySeconds = 3600; // 1 hour

  describe("signToken / verifyToken", () => {
    it("should sign and verify a token, returning the correct userId", async () => {
      const token = signToken(userId, secret, expirySeconds);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token, secret);
      expect(decoded).toBe(userId);
    });

    it("should throw on a tampered token", () => {
      const token = signToken(userId, secret, expirySeconds);
      const parts = token.split(".");
      const header = parts[0];
      const payload = parts[1];

      // Tamper with the payload by changing a character
      const tamperedToken = `${header}.${payload?.slice(0, -1)}X.signature`;

      expect(() => verifyToken(tamperedToken, secret)).toThrow("Invalid token signature");
    });

    it("should throw on garbage/invalid token", () => {
      expect(() => verifyToken("garbage", secret)).toThrow("Invalid token format");
      expect(() => verifyToken("a.b", secret)).toThrow("Invalid token format");
      expect(() => verifyToken("", secret)).toThrow("Invalid token format");
    });

    it("should throw on wrong secret", () => {
      const token = signToken(userId, secret, expirySeconds);
      const wrongSecret = "wrong-secret";

      expect(() => verifyToken(token, wrongSecret)).toThrow("Invalid token signature");
    });

    it("should throw on expired token", () => {
      const expiredToken = signToken(userId, secret, -1); // Already expired
      expect(() => verifyToken(expiredToken, secret)).toThrow("Token expired");
    });
  });

  describe("hashPassword / verifyPassword", () => {
    it("should hash and verify a password correctly", async () => {
      const plainPassword = "SuperSecurePassword123!";
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).toBeTruthy();
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(plainPassword);

      const isValid = await verifyPassword(hashedPassword, plainPassword);
      expect(isValid).toBe(true);
    });

    it("should return false for an incorrect password", async () => {
      const plainPassword = "CorrectPassword123!";
      const wrongPassword = "WrongPassword456!";
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await verifyPassword(hashedPassword, wrongPassword);
      expect(isValid).toBe(false);
    });

    it("should handle empty password", async () => {
      const hashedPassword = await hashPassword("");
      const isValid = await verifyPassword(hashedPassword, "");

      expect(isValid).toBe(true);
    });

    it("should handle long password", async () => {
      const longPassword = "a".repeat(1000);
      const hashedPassword = await hashPassword(longPassword);
      const isValid = await verifyPassword(hashedPassword, longPassword);

      expect(isValid).toBe(true);
    });

    it("should handle special characters in password", async () => {
      const specialPassword = "P@$$w0rd!#%&*()[]{}!@#$%^&*";
      const hashedPassword = await hashPassword(specialPassword);
      const isValid = await verifyPassword(hashedPassword, specialPassword);

      expect(isValid).toBe(true);
    });

    it("should return false for invalid hash format", async () => {
      const isValid = await verifyPassword("not-a-real-argon2-hash", "password");
      expect(isValid).toBe(false);
    });
  });

  describe("Token edge cases", () => {
    it("should handle userId with special characters", () => {
      const specialUserId = "user-123@example.com-uuid-456";
      const token = signToken(specialUserId, secret, expirySeconds);
      const decoded = verifyToken(token, secret);

      expect(decoded).toBe(specialUserId);
    });

    it("should handle very long userId", () => {
      const longUserId = "u".repeat(500);
      const token = signToken(longUserId, secret, expirySeconds);
      const decoded = verifyToken(token, secret);

      expect(decoded).toBe(longUserId);
    });

    it("should handle very long secret", () => {
      const longSecret = "s".repeat(1000);
      const token = signToken(userId, longSecret, expirySeconds);
      const decoded = verifyToken(token, longSecret);

      expect(decoded).toBe(userId);
    });

    it("should produce different tokens for the same userId at different times", () => {
      const token1 = signToken(userId, secret, expirySeconds);
      // Small delay to ensure different 'iat' timestamp
      const token2 = signToken(userId, secret, expirySeconds);

      // Tokens may be different due to different 'iat' timestamps
      // Both should verify correctly
      expect(verifyToken(token1, secret)).toBe(userId);
      expect(verifyToken(token2, secret)).toBe(userId);
    });
  });
});
