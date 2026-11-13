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
  const conversationId = pathname.startsWith("/mesaje/") ? pathname.replace("/mesaje/", "") : undefined;

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col pt-8">
      <div className="mx-auto flex min-h-0 w-full max-w-310 flex-1 gap-4 px-4 pb-6">
        {/* Sidebar */}
        <aside
          className={`flex w-full shrink-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient md:w-80 ${
            conversationId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="border-b border-surface-container-low p-4">
            <h1 className="font-headline text-xl font-bold text-on-surface">{t("common:messaging.messages")}</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 rounded-full border-b-2 border-primary motion-safe:animate-spin" />
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
              <div className="p-8 text-center text-sm text-on-surface-variant">
                {t("common:messaging.no_conversations")}
              </div>
            )}
          </div>
        </aside>

        {/* Right panel */}
        <main
          className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient ${
            !conversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {conversationId ? <Outlet /> : <EmptyInbox />}
        </main>
      </div>
    </div>
  );
};
