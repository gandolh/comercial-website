import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EmailMessage, EmailService } from "./index.js";
import {
  SmtpEmailService,
  LogEmailService,
  createEmailService,
} from "./index.js";

describe("EmailService", () => {
  describe("LogEmailService", () => {
    it("should log email message without throwing", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const service: EmailService = new LogEmailService();

      const message: EmailMessage = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };

      await expect(service.send(message)).resolves.toBeUndefined();
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockRestore();
    });

    it("should log with [email] prefix", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const service: EmailService = new LogEmailService();

      const message: EmailMessage = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      await service.send(message);

      expect(logSpy).toHaveBeenCalledWith(
        "[email]",
        expect.stringContaining("test@example.com")
      );

      logSpy.mockRestore();
    });
  });

  describe("createEmailService factory", () => {
    it("should return LogEmailService when host is empty", () => {
      const service = createEmailService({ host: "" });
      expect(service).toBeInstanceOf(LogEmailService);
    });

    it("should return LogEmailService when host is undefined", () => {
      const service = createEmailService({});
      expect(service).toBeInstanceOf(LogEmailService);
    });

    it("should return SmtpEmailService when host is provided", () => {
      const service = createEmailService({
        host: "localhost",
        port: 1025,
        username: "",
        password: "",
        from: "x@y.z",
      });
      expect(service).toBeInstanceOf(SmtpEmailService);
    });

    it("should return SmtpEmailService with default port and from", () => {
      const service = createEmailService({
        host: "localhost",
      });
      expect(service).toBeInstanceOf(SmtpEmailService);
    });
  });

  describe("SmtpEmailService", () => {
    it("should create transporter without auth when username is empty", () => {
      const service = new SmtpEmailService({
        host: "localhost",
        port: 1025,
        username: "",
        password: "",
        from: "test@example.com",
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SmtpEmailService);
    });

    it("should create transporter with auth when username is provided", () => {
      const service = new SmtpEmailService({
        host: "smtp.example.com",
        port: 587,
        username: "user@example.com",
        password: "password123",
        from: "test@example.com",
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SmtpEmailService);
    });

    it("should not throw during send call (mocked transporter)", async () => {
      const service = new SmtpEmailService({
        host: "localhost",
        port: 1025,
        username: "",
        password: "",
        from: "test@example.com",
      });

      // Mock the sendMail method to avoid actual SMTP calls
      const sendMailSpy = vi
        .spyOn(service["transporter"], "sendMail")
        .mockResolvedValue({ messageId: "test-id" });

      const message: EmailMessage = {
        to: "recipient@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      };

      await expect(service.send(message)).resolves.toBeUndefined();
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "test@example.com",
          to: "recipient@example.com",
          subject: "Test",
          html: "<p>Test</p>",
        })
      );

      sendMailSpy.mockRestore();
    });
  });
});
