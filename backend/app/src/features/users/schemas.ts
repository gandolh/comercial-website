import { z } from "zod";

// ─── Reply schemas: output only, separate from the input ones ────────────────

/** The signed-in user's own summary (GET and PATCH /users/me). */
export const userSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  email_verified: z.boolean(),
  phone: z.string().nullable(),
  phone_verified: z.boolean(),
  email_notifications: z.boolean(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  social_twitter: z.string().nullable(),
  social_instagram: z.string().nullable(),
  social_github: z.string().nullable(),
  created_at: z.string(),
  /** Whether "Sign in with Ward" is linked (users.ward_subject set). */
  ward_linked: z.boolean(),
});

export const myStatsSchema = z.object({
  listings: z.object({
    active: z.number(),
    inactive: z.number(),
    expired: z.number(),
    expiring_soon: z.number(),
    weekly_post_count: z.number(),
    weekly_post_limit: z.number(),
    week_resets_at: z.string(),
  }),
  messages: z.object({
    unread_count: z.number(),
    conversation_count: z.number(),
  }),
  favorites_count: z.number(),
});

export const avatarSchema = z.object({
  public_url: z.string(),
  s3_key: z.string(),
});

/** Another user's public profile (GET /users/:id). */
export const publicUserSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  phone_verified: z.boolean(),
  member_since: z.string(),
  active_listings_count: z.number(),
  total_downloads: z.number(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  social_twitter: z.string().nullable(),
  social_instagram: z.string().nullable(),
  social_github: z.string().nullable(),
});
