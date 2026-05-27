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

  if (isLoading)
    return (
      <div className="h-48 animate-pulse bg-surface-container-low rounded-2xl" />
    );

  if (recent.length === 0)
    return (
      <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">
          forum
        </span>
        <p className="text-on-surface-variant">
          {t("dashboard.messages.noRecent", "Nu ai conversații recente")}
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface">
          {t("dashboard.messages.recentTitle", "Conversații recente")}
        </h2>
        <Link
          to="/mesaje"
          className="text-primary font-bold text-sm hover:underline"
        >
          {t("dashboard.messages.viewAll", "Vezi toate")}
        </Link>
      </div>

      <div className="grid gap-3">
        {recent.map((conv: ConversationSummary) => (
          <Link
            key={conv.id}
            to={`/mesaje/${conv.id}`}
            className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
              {conv.counterparty?.display_name?.[0]?.toUpperCase() ||
                conv.counterparty?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <p className="font-bold text-on-surface truncate">
                  {conv.counterparty?.display_name ||
                    conv.counterparty?.email?.split("@")[0]}
                </p>
                <span className="text-xs text-on-surface-variant">
                  {formatDistanceToNow(new Date(conv.last_message_at), {
                    locale: ro,
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant truncate">
                {conv.listing?.title}
              </p>
            </div>
            <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
