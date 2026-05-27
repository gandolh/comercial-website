import { axiosInstance } from "@core/lib/axios";
import type { ListingCard, ListingsPage } from "@app/types/listing";
import type { FilterState } from "../types";

export interface ListingCardApi {
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
}

export interface ListingsPageApi {
  listings: ListingCardApi[];
  total_count: number;
  total_pages: number;
  page: number;
}

export function mapListingCard(listing: ListingCardApi): ListingCard {
  return {
    id: listing.id,
    title: listing.title,
    priceRon: listing.price_ron,
    city: listing.city,
    category: listing.category,
    coverUrl: listing.cover_url,
    sellerVerified: listing.seller_verified,
    postedAt: listing.posted_at,
    active: listing.active,
    expiresAt: listing.expires_at,
  };
}

export function mapListingsPage(page: ListingsPageApi): ListingsPage {
  return {
    listings: page.listings.map(mapListingCard),
    totalCount: page.total_count,
    totalPages: page.total_pages,
    page: page.page,
  };
}

export async function searchListings(params: {
  category?: string;
  q?: string;
  filters: FilterState;
}): Promise<ListingsPage> {
  const search: Record<string, string | number | boolean> = {};
  if (params.category) search.category = params.category;
  if (params.q) search.q = params.q;
  if (params.filters.licenta) search.license_type = params.filters.licenta;
  if (params.filters.format) search.file_format = params.filters.format;
  if (params.filters.pret_min != null)
    search.price_min = params.filters.pret_min;
  if (params.filters.pret_max != null)
    search.price_max = params.filters.pret_max;
  if (params.filters.data !== "oricand") search.date = params.filters.data;
  if (params.filters.verificat) search.verified = true;
  if (params.filters.sortare !== "noi") search.sort = params.filters.sortare;
  search.page = params.filters.pagina;
  search.per_page = 12;

  const response = await axiosInstance.get<ListingsPageApi>("/listings", {
    params: search,
  });
  return mapListingsPage(response.data);
}

export async function getFeaturedListings(): Promise<ListingCard[]> {
  const response =
    await axiosInstance.get<ListingCardApi[]>("/listings/featured");
  return response.data.map(mapListingCard);
}
