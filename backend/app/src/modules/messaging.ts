import { z } from "zod";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RouteRegistrar, AppContext } from "../context.js";
import { AppError } from "@my-olx/core";

/**
 * Helper to construct image URL from S3 key.
 * If value starts with http(s)://, return as-is.
 * Otherwise: ${config.s3PublicBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}
 */
function imageUrl(s3KeyOrUrl: string | null, publicBaseUrl: string): string | null {
  if (!s3KeyOrUrl) return null;
  if (s3KeyOrUrl.startsWith("http://") || s3KeyOrUrl.startsWith("https://")) {
    return s3KeyOrUrl;
  }
  const baseUrl = publicBaseUrl.replace(/\/$/, "");
  const key = s3KeyOrUrl.replace(/^\//, "");
  return `${baseUrl}/${key}`;
}

// Validation schemas
const createConversationSchema = z.object({
  body: z.string().min(1).max(2000),
});

const createMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

// Type extend FastifyInstance to include authenticate
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
  }
}

export const registerMessagingRoutes: RouteRegistrar = (app, ctx) => {
  // POST /listings/:id/conversations — start a conversation
  app.post<{ Params: { id: string }; Body: unknown }>(
    "/listings/:id/conversations",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const buyerId = request.userId!;
      const listingId = request.params.id;

      // Validate body
      const bodyResult = createConversationSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw AppError.validation("body must be 1-2000 characters");
      }

      const { body } = bodyResult.data;

      // Fetch the listing
      const listing = await ctx.db
        .selectFrom("listings")
        .select(["id", "user_id"])
        .where("id", "=", listingId)
        .executeTakeFirst();

      if (!listing) {
        throw AppError.notFound();
      }

      const sellerId = listing.user_id;

      // 403 if buyer == seller
      if (buyerId === sellerId) {
        throw AppError.forbidden();
      }

      // Upsert conversation on UNIQUE(listing_id, buyer_id)
      let conversation = await ctx.db
        .selectFrom("conversations")
        .select(["id"])
        .where("listing_id", "=", listingId)
        .where("buyer_id", "=", buyerId)
        .executeTakeFirst();

      if (!conversation) {
        const result = await ctx.db
          .insertInto("conversations")
          .values({
            listing_id: listingId,
            buyer_id: buyerId,
            seller_id: sellerId,
            last_message_at: new Date(),
          })
          .returning("id")
          .executeTakeFirst();

        if (!result) {
          throw AppError.internal();
        }
        conversation = { id: result.id };
      }

      // Insert first message (sender = buyer)
      await ctx.db
        .insertInto("messages")
        .values({
          conversation_id: conversation.id,
          sender_id: buyerId,
          body,
          read_at: null,
        })
        .execute();

      // Bump conversation.last_message_at = now
      await ctx.db
        .updateTable("conversations")
        .set({ last_message_at: new Date() })
        .where("id", "=", conversation.id)
        .execute();

      // Return ConversationSummary
      const summary = await buildConversationSummary(ctx, conversation.id, buyerId);

      return reply.send(summary);
    }
  );

  // GET /conversations — list conversations for the user
  app.get(
    "/conversations",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;

      const conversations = await ctx.db
        .selectFrom("conversations")
        .select("id")
        .where((eb) =>
          eb.or([
            eb("buyer_id", "=", userId),
            eb("seller_id", "=", userId),
          ])
        )
        .orderBy("last_message_at", "desc")
        .execute();

      const summaries = await Promise.all(
        conversations.map((c: any) => buildConversationSummary(ctx, c.id, userId))
      );

      return reply.send(summaries);
    }
  );

  // GET /conversations/:id — get a specific conversation
  app.get<{ Params: { id: string } }>(
    "/conversations/:id",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const conversationId = request.params.id;

      const conversation = await ctx.db
        .selectFrom("conversations")
        .select(["id", "buyer_id", "seller_id"])
        .where("id", "=", conversationId)
        .executeTakeFirst();

      if (!conversation) {
        throw AppError.notFound();
      }

      // 403 if not a participant
      if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
        throw AppError.forbidden();
      }

      const summary = await buildConversationSummary(ctx, conversationId, userId);

      return reply.send(summary);
    }
  );

  // GET /conversations/:id/messages — get messages in a conversation
  app.get<{ Params: { id: string } }>(
    "/conversations/:id/messages",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const conversationId = request.params.id;

      // Check participant
      const conversation = await ctx.db
        .selectFrom("conversations")
        .select(["buyer_id", "seller_id"])
        .where("id", "=", conversationId)
        .executeTakeFirst();

      if (!conversation) {
        throw AppError.notFound();
      }

      if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
        throw AppError.forbidden();
      }

      const messages = await ctx.db
        .selectFrom("messages")
        .select(["id", "conversation_id", "sender_id", "body", "read_at", "created_at"])
        .where("conversation_id", "=", conversationId)
        .orderBy("created_at", "asc")
        .execute();

      return reply.send(
        messages.map((m) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          body: m.body,
          read_at: m.read_at ? (m.read_at instanceof Date ? m.read_at.toISOString() : m.read_at) : null,
          created_at: m.created_at instanceof Date ? m.created_at.toISOString() : m.created_at,
        }))
      );
    }
  );

  // POST /conversations/:id/messages — add a message to a conversation
  app.post<{ Params: { id: string }; Body: unknown }>(
    "/conversations/:id/messages",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const conversationId = request.params.id;

      // Validate body
      const bodyResult = createMessageSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw AppError.validation("body must be 1-2000 characters");
      }

      const { body } = bodyResult.data;

      // Check participant
      const conversation = await ctx.db
        .selectFrom("conversations")
        .select(["buyer_id", "seller_id"])
        .where("id", "=", conversationId)
        .executeTakeFirst();

      if (!conversation) {
        throw AppError.notFound();
      }

      if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
        throw AppError.forbidden();
      }

      // Insert message
      const message = await ctx.db
        .insertInto("messages")
        .values({
          conversation_id: conversationId,
          sender_id: userId,
          body,
          read_at: null,
        })
        .returning(["id", "conversation_id", "sender_id", "body", "read_at", "created_at"])
        .executeTakeFirst();

      if (!message) {
        throw AppError.internal();
      }

      // Bump conversation.last_message_at = now
      await ctx.db
        .updateTable("conversations")
        .set({ last_message_at: new Date() })
        .where("id", "=", conversationId)
        .execute();

      return reply.send({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        body: message.body,
        read_at: message.read_at ? (message.read_at instanceof Date ? message.read_at.toISOString() : message.read_at) : null,
        created_at: message.created_at instanceof Date ? message.created_at.toISOString() : message.created_at,
      });
    }
  );

  // POST /conversations/:id/read — mark messages as read
  app.post<{ Params: { id: string } }>(
    "/conversations/:id/read",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const conversationId = request.params.id;

      // Check participant
      const conversation = await ctx.db
        .selectFrom("conversations")
        .select(["buyer_id", "seller_id"])
        .where("id", "=", conversationId)
        .executeTakeFirst();

      if (!conversation) {
        throw AppError.notFound();
      }

      if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
        throw AppError.forbidden();
      }

      // Mark messages where sender_id != userId AND read_at IS NULL → read_at = now
      await ctx.db
        .updateTable("messages")
        .set({ read_at: new Date() })
        .where("conversation_id", "=", conversationId)
        .where("sender_id", "!=", userId)
        .where("read_at", "is", null)
        .execute();

      return reply.send({});
    }
  );

  // GET /me/unread-count — get unread message count for the user
  app.get(
    "/me/unread-count",
    { preHandler: (app as any).authenticate },
    async (request, reply) => {
      const userId = request.userId!;

      // Count messages in conversations where user is a participant, sender != me, read_at null
      const result = await ctx.db
        .selectFrom("messages")
        .innerJoin("conversations", "messages.conversation_id", "conversations.id")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .where((eb) =>
          eb.or([
            eb("conversations.buyer_id", "=", userId),
            eb("conversations.seller_id", "=", userId),
          ])
        )
        .where("messages.sender_id", "!=", userId)
        .where("messages.read_at", "is", null as any)
        .executeTakeFirst();

      const count = result?.count || 0;

      return reply.send({ count });
    }
  );
};

/**
 * Helper to build a ConversationSummary.
 */
async function buildConversationSummary(
  ctx: AppContext,
  conversationId: string,
  userId: string
): Promise<any> {
  const publicBaseUrl = ctx.config.s3PublicBaseUrl;

  // Fetch conversation
  const conversation = await ctx.db
    .selectFrom("conversations")
    .select(["id", "listing_id", "buyer_id", "seller_id", "last_message_at"])
    .where("id", "=", conversationId)
    .executeTakeFirst();

  if (!conversation) {
    throw AppError.notFound();
  }

  // Fetch listing with images and seller
  const listing = await ctx.db
    .selectFrom("listings")
    .innerJoin("users", "listings.user_id", "users.id")
    .select([
      "listings.id",
      "listings.title",
      "listings.price_ron",
      "listings.city",
      "listings.category",
      "listings.created_at",
      "listings.active",
      "listings.expires_at",
      "users.phone_verified",
    ])
    .where("listings.id", "=", conversation.listing_id)
    .executeTakeFirst();

  if (!listing) {
    throw AppError.notFound();
  }

  // Fetch cover image (position 0)
  const coverImage = await ctx.db
    .selectFrom("listing_images")
    .select("s3_key")
    .where("listing_id", "=", listing.id)
    .where("position", "=", 0)
    .executeTakeFirst();

  const coverUrl = imageUrl(coverImage?.s3_key || null, publicBaseUrl);

  // Determine counterparty
  const counterpartyId =
    userId === conversation.buyer_id ? conversation.seller_id : conversation.buyer_id;

  // Fetch counterparty user
  const counterparty = await ctx.db
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
    .where("id", "=", counterpartyId)
    .executeTakeFirst();

  if (!counterparty) {
    throw AppError.notFound();
  }

  // Fetch last message
  const lastMessage = await ctx.db
    .selectFrom("messages")
    .select(["body", "sender_id", "created_at"])
    .where("conversation_id", "=", conversationId)
    .orderBy("created_at", "desc")
    .limit(1)
    .executeTakeFirst();

  // Count unread messages in this conversation (where sender != userId and read_at is null)
  const unreadResult = await ctx.db
    .selectFrom("messages")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .where("conversation_id", "=", conversationId)
    .where("sender_id", "!=", userId)
    .where("read_at", "is", null)
    .executeTakeFirst();

  const unreadCount = unreadResult?.count || 0;

  const toISOString = (val: any): string => {
    if (val instanceof Date) return val.toISOString();
    return String(val);
  };

  return {
    id: conversation.id,
    listing: {
      id: listing.id,
      title: listing.title,
      price_ron: listing.price_ron,
      city: listing.city,
      category: listing.category,
      cover_url: coverUrl,
      seller_verified: listing.phone_verified,
      posted_at: toISOString(listing.created_at),
      active: listing.active,
      expires_at: toISOString(listing.expires_at),
    },
    counterparty: {
      id: counterparty.id,
      email: counterparty.email,
      display_name: counterparty.display_name,
      avatar_url: imageUrl(counterparty.avatar_url, publicBaseUrl),
      email_verified: counterparty.email_verified,
      phone: counterparty.phone,
      phone_verified: counterparty.phone_verified,
      created_at: toISOString(counterparty.created_at),
    },
    last_message: lastMessage
      ? {
          body: lastMessage.body,
          sender_id: lastMessage.sender_id,
          created_at: toISOString(lastMessage.created_at),
        }
      : null,
    unread_count: unreadCount,
    last_message_at: toISOString(conversation.last_message_at),
  };
}
