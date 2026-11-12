import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { ListingCard as ListingCardItem } from "@app/types/listing";
import { FavoriteToggle } from "@app/modules/favorites/components/FavoriteToggle";

interface ListingCardProps {
  listing: ListingCardItem;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation();
  const postedAt = formatRelativeTime(listing.postedAt);
  const isExpired = useMemo(() => {
    return !listing.active || new Date(listing.expiresAt) <= new Date();
  }, [listing.active, listing.expiresAt]);

  return (
    <Link
      to={`/anunturi/${listing.id}`}
      className="group block cursor-pointer overflow-hidden rounded-xl bg-surface-container-lowest no-underline transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative h-64 overflow-hidden">
        {listing.coverUrl ? (
          <img
            src={listing.coverUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-container text-outline">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
              image
            </span>
          </div>
        )}
        <FavoriteToggle listingId={listing.id} className="absolute top-4 right-4" size="sm" />
        {listing.sellerVerified && (
          <span className="absolute bottom-4 left-4 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-fill">
            {t("listing.verified")}
          </span>
        )}
        {isExpired && (
          <span className="absolute right-4 bottom-4 rounded-full bg-error px-3 py-1 text-xs font-bold text-on-primary">
            Expirat
          </span>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-primary">
            {listing.priceRon != null ? `${listing.priceRon.toLocaleString("ro-RO")} RON` : "Gratuit"}
          </span>
          <h3 className="text-lg leading-tight font-bold text-on-surface transition-colors group-hover:text-primary">
            {listing.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium tracking-wide text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            schedule
          </span>
          <span>{postedAt}</span>
        </div>
      </div>
    </Link>
  );
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 1) return "Acum câteva minute";
  if (diffHours < 24) return `Acum ${diffHours} ${diffHours === 1 ? "oră" : "ore"}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ieri";
  return `Acum ${diffDays} zile`;
}
