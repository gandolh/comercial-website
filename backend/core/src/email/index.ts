import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailService {
  send(msg: EmailMessage): Promise<void>;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
}

/**
 * SMTP-based email service using nodemailer.
 * Connects to MailHog (or any SMTP server) for development/testing.
 */
export class SmtpEmailService implements EmailService {
  private transporter: Transporter;
  private fromAddress: string;

  constructor(config: SmtpConfig) {
    // If username is empty, create transport without auth (MailHog compatibility)
    const transportConfig = {
      host: config.host,
      port: config.port,
      ...(config.username && {
        auth: {
          user: config.username,
          pass: config.password,
        },
      }),
    };

    this.transporter = nodemailer.createTransport(transportConfig);
    this.fromAddress = config.from;
  }

  async send(msg: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
  }
}

/**
 * Log-only email service for development/testing.
 * Logs the email to console instead of sending.
 */
export class LogEmailService implements EmailService {
  async send(msg: EmailMessage): Promise<void> {
    console.log(
      "[email]",
      JSON.stringify(
        {
          to: msg.to,
          subject: msg.subject,
          html: msg.html.substring(0, 100) + (msg.html.length > 100 ? "..." : ""),
          text: msg.text,
        },
        null,
        2
      )
    );
  }
}

export interface EmailServiceConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
}

/**
 * Factory function to create the appropriate email service.
 * Returns LogEmailService if host is empty/undefined, else SmtpEmailService.
 */
export function createEmailService(
  config: EmailServiceConfig
): EmailService {
  if (!config.host) {
    return new LogEmailService();
  }

  return new SmtpEmailService({
    host: config.host,
    port: config.port ?? 1025,
    username: config.username ?? "",
    password: config.password ?? "",
    from: config.from ?? "noreply@piataro.ro",
  });
}
