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

// ---------------------------------------------------------------------------
// Notification templates
// ---------------------------------------------------------------------------

const BASE_URL = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";

function emailFooter(unsubscribeUrl: string): string {
  return `
    <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb" />
    <p style="font-size:12px;color:#9ca3af;margin:0">
      my-olx — piața activelor digitale<br/>
      Nu mai dorești să primești notificări?
      <a href="${unsubscribeUrl}" style="color:#0056D2">Dezabonează-te</a>
    </p>
  `;
}

/**
 * Email sent to the counterparty when a new message is received in a conversation.
 */
export function newMessageEmail(params: {
  recipientEmail: string;
  recipientName: string | null;
  senderName: string | null;
  messagePreview: string;
  conversationId: string;
  listingTitle: string;
  unsubscribeUserId: string;
}): EmailMessage {
  const {
    recipientEmail,
    recipientName,
    senderName,
    messagePreview,
    conversationId,
    listingTitle,
    unsubscribeUserId,
  } = params;

  const greeting = recipientName ? `Bună, ${recipientName}!` : "Bună!";
  const from = senderName ?? "Cineva";
  const preview = messagePreview.length > 200
    ? messagePreview.substring(0, 200) + "…"
    : messagePreview;

  const conversationLink = `${BASE_URL}/mesaje/${conversationId}`;
  const unsubscribeUrl = `${BASE_URL}/setari/notificari?unsubscribe=${unsubscribeUserId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ro">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family:Inter,sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0056D2;margin-top:0">Ai un mesaj nou pe my-olx</h2>
      <p>${greeting}</p>
      <p><strong>${from}</strong> ți-a trimis un mesaj legat de anunțul
        <em>&ldquo;${listingTitle}&rdquo;</em>:</p>
      <blockquote style="border-left:4px solid #0056D2;margin:16px 0;padding:12px 16px;
        background:#f0f7ff;border-radius:4px;color:#374151">
        ${preview}
      </blockquote>
      <a href="${conversationLink}"
        style="display:inline-block;margin-top:8px;padding:10px 20px;
          background:#0056D2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Vezi conversația
      </a>
      ${emailFooter(unsubscribeUrl)}
    </body>
    </html>
  `;

  const text = `${greeting}\n\n${from} ți-a trimis un mesaj despre "${listingTitle}":\n\n${preview}\n\nVezi conversația: ${conversationLink}\n\nDezabonare: ${unsubscribeUrl}`;

  return {
    to: recipientEmail,
    subject: "Ai un mesaj nou pe my-olx",
    html,
    text,
  };
}

/**
 * Email sent to the listing owner to remind them that their listing is about to expire.
 * `variant`: "3zile" = expires in ~3 days; "azi" = expires today.
 */
export function expiryReminderEmail(params: {
  ownerEmail: string;
  ownerName: string | null;
  listingTitle: string;
  listingId: string;
  expiresAt: string;
  variant: "3zile" | "azi";
  unsubscribeUserId: string;
}): EmailMessage {
  const {
    ownerEmail,
    ownerName,
    listingTitle,
    listingId,
    expiresAt,
    variant,
    unsubscribeUserId,
  } = params;

  const greeting = ownerName ? `Bună, ${ownerName}!` : "Bună!";
  const listingLink = `${BASE_URL}/anunt/${listingId}`;
  const unsubscribeUrl = `${BASE_URL}/setari/notificari?unsubscribe=${unsubscribeUserId}`;

  const expiryDate = new Date(expiresAt).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const urgencyText =
    variant === "azi"
      ? "Anunțul tău <strong>expiră astăzi</strong>."
      : "Anunțul tău <strong>expiră în 3 zile</strong>.";

  const subjectText =
    variant === "azi"
      ? `Anunțul „${listingTitle}" expiră astăzi`
      : `Anunțul „${listingTitle}" expiră în 3 zile`;

  const html = `
    <!DOCTYPE html>
    <html lang="ro">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family:Inter,sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0056D2;margin-top:0">Anunțul tău expiră curând</h2>
      <p>${greeting}</p>
      <p>${urgencyText}</p>
      <p>Anunțul <em>&ldquo;${listingTitle}&rdquo;</em> va expira pe
        <strong>${expiryDate}</strong>. Reînnoiește-l pentru a continua să
        primești descărcări și vizualizări.</p>
      <a href="${listingLink}"
        style="display:inline-block;margin-top:8px;padding:10px 20px;
          background:#0056D2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Vezi anunțul
      </a>
      ${emailFooter(unsubscribeUrl)}
    </body>
    </html>
  `;

  const urgencyTextPlain =
    variant === "azi"
      ? "Anunțul tău expiră astăzi."
      : "Anunțul tău expiră în 3 zile.";

  const text = `${greeting}\n\n${urgencyTextPlain}\nAnunțul „${listingTitle}" va expira pe ${expiryDate}. Reînnoiește-l pentru a continua să primești descărcări și vizualizări.\n\nVezi anunțul: ${listingLink}\n\nDezabonare: ${unsubscribeUrl}`;

  return {
    to: ownerEmail,
    subject: subjectText,
    html,
    text,
  };
}

/**
 * Email sent to the listing owner when someone downloads their asset for the first time.
 */
export function firstDownloadEmail(params: {
  ownerEmail: string;
  ownerName: string | null;
  listingTitle: string;
  listingId: string;
  downloadCount: number;
  unsubscribeUserId: string;
}): EmailMessage {
  const {
    ownerEmail,
    ownerName,
    listingTitle,
    listingId,
    downloadCount,
    unsubscribeUserId,
  } = params;

  const greeting = ownerName ? `Bună, ${ownerName}!` : "Bună!";
  const listingLink = `${BASE_URL}/anunt/${listingId}`;
  const unsubscribeUrl = `${BASE_URL}/setari/notificari?unsubscribe=${unsubscribeUserId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ro">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family:Inter,sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0056D2;margin-top:0">Cineva a descărcat &ldquo;${listingTitle}&rdquo;</h2>
      <p>${greeting}</p>
      <p>Anunțul tău <strong>&ldquo;${listingTitle}&rdquo;</strong> a fost descărcat.</p>
      <p style="font-size:18px;font-weight:700;color:#0056D2">
        Total descărcări: ${downloadCount}
      </p>
      <a href="${listingLink}"
        style="display:inline-block;margin-top:8px;padding:10px 20px;
          background:#0056D2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Vezi anunțul
      </a>
      ${emailFooter(unsubscribeUrl)}
    </body>
    </html>
  `;

  const text = `${greeting}\n\nAnunțul tău "${listingTitle}" a fost descărcat.\nTotal descărcări: ${downloadCount}\n\nVezi anunțul: ${listingLink}\n\nDezabonare: ${unsubscribeUrl}`;

  return {
    to: ownerEmail,
    subject: `Cineva a descărcat „${listingTitle}"`,
    html,
    text,
  };
}
