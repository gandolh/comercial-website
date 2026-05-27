import { useQuery } from "@tanstack/react-query";
import { getFeaturedListings } from "@app/modules/categories/services/listings";

export function useFeaturedListings() {
  return useQuery({
    queryKey: ["featured-listings"],
    queryFn: getFeaturedListings,
    staleTime: 60_000,
  });
}
