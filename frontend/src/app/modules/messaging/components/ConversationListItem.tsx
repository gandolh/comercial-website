import React from "react";
import { useTranslation } from "react-i18next";
import type { ConversationSummary } from "../services/messaging";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface Props {
  conversation: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<Props> = ({ conversation, isActive, onClick }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center border-b border-surface-container-low p-4 transition-colors ${
        isActive ? "bg-surface-container" : "hover:bg-surface-container-low"
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-container">
          {conversation.counterparty.avatar_url ? (
            <img
              src={conversation.counterparty.avatar_url}
              alt={conversation.counterparty.display_name || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-on-surface-variant">
              {(conversation.counterparty.display_name || "U").charAt(0)}
            </span>
          )}
        </div>
        {conversation.unread_count > 0 && (
          <div className="absolute -top-1 -right-1 rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-on-error">
            {conversation.unread_count}
          </div>
        )}
      </div>

      <div className="ml-4 min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <h3 className="truncate text-sm font-semibold text-on-surface">
            {conversation.counterparty.display_name || t("common:messaging.unknown_user")}
          </h3>
          <span className="shrink-0 text-xs text-on-surface-variant">
            {formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
              locale: ro,
            })}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-on-surface-variant">{conversation.listing.title}</p>
        <p
          className={`mt-1 truncate text-sm ${conversation.unread_count > 0 ? "font-bold text-on-surface" : "text-on-surface-variant"}`}
        >
          {conversation.last_message?.body || t("common:messaging.no_messages")}
        </p>
      </div>
    </div>
  );
};
