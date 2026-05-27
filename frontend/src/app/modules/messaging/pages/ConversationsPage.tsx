import React from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useConversations } from "../hooks/useConversations";
import type { ConversationSummary } from "../services/messaging";
import { ConversationListItem } from "../components/ConversationListItem";
import { EmptyInbox } from "../components/EmptyInbox";
import { useNavigate } from "@core/lib/router";

export const ConversationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: conversations, isLoading } = useConversations();

  const pathname = routerState.location.pathname;
  const conversationId = pathname.startsWith("/mesaje/")
    ? pathname.replace("/mesaje/", "")
    : undefined;

  return (
    <div className="pt-24 h-screen flex flex-col">
      <div className="flex flex-1 min-h-0 max-w-screen-xl mx-auto w-full px-4 pb-6 gap-4">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-80 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-[var(--shadow-ambient)] overflow-hidden ${
            conversationId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-surface-container-low">
            <h1 className="text-xl font-bold font-[Manrope] text-on-surface">
              {t("common:messaging.messages")}
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv: ConversationSummary) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conversationId === conv.id}
                  onClick={() => navigate(`/mesaje/${conv.id}`)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                {t("common:messaging.no_conversations")}
              </div>
            )}
          </div>
        </aside>

        {/* Right panel */}
        <main
          className={`flex-1 min-w-0 flex flex-col bg-white rounded-xl shadow-[var(--shadow-ambient)] overflow-hidden ${
            !conversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {conversationId ? (
            <Outlet />
          ) : (
            <EmptyInbox />
          )}
        </main>
      </div>
    </div>
  );
};
