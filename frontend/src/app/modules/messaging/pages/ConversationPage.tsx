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
  const { data: messages, isLoading } = useConversationMessages(
    conversationId!,
  );

  const currentConversation = conversations?.find(
    (c: ConversationSummary) => c.id === conversationId,
  );

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
      messagingService.markAsRead(conversationId);
    }
  }, [conversationId, messages?.length]);

  const handleSendMessage = async (body: string) => {
    if (!conversationId) return;
    await messagingService.postMessage(conversationId, body);
  };

  if (isLoading || !currentConversation) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-container-lowest border-b border-surface-container-low flex items-center gap-3">
        <button
          onClick={() => navigate("/mesaje")}
          aria-label={t("common:messaging.back_to_messages")}
          className="md:hidden p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {currentConversation.counterparty.avatar_url ? (
            <img
              src={currentConversation.counterparty.avatar_url}
              alt={currentConversation.counterparty.display_name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-on-surface-variant font-bold text-sm">
              {(currentConversation.counterparty.display_name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold font-[Manrope] text-on-surface truncate">
            {currentConversation.counterparty.display_name ||
              t("common:messaging.unknown_user")}
          </h2>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="truncate">
              {currentConversation.listing.title}
            </span>
            <span>·</span>
            <span className="font-semibold text-primary flex-shrink-0">
              {currentConversation.listing.price_ron
                ? formatPrice(currentConversation.listing.price_ron)
                : t("common:listings.free")}
            </span>
          </div>
        </div>

        <Link
          to={`/anunturi/${currentConversation.listing.id}`}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
          title={t("common:messaging.view_listing")}
        >
          <span className="material-symbols-outlined text-xl">info</span>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-surface-container-low">
        {messages?.map((msg: MessageResponse) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <MessageComposer
        onSend={handleSendMessage}
        placeholder={t("common:messaging.type_message")}
      />
    </div>
  );
};
