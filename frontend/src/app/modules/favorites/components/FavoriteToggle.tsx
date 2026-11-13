import { useMemo } from "react";
import { useLocation } from "@core/lib/router";
import { toast } from "@core/components/ui";
import { useAuth } from "@core/lib/auth";
import { AuthRequiredToast } from "@core/components/ui";
import { useFavoriteIds } from "../hooks/useFavoriteIds";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

interface FavoriteToggleProps {
  listingId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteToggle({ listingId, className = "", size = "md" }: FavoriteToggleProps) {
  const location = useLocation();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const favoriteIdsQuery = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isFavorited = useMemo(
    () => favoriteIdsQuery.data?.includes(listingId) ?? false,
    [favoriteIdsQuery.data, listingId],
  );

  const dimension = size === "sm" ? "size-11" : "size-12";
  const iconSize = size === "sm" ? "20px" : "24px";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      const searchStr = new URLSearchParams(location.search as Record<string, string>).toString();
      const next = searchStr ? `${location.pathname}?${searchStr}` : location.pathname;
      toast.custom(() => <AuthRequiredToast next={next} message="Conectează-te pentru a salva anunțuri." />);
      return;
    }

    toggleFavorite.mutate({ id: listingId, on: !isFavorited });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      className={`${dimension} flex items-center justify-center rounded-full bg-surface-container-lowest shadow-card transition-colors hover:bg-surface-container-low ${className}`}
      aria-label={isFavorited ? "Elimină de la favorite" : "Adaugă la favorite"}
    >
      <span
        className={isFavorited ? "material-symbols-outlined text-error" : "material-symbols-outlined text-primary"}
        style={{
          fontSize: iconSize,
          fontVariationSettings: isFavorited ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined,
        }}
      >
        favorite
      </span>
    </button>
  );
}
