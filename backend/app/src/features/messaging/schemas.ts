import { z } from "zod";

// ─── Reply schemas: output only, separate from the input ones ────────────────

/** The conversation's listing. */
const conversationListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  price_ron: z.number().nullable(),
  category: z.string(),
  cover_url: z.string().nullable(),
  seller_verified: z.boolean(),
  posted_at: z.string(),
  active: z.boolean(),
  expires_at: z.string(),
});

/** The other participant: a display name and an avatar, nothing they did not choose to show. */
const counterpartySchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
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
