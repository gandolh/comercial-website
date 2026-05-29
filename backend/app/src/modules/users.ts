import { randomUUID } from "crypto";
import { z } from "zod";
import { sql } from "kysely";
import type { SqlBool } from "kysely";
import type { RouteRegistrar } from "../context.js";
import { AppError, verifyPassword, hashPassword } from "@my-olx/core";
// Helpers
function imageUrl(s3Key: string, config: any): string {
  if (!s3Key) return null as any;
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }
  const base = config.publicBaseUrl.replace(/\/$/, "");
  const key = s3Key.replace(/^\//, "");
  return `${base}/uploads/${key}`;
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "bin";
}

function toDate(val: any): Date {
  return val instanceof Date ? val : new Date(val);
}

function toISOString(val: any): string {
  return toDate(val).toISOString();
}

// Type definitions for responses
interface UserSummary {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  email_notifications: boolean;
  bio: string | null;
  website: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_github: string | null;
  created_at: string;
}

interface ListingStats {
  active: number;
  inactive: number;
  expired: number;
  expiring_soon: number;
  weekly_post_count: number;
  weekly_post_limit: number;
  week_resets_at: string;
}

interface MessagingStats {
  unread_count: number;
  conversation_count: number;
}

interface MyStatsResponse {
  listings: ListingStats;
  messages: MessagingStats;
  favorites_count: number;
}

interface PublicUserResponse {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  member_since: string;
  active_listings_count: number;
  total_downloads: number;
  bio: string | null;
  website: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_github: string | null;
}

interface ListingCardResponse {
  id: string;
  title: string;
  price_ron: number | null;
  category: string;
  cover_url: string | null;
  seller_verified: boolean;
  posted_at: string;
  active: boolean;
  expires_at: string;
}

export const registerUsersRoutes: RouteRegistrar = (app, ctx) => {
  // GET /users/me — return current user's summary
  app.get(
    "/users/me",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const user = await ctx.db
        .selectFrom("users")
        .select([
          "id",
          "email",
          "display_name",
          "avatar_url",
          "email_verified",
          "phone",
          "phone_verified",
          "email_notifications",
          "bio",
          "website",
          "social_twitter",
          "social_instagram",
          "social_github",
          "created_at",
        ])
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!user) {
        throw AppError.notFound();
      }

      const response: UserSummary = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        email_verified: Boolean(user.email_verified),
        phone: user.phone,
        phone_verified: Boolean(user.phone_verified),
        email_notifications: Boolean(user.email_notifications),
        bio: (user as any).bio ?? null,
        website: (user as any).website ?? null,
        social_twitter: (user as any).social_twitter ?? null,
        social_instagram: (user as any).social_instagram ?? null,
        social_github: (user as any).social_github ?? null,
        created_at: toISOString(user.created_at),
      };

      return reply.send(response);
    }
  );

  // PATCH /users/me — update display_name and/or avatar and/or email_notifications
  app.patch(
    "/users/me",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const schema = z.object({
        display_name: z.string().min(2).max(60).optional(),
        avatar_s3_key: z.string().optional(),
        email_notifications: z.boolean().optional(),
        bio: z.string().max(500).nullable().optional(),
        website: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
        social_twitter: z.string().max(50).nullable().optional(),
        social_instagram: z.string().max(50).nullable().optional(),
        social_github: z.string().max(50).nullable().optional(),
      });

      let body: any;
      try {
        body = schema.parse(request.body);
      } catch (err) {
        throw AppError.validation((err as any).errors[0]?.message || "invalid request");
      }

      const userId = request.userId!;
      const updates: any = {};

      if (body.display_name !== undefined) {
        updates.display_name = body.display_name;
      }

      if (body.avatar_s3_key !== undefined) {
        updates.avatar_url = imageUrl(body.avatar_s3_key, ctx.config);
      }

      if (body.email_notifications !== undefined) {
        updates.email_notifications = body.email_notifications ? 1 : 0;
      }

      if ("bio" in body) updates.bio = body.bio ?? null;
      if ("website" in body) updates.website = body.website ?? null;
      if ("social_twitter" in body) updates.social_twitter = body.social_twitter ?? null;
      if ("social_instagram" in body) updates.social_instagram = body.social_instagram ?? null;
      if ("social_github" in body) updates.social_github = body.social_github ?? null;

      const buildSummary = (u: any): UserSummary => ({
        id: u.id,
        email: u.email,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        email_verified: Boolean(u.email_verified),
        phone: u.phone,
        phone_verified: Boolean(u.phone_verified),
        email_notifications: Boolean(u.email_notifications),
        bio: u.bio ?? null,
        website: u.website ?? null,
        social_twitter: u.social_twitter ?? null,
        social_instagram: u.social_instagram ?? null,
        social_github: u.social_github ?? null,
        created_at: toISOString(u.created_at),
      });

      if (Object.keys(updates).length === 0) {
        // No updates provided
        const user = await ctx.db
          .selectFrom("users")
          .select([
            "id",
            "email",
            "display_name",
            "avatar_url",
            "email_verified",
            "phone",
            "phone_verified",
            "email_notifications",
            "bio",
            "website",
            "social_twitter",
            "social_instagram",
            "social_github",
            "created_at",
          ])
          .where("id", "=", userId)
          .executeTakeFirst();

        if (!user) {
          throw AppError.notFound();
        }

        return reply.send(buildSummary(user));
      }

      const user = await ctx.db
        .updateTable("users")
        .set(updates)
        .where("id", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!user) {
        throw AppError.notFound();
      }

      return reply.send(buildSummary(user));
    }
  );

  // GET /users/me/stats — return stats
  app.get(
    "/users/me/stats",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const now = new Date();

      // Listing stats
      const listings = await ctx.db
        .selectFrom("listings")
        .select([
          "id",
          "active",
          "expires_at",
          "created_at",
        ])
        .where("user_id", "=", userId)
        .execute();

      const active = listings.filter(l => {
        const expiresAt = toDate(l.expires_at);
        return l.active && expiresAt > now;
      }).length;
      const inactive = listings.filter(l => !l.active).length;
      const expired = listings.filter(l => {
        const expiresAt = toDate(l.expires_at);
        return expiresAt <= now;
      }).length;

      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const expiring_soon = listings.filter(l => {
        const expiresAt = toDate(l.expires_at);
        return l.active && expiresAt > now && expiresAt <= threeDaysFromNow;
      }).length;

      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentListings = listings.filter(l => {
        const dt = toDate(l.created_at);
        return dt >= sevenDaysAgo;
      });
      const weekly_post_count = recentListings.length;

      let week_resets_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      if (recentListings.length > 0) {
        const createdAtTimes = recentListings.map(l => toDate(l.created_at).getTime());
        const oldestInWindow = new Date(Math.min(...createdAtTimes));
        week_resets_at = new Date(oldestInWindow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Messaging stats
      const unreadResult = await ctx.db
        .selectFrom("messages")
        .innerJoin("conversations", "messages.conversation_id", "conversations.id")
        .select(ctx.db.fn.count("messages.id").as("count"))
        .where("messages.sender_id", "!=", userId)
        .where("messages.read_at", "is", null)
        .where(eb => eb.or([
          eb("conversations.buyer_id", "=", userId),
          eb("conversations.seller_id", "=", userId)
        ]))
        .executeTakeFirst();

      const unread_count = unreadResult ? parseInt(String(unreadResult.count)) : 0;

      const conversationResult = await ctx.db
        .selectFrom("conversations")
        .select(ctx.db.fn.count("id").as("count"))
        .where(eb => eb.or([
          eb("buyer_id", "=", userId),
          eb("seller_id", "=", userId)
        ]))
        .executeTakeFirst();

      const conversation_count = conversationResult ? parseInt(String(conversationResult.count)) : 0;

      // Favorites count
      const favoritesResult = await ctx.db
        .selectFrom("favorites")
        .select(ctx.db.fn.count("listing_id").as("count"))
        .where("user_id", "=", userId)
        .executeTakeFirst();

      const favorites_count = favoritesResult ? parseInt(String(favoritesResult.count)) : 0;

      const response: MyStatsResponse = {
        listings: {
          active,
          inactive,
          expired,
          expiring_soon,
          weekly_post_count,
          weekly_post_limit: 5,
          week_resets_at,
        },
        messages: {
          unread_count,
          conversation_count,
        },
        favorites_count,
      };

      return reply.send(response);
    }
  );

  // PATCH /users/me/password — change password
  app.patch(
    "/users/me/password",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const schema = z.object({
        current_password: z.string().min(8),
        new_password: z.string().min(8),
      });

      let body: any;
      try {
        body = schema.parse(request.body);
      } catch (err) {
        throw AppError.validation((err as any).errors[0]?.message || "invalid request");
      }

      const userId = request.userId!;
      const user = await ctx.db
        .selectFrom("users")
        .select(["password_hash"])
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!user) {
        throw AppError.notFound();
      }

      const isValid = await verifyPassword(user.password_hash, body.current_password);
      if (!isValid) {
        throw new AppError(403, "current password is incorrect");
      }

      const newHash = await hashPassword(body.new_password);
      await ctx.db
        .updateTable("users")
        .set({ password_hash: newHash })
        .where("id", "=", userId)
        .execute();

      return reply.send({});
    }
  );

  // POST /users/me/avatar — multipart upload
  app.post(
    "/users/me/avatar",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const userId = request.userId!;

      const data = await (request as any).file();
      if (!data) throw AppError.validation("no file provided");

      const contentType: string = data.mimetype;
      let ext: string;
      if (contentType === "image/jpeg") ext = "jpg";
      else if (contentType === "image/png") ext = "png";
      else if (contentType === "image/webp") ext = "webp";
      else throw AppError.validation("unsupported content type");

      const { mkdir: mkdirFs } = await import("node:fs/promises");
      const { createWriteStream: cws } = await import("node:fs");
      const { pipeline: pipe } = await import("node:stream/promises");
      const pathMod = await import("node:path");

      const s3Key = `avatars/${userId}/${randomUUID()}.${ext}`;
      const dest = pathMod.join(ctx.config.uploadsDir, s3Key);
      await mkdirFs(pathMod.dirname(dest), { recursive: true });
      await pipe(data.file, cws(dest));

      const publicUrl = ctx.storage.publicUrl(s3Key);

      await ctx.db
        .updateTable("users")
        .set({ avatar_url: s3Key })
        .where("id", "=", userId)
        .execute();

      return reply.send({ public_url: publicUrl, s3_key: s3Key });
    }
  );

  // GET /users/:id — public user info
  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as any;

    const user = await ctx.db
      .selectFrom("users")
      .select([
        "id",
        "display_name",
        "avatar_url",
        "phone_verified",
        "bio",
        "website",
        "social_twitter",
        "social_instagram",
        "social_github",
        "created_at",
      ])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!user) {
      throw AppError.notFound();
    }

    // Count active, non-expired listings and sum download_count
    const [listingsResult, downloadsResult] = await Promise.all([
      ctx.db
        .selectFrom("listings")
        .select(ctx.db.fn.count("id").as("count"))
        .where("user_id", "=", id)
        .where(sql<SqlBool>`active = 1`)
        .where(sql<SqlBool>`expires_at > datetime('now')`)
        .executeTakeFirst(),
      ctx.db
        .selectFrom("listings")
        .select(sql`COALESCE(SUM(download_count), 0)`.as("total"))
        .where("user_id", "=", id)
        .where(sql<SqlBool>`active = 1`)
        .where(sql<SqlBool>`expires_at > datetime('now')`)
        .executeTakeFirst(),
    ]);

    const active_listings_count = listingsResult ? parseInt(String(listingsResult.count)) : 0;
    const total_downloads = downloadsResult ? parseInt(String((downloadsResult as any).total)) : 0;

    const response: PublicUserResponse = {
      id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      phone_verified: Boolean(user.phone_verified),
      member_since: toISOString(user.created_at),
      active_listings_count,
      total_downloads,
      bio: (user as any).bio ?? null,
      website: (user as any).website ?? null,
      social_twitter: (user as any).social_twitter ?? null,
      social_instagram: (user as any).social_instagram ?? null,
      social_github: (user as any).social_github ?? null,
    };

    return reply.send(response);
  });

  // GET /users/:id/listings — user's listings as cards
  app.get("/users/:id/listings", async (request, reply) => {
    const { id } = request.params as any;
    const { active } = request.query as any;

    let query = ctx.db
      .selectFrom("listings")
      .select([
        "id",
        "title",
        "price_ron",
        "category",
        "active",
        "expires_at",
        "created_at",
        "user_id",
      ])
      .where("user_id", "=", id);

    // Filter by active status if specified
    if (active !== undefined) {
      const activeFlag = active === "true" || active === true ? 1 : 0;
      query = query.where(sql<SqlBool>`active = ${activeFlag}`);
    }

    const listings = await query.execute();

    // Get seller's phone_verified status
    const seller = await ctx.db
      .selectFrom("users")
      .select(["phone_verified"])
      .where("id", "=", id)
      .executeTakeFirst();

    const seller_verified = Boolean(seller?.phone_verified);

    // Get cover images for each listing
    const coverImages = await ctx.db
      .selectFrom("listing_images")
      .select(["listing_id", "s3_key"])
      .where("position", "=", 0)
      .execute();

    const coverMap = new Map(coverImages.map(img => [img.listing_id, img.s3_key]));

    const response: ListingCardResponse[] = listings.map(l => ({
      id: l.id,
      title: l.title,
      price_ron: l.price_ron,
      category: l.category,
      cover_url: coverMap.has(l.id) ? imageUrl(coverMap.get(l.id)!, ctx.config) : null,
      seller_verified,
      posted_at: toISOString(l.created_at),
      active: Boolean(l.active),
      expires_at: toISOString(l.expires_at),
    }));

    return reply.send(response);
  });
};
