import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useMyStats } from "../hooks/useMyStats";
import { StatCard } from "../components/StatCard";
import { QuotaCard } from "../components/QuotaCard";
import { ExpiringSection } from "../components/ExpiringSection";
import { RecentConversations } from "../components/RecentConversations";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { useMyListings } from "../hooks/useMyListings";
import { Link } from "@core/lib/router";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useMyStats();
  const { data: activeListings } = useMyListings({ active: true });

  const displayName =
    user?.display_name || user?.email?.split("@")[0] || "Utilizator";

  if (statsLoading) {
    return (
      <main className="pt-24 min-h-screen max-w-screen-2xl mx-auto px-8 py-12 space-y-12">
        <div className="h-12 w-64 bg-surface-container-low animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-surface-container-low animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </main>
    );
  }

  if (statsError) {
    return (
      <main className="pt-24 min-h-screen max-w-screen-2xl mx-auto px-8 py-12">
        <ErrorCard
          message={t(
            "dashboard.error",
            "Nu am putut încărca datele panoului de control.",
          )}
          onRetry={refetchStats}
        />
      </main>
    );
  }

  // Filter listings expiring within 7 days for the ExpiringSection
  const filteredExpiring =
    activeListings?.listings?.filter((l: { expiresAt: string }) => {
      const expiresAt = new Date(l.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }) || [];

  const expiringSoonCount = stats?.listings.expiringSoon ?? 0;

  return (
    <main className="pt-24 min-h-screen max-w-screen-2xl mx-auto px-8 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <h1
          className="text-4xl font-black text-on-surface"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {t("dashboard.greeting", "Bună")}, {displayName}!
        </h1>
        <p className="text-on-surface-variant">
          {t("dashboard.subtitle", "Iată ce se întâmplă cu contul tău astăzi.")}
        </p>
      </header>

      {/* Expiring-soon warning banner */}
      {expiringSoonCount > 0 && (
        <div
          role="alert"
          className="flex items-center gap-3 bg-error-container text-on-error-container px-5 py-4 rounded-2xl"
        >
          <span className="material-symbols-outlined text-2xl flex-shrink-0" aria-hidden="true">
            warning
          </span>
          <p className="font-semibold">
            {t("dashboard.expiringSoon.banner", {
              count: expiringSoonCount,
              defaultValue: `Ai ${expiringSoonCount} anunț care expiră în curând. Reînnoiește-l înainte să dispară.`,
            })}
          </p>
          <Link
            to="/cont/anunturi"
            className="ml-auto flex-shrink-0 underline font-bold hover:opacity-80 transition-opacity"
          >
            {t("dashboard.expiringSoon.bannerAction", "Vezi anunțurile")}
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("dashboard.stats.activeListings", "Anunțuri active")}
          value={stats?.listings.active || 0}
          label={t("dashboard.stats.listingsLabel", "anunțuri")}
          icon="inventory_2"
          to="/cont/anunturi"
          color="primary"
        />
        <StatCard
          title={t("dashboard.stats.unreadMessages", "Mesaje necitite")}
          value={stats?.messages.unreadCount || 0}
          label={t("dashboard.stats.messagesLabel", "noi")}
          icon="chat_bubble"
          to="/mesaje"
          color="secondary"
        />
        <StatCard
          title={t("dashboard.stats.savedFavorites", "Favorite salvate")}
          value={stats?.favoritesCount || 0}
          label={t("dashboard.stats.favoritesLabel", "anunțuri")}
          icon="favorite"
          to="/favorite"
          color="error"
        />
        <StatCard
          title={t("dashboard.stats.totalConversations", "Conversații")}
          value={stats?.messages.conversationCount || 0}
          label={t("dashboard.stats.convLabel", "totale")}
          icon="forum"
          to="/mesaje"
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Quota */}
          <QuotaCard
            count={stats?.listings.weeklyPostCount || 0}
            limit={stats?.listings.weeklyPostLimit || 5}
            resetsAt={stats?.listings.weekResetsAt || new Date().toISOString()}
          />

          {/* Expiring Section */}
          <ExpiringSection listings={filteredExpiring} />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <RecentConversations />

          {/* Quick Actions */}
          <div className="bg-primary-container p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-on-primary-container">
              {t("dashboard.quickActions.title", "Acțiuni rapide")}
            </h3>
            <div className="grid gap-2">
              <Link
                to="/adauga-anunt"
                className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl hover:shadow-md transition-shadow font-bold text-primary"
              >
                <span className="material-symbols-outlined">add_circle</span>
                {t("nav.addListing")}
              </Link>
              <Link
                to="/cont/setari"
                className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl hover:shadow-md transition-shadow font-bold text-on-surface"
              >
                <span className="material-symbols-outlined">settings</span>
                {t("dashboard.quickActions.settings", "Setări cont")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
