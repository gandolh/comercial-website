import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addFavorite, removeFavorite } from "../services/favorites";

interface ToggleFavoriteInput {
  id: string;
  on: boolean;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, on }: ToggleFavoriteInput) => {
      if (on) {
        await addFavorite(id);
        return;
      }
      await removeFavorite(id);
    },
    onMutate: async ({ id, on }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", "ids"] });
      const previousIds =
        queryClient.getQueryData<string[]>(["favorites", "ids"]) ?? [];
      queryClient.setQueryData<string[]>(
        ["favorites", "ids"],
        on
          ? Array.from(new Set([...previousIds, id]))
          : previousIds.filter((value) => value !== id),
      );

      const favoritePages = queryClient.getQueriesData({
        queryKey: ["favorites", "page"],
      });
      favoritePages.forEach(([queryKey, data]) => {
        if (!data || typeof data !== "object" || !("listings" in data)) return;
        const typed = data as {
          listings: Array<{ id: string }>;
          totalCount: number;
          totalPages: number;
          page: number;
        };
        if (!on) {
          queryClient.setQueryData(queryKey, {
            ...typed,
            listings: typed.listings.filter((listing) => listing.id !== id),
            totalCount: Math.max(typed.totalCount - 1, 0),
          });
        }
      });

      return { previousIds };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(["favorites", "ids"], context.previousIds);
      }
      toast.error("Nu am putut actualiza favoritele.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
