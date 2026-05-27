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

export function ListingGrid({
  listings,
  isLoading,
  viewMode,
  onReset,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            : "flex flex-col gap-6"
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
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span
          className="material-symbols-outlined text-outline"
          style={{ fontSize: "48px" }}
        >
          search_off
        </span>
        <p className="text-lg font-bold text-on-surface">Niciun anunț găsit</p>
        <p className="text-on-surface-variant text-sm">
          Încearcă să modifici filtrele pentru mai multe rezultate.
        </p>
        <button
          onClick={onReset}
          className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
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
            className="flex gap-4 bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer no-underline relative"
          >
            {l.coverUrl ? (
              <img
                src={l.coverUrl}
                alt={l.title}
                className="w-40 h-32 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-40 h-32 bg-surface-container flex-shrink-0 flex items-center justify-center text-outline">
                <span className="material-symbols-outlined">image</span>
              </div>
            )}
            <div className="p-4 flex flex-col justify-center gap-1">
              <span className="text-xl font-black text-primary">
                {l.priceRon !== null
                  ? `${l.priceRon.toLocaleString("ro-RO")} RON`
                  : "Gratuit"}
              </span>
              <h3 className="font-bold text-on-surface">{l.title}</h3>
              <p className="text-xs text-outline uppercase tracking-wider font-medium">
                {l.city} • {formatRelativeTime(l.postedAt)}
              </p>
              {l.sellerVerified && (
                <span className="text-xs font-bold text-white bg-tertiary-container px-2 py-0.5 rounded-full self-start">
                  Verificat
                </span>
              )}
            </div>
            <FavoriteToggle
              listingId={l.id}
              className="absolute top-4 right-4"
              size="sm"
            />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
