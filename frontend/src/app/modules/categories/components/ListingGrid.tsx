import { Link } from "@core/lib/router";
import { Button } from "@core/components/ui";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { ListingCard } from "@app/modules/home/components/ListingCard";
import { PreviewImage } from "@app/modules/listings/components/PreviewImage";
import { FavoriteToggle } from "@app/modules/favorites/components/FavoriteToggle";
import type { ListingCard as ListingCardItem } from "@app/types/listing";

function formatRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "Acum câteva minute";
  if (diffH < 24) return `Acum ${diffH} ${diffH === 1 ? "oră" : "ore"}`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Ieri";
  return `Acum ${diffD} zile`;
}

interface ListingGridProps {
  listings: ListingCardItem[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  onReset: () => void;
}

export function ListingGrid({ listings, isLoading, viewMode, onReset }: ListingGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid list-none grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 p-0 md:gap-6"
            : "flex flex-col gap-4"
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: "48px" }}
          aria-hidden="true"
        >
          search_off
        </span>
        <p className="text-price font-extrabold text-on-surface">Niciun anunț găsit</p>
        <p className="text-control text-on-surface-variant">
          Încearcă să modifici filtrele pentru mai multe rezultate.
        </p>
        <Button className="mt-2" onClick={onReset}>
          Resetează Filtrele
        </Button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        {listings.map((l) => (
          <Link
            key={l.id}
            to={`/anunturi/${l.id}`}
            className="relative flex overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface no-underline shadow-card transition-shadow hover:shadow-band"
          >
            <div className="h-32 w-30 shrink-0 overflow-hidden md:w-40">
              <PreviewImage src={l.coverUrl} alt={l.title} category={l.category} iconSize={32} />
            </div>
            <div className="flex min-w-0 flex-col justify-center gap-1 p-4 pr-14">
              <span className="text-price font-extrabold text-primary tabular-nums">
                {l.priceRon !== null ? `${l.priceRon.toLocaleString("ro-RO")} RON` : "Gratuit"}
              </span>
              <h3 className="text-card-title text-on-surface">{l.title}</h3>
              <p className="text-control text-on-surface-variant">{formatRelativeTime(l.postedAt)}</p>
              {l.sellerVerified && (
                <span className="inline-flex h-6 items-center gap-1 self-start rounded-xl bg-tertiary-container px-2.5 text-label font-semibold text-on-fill">
                  Verificat
                </span>
              )}
            </div>
            <FavoriteToggle listingId={l.id} className="absolute top-2 right-2" size="sm" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid list-none grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 p-0 md:gap-6">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
