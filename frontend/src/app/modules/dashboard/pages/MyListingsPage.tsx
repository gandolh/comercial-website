import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMyListings } from "../hooks/useMyListings";
import { useListingMutations } from "@app/modules/listings/hooks/useListingMutations";
import { RenewButton } from "@app/modules/listings/components/RenewButton";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { Tabs, ConfirmDialog, Badge } from "@core/components/ui";
import { Link } from "@core/lib/router";
import type { ListingCard as ListingCardType } from "@app/types/listing";

type TabType = "active" | "inactive" | "expired";

function ExpiryInfo({ expiresAt, t }: { expiresAt: string; t: (key: string, fallback?: string) => string }) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const isExpired = expiryDate <= now;
  const daysLeft = differenceInDays(expiryDate, now);

  if (isExpired) {
    return (
      <Badge variant="error" icon="schedule_send">
        {t("dashboard.listings.expired", "Expirat")}
      </Badge>
    );
  }

  if (daysLeft <= 3) {
    return (
      <Badge variant="error" icon="warning">
        {t("dashboard.listings.expiresInDays", `Expiră în ${daysLeft} zile`)}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-sm" aria-hidden="true">
        timer
      </span>
      {t("dashboard.listings.expiresIn", "Expiră în")} {formatDistanceToNow(expiryDate, { locale: ro })}
    </div>
  );
}

export function MyListingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const now = useMemo(() => new Date().getTime(), []);

  const { data, isLoading, isError, refetch } = useMyListings({
    active: activeTab === "active",
    expired: activeTab === "expired",
    page,
  });

  const { deactivate, activate, remove } = useListingMutations();

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      void refetch();
    } catch (error) {
      // eslint-disable-next-line no-console -- a developer diagnostic; the user is told through the UI
      console.error("Action failed:", error);
    }
  };

  const tabs = [
    {
      value: "active",
      label: t("dashboard.listings.tabs.active", "Active"),
      icon: "check_circle",
    },
    {
      value: "inactive",
      label: t("dashboard.listings.tabs.inactive", "Inactive"),
      icon: "pause_circle",
    },
    {
      value: "expired",
      label: t("dashboard.listings.tabs.expired", "Expirate"),
      icon: "history",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-screen-2xl space-y-8 px-8 py-12 pt-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-3xl font-black text-on-surface">
            {t("dashboard.listings.title", "Anunțurile mele")}
          </h1>
          <p className="text-on-surface-variant">
            {t("dashboard.listings.subtitle", "Gestionează și actualizează anunțurile tale.")}
          </p>
        </div>
        <Link
          to="/adauga-anunt"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container"
        >
          <span className="material-symbols-outlined">add_circle</span>
          {t("nav.addListing")}
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v: string) => {
          setActiveTab(v as TabType);
          setPage(1);
        }}
        tabs={tabs}
      >
        <></>
      </Tabs>

      {/* Expired-tab banner */}
      {activeTab === "expired" && (data?.listings?.length ?? 0) > 0 && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant"
        >
          <span className="material-symbols-outlined shrink-0 text-xl" aria-hidden="true">
            info
          </span>
          {t(
            "dashboard.listings.expiredBanner",
            "Anunțurile expirate nu mai sunt vizibile cumpărătorilor. Reînnoiește-le pentru a le reactiva.",
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface-container-low motion-safe:animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorCard message={t("dashboard.listings.error", "Nu am putut încărca anunțurile.")} onRetry={refetch} />
      ) : data?.listings?.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-outline">
            <span className="material-symbols-outlined text-4xl">inventory</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-on-surface">
              {t("dashboard.listings.empty.title", "Niciun anunț în această categorie")}
            </h3>
            <p className="mx-auto max-w-sm text-on-surface-variant">
              {t("dashboard.listings.empty.subtitle", "Inspiră-te și postează primul tău anunț chiar acum!")}
            </p>
          </div>
          <Link
            to="/adauga-anunt"
            className="inline-block rounded-xl bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:shadow-lg"
          >
            {t("nav.addListing")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.listings.map((listing: ListingCardType) => {
            const expiryDate = new Date(listing.expiresAt);
            const isExpired = expiryDate <= new Date();
            const daysLeft = differenceInDays(expiryDate, new Date());
            const isExpiringSoon = !isExpired && daysLeft <= 7 && expiryDate.getTime() - now < 7 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={listing.id}
                className={[
                  "bg-surface-container-lowest border rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow",
                  isExpired
                    ? "border-error/40 bg-error-container/5"
                    : daysLeft <= 3
                      ? "border-error/30"
                      : "border-outline-variant",
                ].join(" ")}
              >
                {/* Image */}
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-low md:w-48">
                  {listing.coverUrl ? (
                    <img src={listing.coverUrl} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant">
                      <span className="rounded-sm bg-surface-container-high px-2 py-0.5 uppercase">
                        {listing.category}
                      </span>
                    </div>
                    <h3 className="truncate text-lg font-bold text-on-surface">{listing.title}</h3>
                    <div className="text-xl font-black text-primary">
                      {listing.priceRon ? `${listing.priceRon} RON` : "Preț negociabil"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant md:mt-0">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        calendar_today
                      </span>
                      {t("dashboard.listings.postedAt", "Postat pe")} {format(new Date(listing.postedAt), "dd.MM.yyyy")}
                    </div>
                    <ExpiryInfo expiresAt={listing.expiresAt} t={t as (key: string, fallback?: string) => string} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row flex-wrap justify-center gap-2 md:flex-col">
                  <Link
                    to={`/anunturi/${listing.id}/editeaza`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 font-bold text-on-surface transition-colors hover:bg-surface-container-high md:flex-none"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    {t("listing.actions.edit")}
                  </Link>

                  {activeTab === "active" && (
                    <button
                      onClick={() => handleAction(() => deactivate.mutateAsync(listing.id))}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 font-bold text-on-surface transition-colors hover:bg-surface-container-high md:flex-none"
                    >
                      <span className="material-symbols-outlined text-sm">pause</span>
                      {t("listing.actions.deactivate")}
                    </button>
                  )}

                  {activeTab === "inactive" && (
                    <button
                      onClick={() => handleAction(() => activate.mutateAsync(listing.id))}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-on-primary transition-colors hover:opacity-90 md:flex-none"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      {t("listing.actions.activate")}
                    </button>
                  )}

                  {/* RenewButton shown for expired tab or expiring-soon active listings */}
                  {(activeTab === "expired" || isExpiringSoon) && (
                    <RenewButton
                      listingId={listing.id}
                      expiresAt={listing.expiresAt}
                      alwaysShow={activeTab === "expired"}
                      className="flex-1 rounded-xl md:flex-none"
                    />
                  )}

                  <button
                    onClick={() => setDeleteTarget(listing.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold text-error transition-colors hover:bg-error/10 md:flex-none"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {t("listing.actions.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void handleAction(() => remove.mutateAsync(deleteTarget));
            setDeleteTarget(null);
          }
        }}
        title={t("dashboard.listings.deleteTitle", "Șterge anunțul")}
        description={t(
          "dashboard.listings.deleteConfirm",
          "Ești sigur că vrei să ștergi acest anunț? Această acțiune nu poate fi anulată.",
        )}
        confirmLabel={t("listing.actions.delete", "Șterge")}
        variant="danger"
      />
    </main>
  );
}
