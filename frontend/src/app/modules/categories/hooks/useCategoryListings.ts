import { useQuery } from "@tanstack/react-query";
import { searchListings } from "../services/listings";
import type { FilterState } from "../types";

export function useCategoryListings(
  slug: string | undefined,
  filters: FilterState,
  q?: string,
) {
  return useQuery({
    queryKey: ["category-listings", slug, filters, q],
    queryFn: () => searchListings({ category: slug, q, filters }),
    placeholderData: (previousData) => previousData,
  });
}
