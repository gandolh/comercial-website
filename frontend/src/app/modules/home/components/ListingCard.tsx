import { Link } from "@core/lib/router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { ListingCard as ListingCardItem } from "@app/types/listing";
import { FavoriteToggle } from "@app/modules/favorites/components/FavoriteToggle";
import { PreviewImage } from "@app/modules/listings/components/PreviewImage";

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
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface no-underline shadow-card transition-shadow hover:shadow-band"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <PreviewImage src={listing.coverUrl} alt={listing.title} category={listing.category} />
        <FavoriteToggle listingId={listing.id} className="absolute top-3 right-3" size="sm" />
        {listing.sellerVerified && (
          <span className="absolute bottom-3 left-3 inline-flex h-6 items-center gap-1 rounded-xl bg-tertiary-container pr-2.5 pl-2 text-label font-semibold text-on-fill">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">
              verified
            </span>
            {t("listing.verified")}
          </span>
        )}
        {isExpired && (
          <span className="absolute right-3 bottom-3 inline-flex h-6 items-center rounded-xl bg-error px-2.5 text-label font-semibold text-on-error">
            Expirat
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-4 pt-4 pb-4.5">
        <span className="text-price font-extrabold text-primary tabular-nums">
          {listing.priceRon != null ? `${listing.priceRon.toLocaleString("ro-RO")} RON` : "Gratuit"}
        </span>
        <h3 className="line-clamp-2 text-card-title text-on-surface transition-colors group-hover:text-primary">
          {listing.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-control text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
            schedule
          </span>
          {postedAt}
        </p>
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
