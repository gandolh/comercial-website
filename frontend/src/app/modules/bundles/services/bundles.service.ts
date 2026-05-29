import { axiosInstance } from "@core/lib/axios";
import type { BundleChildCard } from "../types/bundle";

/**
 * Fetch the child listing cards for a bundle listing.
 * Public endpoint — no auth required.
 */
export async function fetchBundleItems(bundleListingId: string): Promise<BundleChildCard[]> {
  const res = await axiosInstance.get<BundleChildCard[]>(
    `/listings/${bundleListingId}/bundle-items`
  );
  return res.data;
}

/**
 * Set (replace) the child listing IDs for a bundle the caller owns.
 * Requires authentication.
 */
export async function setBundleItems(
  bundleListingId: string,
  childListingIds: string[]
): Promise<{ bundle_listing_id: string; child_listing_ids: string[] }> {
  const res = await axiosInstance.post<{
    bundle_listing_id: string;
    child_listing_ids: string[];
  }>(`/listings/${bundleListingId}/bundle-items`, {
    child_listing_ids: childListingIds,
  });
  return res.data;
}
