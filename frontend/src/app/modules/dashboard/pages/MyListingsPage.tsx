import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMyListings } from "../hooks/useMyListings";
import { useListingMutations } from "@app/modules/listings/hooks/useListingMutations";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { ErrorCard } from "@core/components/ui/ErrorCard";
import { Tabs, ConfirmDialog } from "@core/components/ui";
import { Link } from "@core/lib/router";
import type { ListingCard as ListingCardType } from "@app/types/listing";

type TabType = "active" | "inactive" | "expired";

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

  const { renew, deactivate, activate, remove } = useListingMutations();

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      refetch();
    } catch (error) {
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
    <main className="pt-24 min-h-screen max-w-screen-2xl mx-auto px-8 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {t("dashboard.listings.title", "Anunțurile mele")}
          </h1>
          <p className="text-on-surface-variant">
            {t(
              "dashboard.listings.subtitle",
              "Gestionează și actualizează anunțurile tale.",
            )}
          </p>
        </div>
        <Link
          to="/adauga-anunt"
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all"
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

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-surface-container-low animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : isError ? (
        <ErrorCard
          message={t(
            "dashboard.listings.error",
            "Nu am putut încărca anunțurile.",
          )}
          onRetry={refetch}
        />
      ) : data?.listings?.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant text-center space-y-4">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-outline">
            <span className="material-symbols-outlined text-4xl">
              inventory
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-on-surface">
              {t(
                "dashboard.listings.empty.title",
                "Niciun anunț în această categorie",
              )}
            </h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              {t(
                "dashboard.listings.empty.subtitle",
                "Inspiră-te și postează primul tău anunț chiar acum!",
              )}
            </p>
          </div>
          <Link
            to="/adauga-anunt"
            className="inline-block bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            {t("nav.addListing")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.listings.map((listing: ListingCardType) => (
            <div
              key={listing.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-full md:w-48 h-32 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0">
                {listing.coverUrl ? (
                  <img
                    src={listing.coverUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-4xl">
                      image
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <span className="bg-surface-container-high px-2 py-0.5 rounded uppercase">
                      {listing.category}
                    </span>
                    <span>•</span>
                    <span>{listing.city}</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface truncate">
                    {listing.title}
                  </h3>
                  <div className="text-xl font-black text-primary">
                    {listing.priceRon
                      ? `${listing.priceRon} RON`
                      : "Preț negociabil"}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-on-surface-variant mt-4 md:mt-0">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    {t("dashboard.listings.postedAt", "Postat pe")}{" "}
                    {format(new Date(listing.postedAt), "dd.MM.yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      timer
                    </span>
                    {new Date(listing.expiresAt) > new Date()
                      ? `${t("dashboard.listings.expiresIn", "Expiră în")} ${formatDistanceToNow(new Date(listing.expiresAt), { locale: ro })}`
                      : t("dashboard.listings.expired", "Expirat")}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 justify-center">
                <Link
                  to={`/anunturi/${listing.id}/editeaza`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                  {t("listing.actions.edit")}
                </Link>

                {activeTab === "active" && (
                  <button
                    onClick={() =>
                      handleAction(() => deactivate.mutateAsync(listing.id))
                    }
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      pause
                    </span>
                    {t("listing.actions.deactivate")}
                  </button>
                )}

                {activeTab === "inactive" && (
                  <button
                    onClick={() =>
                      handleAction(() => activate.mutateAsync(listing.id))
                    }
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      play_arrow
                    </span>
                    {t("listing.actions.activate")}
                  </button>
                )}

                {(activeTab === "expired" ||
                  (activeTab === "active" &&
                    new Date(listing.expiresAt).getTime() - now <
                      7 * 24 * 60 * 60 * 1000)) && (
                  <button
                    onClick={() =>
                      handleAction(() => renew.mutateAsync(listing.id))
                    }
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      refresh
                    </span>
                    {t("listing.actions.renew")}
                  </button>
                )}

                <button
                  onClick={() => setDeleteTarget(listing.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-xl font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                  {t("listing.actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleAction(() => remove.mutateAsync(deleteTarget));
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
