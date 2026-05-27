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
      className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer no-underline block"
    >
      <div className="relative h-64 overflow-hidden">
        {listing.coverUrl ? (
          <img
            src={listing.coverUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center text-outline">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px" }}
            >
              image
            </span>
          </div>
        )}
        <FavoriteToggle
          listingId={listing.id}
          className="absolute top-4 right-4"
          size="sm"
        />
        {listing.sellerVerified && (
          <span className="absolute bottom-4 left-4 bg-tertiary-container text-on-tertiary text-xs font-bold px-3 py-1 rounded-full">
            {t("listing.verified")}
          </span>
        )}
        {isExpired && (
          <span className="absolute bottom-4 right-4 bg-error text-on-primary text-xs font-bold px-3 py-1 rounded-full">
            Expirat
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-primary">
            {listing.priceRon != null
              ? `${listing.priceRon.toLocaleString("ro-RO")} RON`
              : "Gratuit"}
          </span>
          <h3 className="text-lg font-bold leading-tight text-on-surface group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium tracking-wide">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            location_on
          </span>
          <span>
            {listing.city} • {postedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 1) return "Acum câteva minute";
  if (diffHours < 24)
    return `Acum ${diffHours} ${diffHours === 1 ? "oră" : "ore"}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ieri";
  return `Acum ${diffDays} zile`;
}
