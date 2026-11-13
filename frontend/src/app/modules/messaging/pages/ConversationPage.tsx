import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "@core/lib/router";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useConversations } from "../hooks/useConversations";
import { MessageBubble } from "../components/MessageBubble";
import { MessageComposer } from "../components/MessageComposer";
import { messagingService } from "../services/messaging";
import type { ConversationSummary, MessageResponse } from "../services/messaging";
import { useAuth } from "@core/lib/auth";
import { formatPrice } from "@core/lib/formatters";

export const ConversationPage: React.FC = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversations();
  const { data: messages, isLoading } = useConversationMessages(conversationId);

  const currentConversation = conversations?.find((c: ConversationSummary) => c.id === conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      void messagingService.markAsRead(conversationId);
    }
  }, [conversationId, messages?.length]);

  const handleSendMessage = async (body: string) => {
    if (!conversationId) return;
    await messagingService.postMessage(conversationId, body);
  };

  if (isLoading || !currentConversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-container-low bg-surface-container-lowest px-4 py-3">
        <button
          onClick={() => navigate("/mesaje")}
          aria-label={t("common:messaging.back_to_messages")}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container md:hidden"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container">
          {currentConversation.counterparty.avatar_url ? (
            <img
              src={currentConversation.counterparty.avatar_url}
              alt={currentConversation.counterparty.display_name || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-on-surface-variant">
              {(currentConversation.counterparty.display_name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-headline text-sm font-bold text-on-surface">
            {currentConversation.counterparty.display_name || t("common:messaging.unknown_user")}
          </h2>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="truncate">{currentConversation.listing.title}</span>
            <span>·</span>
            <span className="shrink-0 font-semibold text-primary">
              {currentConversation.listing.price_ron
                ? formatPrice(currentConversation.listing.price_ron)
                : t("common:listings.free")}
            </span>
          </div>
        </div>

        <Link
          to={`/anunturi/${currentConversation.listing.id}`}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          title={t("common:messaging.view_listing")}
        >
          <span className="material-symbols-outlined text-xl">info</span>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-surface-container-low p-4">
        {messages?.map((msg: MessageResponse) => (
          <MessageBubble key={msg.id} message={msg} isMe={msg.sender_id === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <MessageComposer onSend={handleSendMessage} placeholder={t("common:messaging.type_message")} />
    </div>
  );
};
