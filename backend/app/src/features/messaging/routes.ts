import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import type { AppContext } from "../../context.js";
import { AppError, fixedValidationMessage } from "../../lib/api-error.js";
import { newMessageEmail } from "../../lib/email.js";
import { requireUserId } from "../../plugins/auth.js";
import { conversationSummarySchema, messageSchema, unreadCountSchema } from "./schemas.js";

/**
 * Helper to construct image URL from S3 key.
 * If value starts with http(s)://, return as-is.
 * Otherwise: ${config.publicBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}
 */
function imageUrl(s3KeyOrUrl: string | null, publicBaseUrl: string): string | null {
  if (!s3KeyOrUrl) return null;
  if (s3KeyOrUrl.startsWith("http://") || s3KeyOrUrl.startsWith("https://")) {
    return s3KeyOrUrl;
  }
  const baseUrl = publicBaseUrl.replace(/\/$/, "");
  const key = s3KeyOrUrl.replace(/^\//, "");
  return `${baseUrl}/uploads/${key}`;
}

// Validation schemas
const createConversationSchema = z.object({
  body: z.string().min(1).max(2000),
});

const createMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

const idParamsSchema = z.object({ id: z.string() });

// Any invalid message body answers this one message.
const invalidBody = fixedValidationMessage("body must be 1-2000 characters");

/**
 * Fire-and-forget: send an email to the counterparty of a conversation when a
 * new message arrives.  Never throws — a failed email must not break the request.
 */
async function sendNewMessageNotification(
  ctx: AppContext,
  conversationId: string,
  senderId: string,
  messageBody: string,
  listingTitle: string,
): Promise<void> {
  try {
    // Determine recipient (the other participant)
    const conversation = await ctx.db
      .selectFrom("conversations")
      .select(["buyer_id", "seller_id"])
      .where("id", "=", conversationId)
      .executeTakeFirst();

    if (!conversation) return;

    const recipientId = senderId === conversation.buyer_id ? conversation.seller_id : conversation.buyer_id;

    // Fetch recipient
    const recipient = await ctx.db
      .selectFrom("users")
      .select(["email", "display_name", "email_notifications"])
      .where("id", "=", recipientId)
      .executeTakeFirst();

    if (!recipient) return;
    if (!recipient.email_notifications) return; // user opted out

    // Fetch sender display name
    const sender = await ctx.db
      .selectFrom("users")
      .select(["display_name"])
      .where("id", "=", senderId)
      .executeTakeFirst();

    const msg = newMessageEmail({
      recipientEmail: recipient.email,
      recipientName: recipient.display_name,
      senderName: sender?.display_name ?? null,
      messagePreview: messageBody,
      conversationId,
      listingTitle,
      unsubscribeUserId: recipientId,
      baseUrl: ctx.config.frontendBaseUrl,
    });

    await ctx.email.send(msg);
  } catch (err) {
    ctx.log.error({ err }, "failed to send the new-message notification");
  }
}

export const messagingRoutes: FastifyPluginAsyncZod<AppContext> = async (app, ctx) => {
  // POST /listings/:id/conversations — start a conversation
  app.post(
    "/listings/:id/conversations",
    {
      preHandler: app.authenticate,
      schema: { params: idParamsSchema, body: createConversationSchema, response: { 200: conversationSummarySchema } },
      schemaErrorFormatter: invalidBody,
    },
    async (request, reply) => {
      const buyerId = requireUserId(request);
      const listingId = request.params.id;

      const { body } = request.body;

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
            last_message_at: new Date().toISOString(),
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
        .set({ last_message_at: new Date().toISOString() })
        .where("id", "=", conversation.id)
        .execute();

      // Notify the seller about the new message (fire-and-forget)
      const listing2 = await ctx.db
        .selectFrom("listings")
        .select("title")
        .where("id", "=", listingId)
        .executeTakeFirst();
      void sendNewMessageNotification(ctx, conversation.id, buyerId, body, listing2?.title ?? "");

      // Return ConversationSummary
      const summary = await buildConversationSummary(ctx, conversation.id, buyerId);

      return reply.send(summary);
    },
  );

  // GET /conversations — list conversations for the user
  app.get(
    "/conversations",
    { preHandler: app.authenticate, schema: { response: { 200: z.array(conversationSummarySchema) } } },
    async (request, reply) => {
      const userId = requireUserId(request);

      const conversations = await ctx.db
        .selectFrom("conversations")
        .select("id")
        .where((eb) => eb.or([eb("buyer_id", "=", userId), eb("seller_id", "=", userId)]))
        .orderBy("last_message_at", "desc")
        .execute();

      const summaries = await Promise.all(conversations.map((c) => buildConversationSummary(ctx, c.id, userId)));

      return reply.send(summaries);
    },
  );

  // GET /conversations/:id — get a specific conversation
  app.get(
    "/conversations/:id",
    { preHandler: app.authenticate, schema: { params: idParamsSchema, response: { 200: conversationSummarySchema } } },
    async (request, reply) => {
      const userId = requireUserId(request);
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
    },
  );

  // GET /conversations/:id/messages — get messages in a conversation
  app.get(
    "/conversations/:id/messages",
    { preHandler: app.authenticate, schema: { params: idParamsSchema, response: { 200: z.array(messageSchema) } } },
    async (request, reply) => {
      const userId = requireUserId(request);
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
          read_at: m.read_at ? m.read_at : null,
          created_at: m.created_at,
        })),
      );
    },
  );

  // POST /conversations/:id/messages — add a message to a conversation
  app.post(
    "/conversations/:id/messages",
    {
      preHandler: app.authenticate,
      schema: { params: idParamsSchema, body: createMessageSchema, response: { 200: messageSchema } },
      schemaErrorFormatter: invalidBody,
    },
    async (request, reply) => {
      const userId = requireUserId(request);
      const conversationId = request.params.id;

      const { body } = request.body;

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
        .set({ last_message_at: new Date().toISOString() })
        .where("id", "=", conversationId)
        .execute();

      // Notify the counterparty (fire-and-forget)
      const msgListing = await ctx.db
        .selectFrom("listings")
        .innerJoin("conversations", "listings.id", "conversations.listing_id")
        .select("listings.title")
        .where("conversations.id", "=", conversationId)
        .executeTakeFirst();
      void sendNewMessageNotification(ctx, conversationId, userId, body, msgListing?.title ?? "");

      return reply.send({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        body: message.body,
        read_at: message.read_at ? message.read_at : null,
        created_at: message.created_at,
      });
    },
  );

  // POST /conversations/:id/read — mark messages as read
  app.post(
    "/conversations/:id/read",
    { preHandler: app.authenticate, schema: { params: idParamsSchema, response: { 200: z.object({}) } } },
    async (request, reply) => {
      const userId = requireUserId(request);
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
        .set({ read_at: new Date().toISOString() })
        .where("conversation_id", "=", conversationId)
        .where("sender_id", "!=", userId)
        .where("read_at", "is", null)
        .execute();

      return reply.send({});
    },
  );

  // GET /me/unread-count — get unread message count for the user
  app.get(
    "/me/unread-count",
    { preHandler: app.authenticate, schema: { response: { 200: unreadCountSchema } } },
    async (request, reply) => {
      const userId = requireUserId(request);

      // Count messages in conversations where user is a participant, sender != me, read_at null
      const result = await ctx.db
        .selectFrom("messages")
        .innerJoin("conversations", "messages.conversation_id", "conversations.id")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .where((eb) => eb.or([eb("conversations.buyer_id", "=", userId), eb("conversations.seller_id", "=", userId)]))
        .where("messages.sender_id", "!=", userId)
        .where("messages.read_at", "is", null)
        .executeTakeFirst();

      const count = result?.count || 0;

      return reply.send({ count });
    },
  );
};

/**
 * Helper to build a ConversationSummary.
 */
async function buildConversationSummary(
  ctx: AppContext,
  conversationId: string,
  userId: string,
): Promise<z.infer<typeof conversationSummarySchema>> {
  const publicBaseUrl = ctx.config.publicBaseUrl;

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
  const counterpartyId = userId === conversation.buyer_id ? conversation.seller_id : conversation.buyer_id;

  // Fetch counterparty user
  const counterparty = await ctx.db
    .selectFrom("users")
    .select(["id", "display_name", "avatar_url"])
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

  const toISOString = (val: string | Date): string => {
    if (val instanceof Date) return val.toISOString();
    return String(val);
  };

  return {
    id: conversation.id,
    listing: {
      id: listing.id,
      title: listing.title,
      price_ron: listing.price_ron,
      category: listing.category,
      cover_url: coverUrl,
      seller_verified: Boolean(listing.phone_verified),
      posted_at: toISOString(listing.created_at),
      active: Boolean(listing.active),
      expires_at: toISOString(listing.expires_at),
    },
    counterparty: {
      id: counterparty.id,
      display_name: counterparty.display_name,
      avatar_url: imageUrl(counterparty.avatar_url, publicBaseUrl),
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
