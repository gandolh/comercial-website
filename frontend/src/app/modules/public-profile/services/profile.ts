import { axiosInstance } from "@core/lib/axios";
import type { ListingCard } from "@app/types/listing";

export interface PublicUserResponse {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  member_since: string;
  active_listings_count: number;
  total_downloads: number;
}

export interface ListingsPageResponse {
  items: ListingCard[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export async function getPublicProfile(
  userId: string,
): Promise<PublicUserResponse> {
  const res = await axiosInstance.get(`/users/${userId}`);
  return res.data;
}

export async function getUserListings(
  userId: string,
  params?: Record<string, unknown>,
): Promise<ListingsPageResponse> {
  const res = await axiosInstance.get(`/users/${userId}/listings`, { params });
  return res.data;
}
