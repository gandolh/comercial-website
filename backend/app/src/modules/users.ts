import { randomUUID } from "crypto";
import { z } from "zod";
import type { RouteRegistrar } from "../context.js";
import { AppError, verifyPassword, hashPassword } from "@my-olx/core";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}

// Helpers
function imageUrl(s3Key: string, config: any): string {
  if (!s3Key) return null as any;
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }
  const base = config.s3PublicBaseUrl.replace(/\/$/, "");
  const key = s3Key.replace(/^\//, "");
  return `${base}/${key}`;
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
}

interface ListingCardResponse {
  id: string;
  title: string;
  price_ron: number | null;
  city: string;
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
        email_verified: user.email_verified,
        phone: user.phone,
        phone_verified: user.phone_verified,
        created_at: toISOString(user.created_at),
      };

      return reply.send(response);
    }
  );

  // PATCH /users/me — update display_name and/or avatar
  app.patch(
    "/users/me",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const schema = z.object({
        display_name: z.string().min(2).max(60).optional(),
        avatar_s3_key: z.string().optional(),
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
          email_verified: user.email_verified,
          phone: user.phone,
          phone_verified: user.phone_verified,
          created_at: toISOString(user.created_at),
        };

        return reply.send(response);
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

      const response: UserSummary = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        phone: user.phone,
        phone_verified: user.phone_verified,
        created_at: toISOString(user.created_at),
      };

      return reply.send(response);
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
        .select(ctx.db.fn.count("id").as("count"))
        .innerJoin("conversations", "messages.conversation_id", "conversations.id")
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

  // POST /users/me/avatar/upload-url — presign upload
  app.post(
    "/users/me/avatar/upload-url",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const schema = z.object({
        content_type: z.string(),
        filename: z.string(),
      });

      let body: any;
      try {
        body = schema.parse(request.body);
      } catch (err) {
        throw AppError.validation((err as any).errors[0]?.message || "invalid request");
      }

      const userId = request.userId!;
      const ext = getFileExtension(body.filename);
      const s3Key = `avatars/${userId}/${randomUUID()}.${ext}`;

      const uploadUrl = await ctx.storage.presignPut(s3Key, body.content_type);
      const publicUrl = ctx.storage.publicUrl(s3Key);

      return reply.send({
        upload_url: uploadUrl,
        s3_key: s3Key,
        public_url: publicUrl,
      });
    }
  );

  // GET /users/:id — public user info
  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as any;

    const user = await ctx.db
      .selectFrom("users")
      .select(["id", "display_name", "avatar_url", "phone_verified", "created_at"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!user) {
      throw AppError.notFound();
    }

    // Count active, non-expired listings
    const now = new Date();
    const listingsResult = await ctx.db
      .selectFrom("listings")
      .select(ctx.db.fn.count("id").as("count"))
      .where("user_id", "=", id)
      .where("active", "=", true)
      .where("expires_at", ">", now)
      .executeTakeFirst();

    const active_listings_count = listingsResult ? parseInt(String(listingsResult.count)) : 0;

    const response: PublicUserResponse = {
      id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      phone_verified: user.phone_verified,
      member_since: toISOString(user.created_at),
      active_listings_count,
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
        "city",
        "category",
        "active",
        "expires_at",
        "created_at",
        "user_id",
      ])
      .where("user_id", "=", id);

    // Filter by active status if specified
    if (active !== undefined) {
      const activeFlag = active === "true" || active === true;
      query = query.where("active", "=", activeFlag);
    }

    const listings = await query.execute();

    // Get seller's phone_verified status
    const seller = await ctx.db
      .selectFrom("users")
      .select(["phone_verified"])
      .where("id", "=", id)
      .executeTakeFirst();

    const seller_verified = seller?.phone_verified || false;

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
      city: l.city,
      category: l.category,
      cover_url: coverMap.has(l.id) ? imageUrl(coverMap.get(l.id)!, ctx.config) : null,
      seller_verified,
      posted_at: toISOString(l.created_at),
      active: l.active,
      expires_at: toISOString(l.expires_at),
    }));

    return reply.send(response);
  });
};
