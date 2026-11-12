import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInDays, formatDistanceToNow, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { ListingCard } from "@app/modules/home/components/ListingCard";
import { RenewButton } from "@app/modules/listings/components/RenewButton";
import { Badge } from "@core/components/ui";
import type { ListingCard as ListingCardType } from "@app/types/listing";

interface ExpiringSectionProps {
  listings: ListingCardType[];
}

export function ExpiringSection({ listings }: ExpiringSectionProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  if (listings.length === 0) return null;

  const handleRenewSuccess = () => {
    void qc.invalidateQueries({ queryKey: ["me", "stats"] });
    void qc.invalidateQueries({ queryKey: ["me", "listings"] });
  };

  return (
    <section className="space-y-6" aria-label={t("dashboard.expiringSoon.title", "Anunțuri care expiră curând")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error" aria-hidden="true">
            notification_important
          </span>
          <h2 className="text-xl font-bold text-on-surface">
            {t("dashboard.expiringSoon.title", "Anunțuri care expiră curând")}
          </h2>
          <Badge variant="error" className="ml-1">
            {listings.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => {
          const expiresAt = parseISO(listing.expiresAt);
          const daysLeft = differenceInDays(expiresAt, new Date());
          const isCritical = daysLeft <= 3;

          return (
            <div key={listing.id} className="group relative">
              <ListingCard listing={listing} />

              {/* Expiry badge overlay */}
              <div className="absolute top-2 right-2 z-raised">
                {isCritical ? (
                  <Badge variant="error" icon="warning">
                    {daysLeft <= 0
                      ? t("dashboard.expiringSoon.expiresInDays_0", "Expiră azi")
                      : t("dashboard.expiringSoon.expiresInDays", {
                          count: daysLeft,
                          defaultValue: `Expiră în ${daysLeft} zile`,
                        })}
                  </Badge>
                ) : (
                  <div className="rounded-sm bg-surface-container-high px-2 py-1 text-xs font-bold text-on-surface-variant shadow-lg">
                    {t("dashboard.expiringSoon.expiresIn", "Expiră în")}{" "}
                    {formatDistanceToNow(expiresAt, { locale: ro })}
                  </div>
                )}
              </div>

              {/* Renew button */}
              <div className="mt-3" onClick={handleRenewSuccess}>
                <RenewButton
                  listingId={listing.id}
                  expiresAt={listing.expiresAt}
                  alwaysShow
                  className="w-full justify-center rounded-xl py-2.5"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
