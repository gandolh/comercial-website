import { axiosInstance } from "@core/lib/axios";
import type { ListingCard, ListingDetail } from "@app/types/listing";
import { mapListingCard } from "@app/modules/categories/services/listings";

interface ListingImageApi {
  id: string;
  url: string;
  position: number;
}

interface ListingAssetApi {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
}

interface ListingSellerApi {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  member_since: string;
  active_listings_count: number;
}

interface ListingDetailApi {
  id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: boolean;
  category: string;
  category_label: string;
  city: string;
  images: ListingImageApi[];
  view_count: number;
  posted_at: string;
  expires_at: string;
  active: boolean;
  seller: ListingSellerApi;
  license_type?: 'personal' | 'commercial' | 'extended';
  file_format?: string;
  file_size_bytes?: number;
  download_count?: number;
  assets?: ListingAssetApi[];
  is_bundle?: boolean;
}

export function mapListingDetail(detail: ListingDetailApi): ListingDetail {
  return {
    id: detail.id,
    title: detail.title,
    description: detail.description,
    priceRon: detail.price_ron,
    isNegotiable: detail.is_negotiable,
    category: detail.category,
    categoryLabel: detail.category_label,
    city: detail.city,
    images: detail.images,
    viewCount: detail.view_count,
    postedAt: detail.posted_at,
    expiresAt: detail.expires_at,
    active: detail.active,
    seller: {
      id: detail.seller.id,
      displayName: detail.seller.display_name,
      avatarUrl: detail.seller.avatar_url,
      phoneVerified: detail.seller.phone_verified,
      memberSince: detail.seller.member_since,
      activeListingsCount: detail.seller.active_listings_count,
    },
    licenseType: detail.license_type,
    fileFormat: detail.file_format,
    fileSizeBytes: detail.file_size_bytes,
    downloadCount: detail.download_count,
    assets: (detail.assets ?? []).map(asset => ({
      id: asset.id,
      originalFilename: asset.original_filename,
      fileSizeBytes: asset.file_size_bytes,
      contentType: asset.content_type,
      position: asset.position,
    })),
    isBundle: detail.is_bundle ?? false,
  };
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price_ron?: number | null;
  is_negotiable?: boolean;
  category?: string;
  city?: string;
  active?: boolean;
}

export async function updateListing(
  id: string,
  patch: UpdateListingRequest,
): Promise<ListingDetail> {
  const response = await axiosInstance.patch<ListingDetailApi>(
    `/listings/${id}`,
    patch,
  );
  return mapListingDetail(response.data);
}

export async function renewListing(id: string): Promise<ListingDetail> {
  const response = await axiosInstance.post<ListingDetailApi>(
    `/listings/${id}/renew`,
  );
  return mapListingDetail(response.data);
}

export async function deactivateListing(id: string): Promise<ListingDetail> {
  const response = await axiosInstance.post<ListingDetailApi>(
    `/listings/${id}/deactivate`,
  );
  return mapListingDetail(response.data);
}

export async function activateListing(id: string): Promise<ListingDetail> {
  const response = await axiosInstance.post<ListingDetailApi>(
    `/listings/${id}/activate`,
  );
  return mapListingDetail(response.data);
}

export async function deleteListing(id: string): Promise<void> {
  await axiosInstance.delete(`/listings/${id}`);
}

export async function fetchListingDetail(id: string): Promise<ListingDetail> {
  const response = await axiosInstance.get<ListingDetailApi>(`/listings/${id}`);
  return mapListingDetail(response.data);
}

export async function fetchRelatedListings(id: string): Promise<ListingCard[]> {
  const response = await axiosInstance.get<
    Array<{
      id: string;
      title: string;
      price_ron: number | null;
      city: string;
      category: string;
      cover_url: string | null;
      seller_verified: boolean;
      posted_at: string;
      active: boolean;
      expires_at: string;
    }>
  >(`/listings/${id}/related`);

  return response.data.map(mapListingCard);
}

export async function fetchSellerPhone(listingId: string): Promise<string> {
  const response = await axiosInstance.get<{ phone: string }>(
    `/listings/${listingId}/seller-phone`,
  );
  return response.data.phone;
}

export interface DownloadAssetResponse {
  download_url: string;
  filename: string;
}

export async function downloadAsset(
  listingId: string,
): Promise<DownloadAssetResponse> {
  const response = await axiosInstance.get<DownloadAssetResponse>(
    `/listings/${listingId}/download`,
  );
  return response.data;
}

export interface ListingAssetMeta {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
}

export async function fetchListingAssets(
  listingId: string,
): Promise<ListingAssetMeta[]> {
  const response = await axiosInstance.get<ListingAssetMeta[]>(
    `/listings/${listingId}/assets`,
  );
  return response.data;
}

/**
 * Trigger a per-asset download by navigating to the stream endpoint.
 * The browser will handle the file download via Content-Disposition header.
 * Returns the direct URL so callers can open it in a new tab or use an anchor.
 */
export function getAssetDownloadUrl(listingId: string, assetId: string): string {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
  return `${base}/listings/${listingId}/assets/${assetId}/download`;
}
