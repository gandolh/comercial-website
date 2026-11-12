import { z } from "zod";

// ─── Reply schemas: output only, separate from the input ones ────────────────

/**
 * The conversation's listing. Not listings' card: `seller_verified` and `active` are the stored 0/1 here,
 * as the handler has always answered them, where the card answers booleans.
 */
const conversationListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  price_ron: z.number().nullable(),
  category: z.string(),
  cover_url: z.string().nullable(),
  seller_verified: z.number(),
  posted_at: z.string(),
  active: z.number(),
  expires_at: z.string(),
});

/** The other participant. `email_verified` and `phone_verified` are the stored 0/1. */
const counterpartySchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  email_verified: z.number(),
  phone: z.string().nullable(),
  phone_verified: z.number(),
  created_at: z.string(),
});

export const conversationSummarySchema = z.object({
  id: z.string(),
  listing: conversationListingSchema,
  counterparty: counterpartySchema,
  last_message: z
    .object({
      body: z.string(),
      sender_id: z.string(),
      created_at: z.string(),
    })
    .nullable(),
  unread_count: z.number(),
  last_message_at: z.string(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  body: z.string(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});

export const unreadCountSchema = z.object({ count: z.number() });
