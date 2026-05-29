import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBundleItems, setBundleItems } from "../services/bundles.service";
import type { BundleChildCard } from "../types/bundle";

/**
 * React Query hook — fetches the child listing cards for a bundle listing.
 * Only enabled when `listingId` is provided and `isBundle` is true.
 */
export function useBundleItems(listingId: string, isBundle: boolean) {
  return useQuery<BundleChildCard[]>({
    queryKey: ["bundle-items", listingId],
    queryFn: () => fetchBundleItems(listingId),
    enabled: Boolean(listingId) && isBundle,
    staleTime: 60_000,
  });
}

/**
 * React Query mutation — replaces the child listing IDs for a bundle the caller owns.
 * Invalidates the bundle-items query for the listing on success.
 */
export function useSetBundleItems(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (childIds: string[]) => setBundleItems(listingId, childIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-items", listingId] });
    },
  });
}
