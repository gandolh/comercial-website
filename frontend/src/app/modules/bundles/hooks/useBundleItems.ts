import { useQuery } from "@tanstack/react-query";
import { fetchBundleItems } from "../services/bundles.service";
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
