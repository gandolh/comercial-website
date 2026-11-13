import { useTranslation } from "react-i18next";
import { useAuth } from "@core/lib/auth";
import { useMyStats } from "../hooks/useMyStats";
import { StatCard } from "../components/StatCard";
import { QuotaCard } from "../components/QuotaCard";
import { ExpiringSection } from "../components/ExpiringSection";
import { RecentConversations } from "../components/RecentConversations";
import { EarningsSection } from "../components/EarningsSection";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { useMyListings } from "../hooks/useMyListings";
import { Link } from "@core/lib/router";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useMyStats();
  const { data: activeListings } = useMyListings({ active: true });

  const displayName = user?.display_name || user?.email?.split("@")[0] || "Utilizator";

  if (statsLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-screen-2xl space-y-12 px-8 py-12 pt-8">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      </main>
    );
  }

  if (statsError) {
    return (
      <main className="mx-auto min-h-screen max-w-screen-2xl px-8 py-12 pt-8">
        <ErrorCard
          message={t("dashboard.error", "Nu am putut încărca datele panoului de control.")}
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
    <main className="mx-auto min-h-screen max-w-screen-2xl space-y-12 px-8 py-12 pt-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-black text-on-surface">
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
          className="flex items-center gap-3 rounded-2xl bg-error-container px-5 py-4 text-on-error-container"
        >
          <span className="material-symbols-outlined shrink-0 text-2xl" aria-hidden="true">
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
            className="ml-auto shrink-0 font-bold underline transition-opacity hover:opacity-80"
          >
            {t("dashboard.expiringSoon.bannerAction", "Vezi anunțurile")}
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="space-y-12 lg:col-span-2">
          {/* Quota */}
          <QuotaCard
            count={stats?.listings.weeklyPostCount || 0}
            limit={stats?.listings.weeklyPostLimit || 5}
            resetsAt={stats?.listings.weekResetsAt || new Date().toISOString()}
          />

          {/* Earnings and the simulated payout */}
          <EarningsSection />

          {/* Expiring Section */}
          <ExpiringSection listings={filteredExpiring} />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <RecentConversations />

          {/* Quick Actions */}
          <div className="space-y-4 rounded-2xl bg-primary-container p-6">
            <h3 className="font-bold text-on-primary-container">
              {t("dashboard.quickActions.title", "Acțiuni rapide")}
            </h3>
            <div className="grid gap-2">
              <Link
                to="/adauga-anunt"
                className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3 font-bold text-primary transition-shadow hover:shadow-md"
              >
                <span className="material-symbols-outlined">add_circle</span>
                {t("nav.addListing")}
              </Link>
              <Link
                to="/cont/setari"
                className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3 font-bold text-on-surface transition-shadow hover:shadow-md"
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
