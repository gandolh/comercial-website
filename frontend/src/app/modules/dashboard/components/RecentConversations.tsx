import { useTranslation } from "react-i18next";
import { Link } from "@core/lib/router";
import { useConversations } from "@app/modules/messaging/hooks/useConversations";
import type { ConversationSummary } from "@app/modules/messaging/services/messaging";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

export function RecentConversations() {
  const { t } = useTranslation();
  const { data: conversations, isLoading } = useConversations();

  const recent = conversations?.slice(0, 3) || [];

  if (isLoading) return <div className="h-48 rounded-2xl bg-surface-container-low motion-safe:animate-pulse" />;

  if (recent.length === 0)
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <span className="material-symbols-outlined mb-2 text-4xl text-on-surface-variant">forum</span>
        <p className="text-on-surface-variant">{t("dashboard.messages.noRecent", "Nu ai conversații recente")}</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface">
          {t("dashboard.messages.recentTitle", "Conversații recente")}
        </h2>
        <Link to="/mesaje" className="text-sm font-bold text-primary hover:underline">
          {t("dashboard.messages.viewAll", "Vezi toate")}
        </Link>
      </div>

      <div className="grid gap-3">
        {recent.map((conv: ConversationSummary) => (
          <Link
            key={conv.id}
            to={`/mesaje/${conv.id}`}
            className="group flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {(conv.counterparty?.display_name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-start justify-between">
                <p className="truncate font-bold text-on-surface">
                  {conv.counterparty?.display_name || t("common:messaging.unknown_user")}
                </p>
                <span className="text-xs text-on-surface-variant">
                  {formatDistanceToNow(new Date(conv.last_message_at), {
                    locale: ro,
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="truncate text-sm text-on-surface-variant">{conv.listing?.title}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
