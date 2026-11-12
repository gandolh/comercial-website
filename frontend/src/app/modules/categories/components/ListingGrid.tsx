import { Link } from "@core/lib/router";
import { CardSkeleton } from "@core/components/ui/Skeleton";
import { ListingCard } from "@app/modules/home/components/ListingCard";
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
        className={viewMode === "grid" ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-6"}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: "48px" }}>
          search_off
        </span>
        <p className="text-lg font-bold text-on-surface">Niciun anunț găsit</p>
        <p className="text-sm text-on-surface-variant">Încearcă să modifici filtrele pentru mai multe rezultate.</p>
        <button
          onClick={onReset}
          className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
        >
          Resetează Filtrele
        </button>
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
            className="relative flex cursor-pointer gap-4 overflow-hidden rounded-xl bg-surface-container-lowest no-underline transition-all duration-300 hover:shadow-ambient"
          >
            {l.coverUrl ? (
              <img src={l.coverUrl} alt={l.title} className="h-32 w-40 shrink-0 object-cover" />
            ) : (
              <div className="flex h-32 w-40 shrink-0 items-center justify-center bg-surface-container text-outline">
                <span className="material-symbols-outlined">image</span>
              </div>
            )}
            <div className="flex flex-col justify-center gap-1 p-4">
              <span className="text-xl font-black text-primary">
                {l.priceRon !== null ? `${l.priceRon.toLocaleString("ro-RO")} RON` : "Gratuit"}
              </span>
              <h3 className="font-bold text-on-surface">{l.title}</h3>
              <p className="text-xs font-medium tracking-wider text-outline uppercase">
                {formatRelativeTime(l.postedAt)}
              </p>
              {l.sellerVerified && (
                <span className="self-start rounded-full bg-tertiary-container px-2 py-0.5 text-xs font-bold text-on-fill">
                  Verificat
                </span>
              )}
            </div>
            <FavoriteToggle listingId={l.id} className="absolute top-4 right-4" size="sm" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
