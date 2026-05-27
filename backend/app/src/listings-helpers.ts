import type { Config } from "@my-olx/core";
import type { ListingImageRow, ListingRow, SellerRow } from "./repositories/listings.repo.js";

/**
 * Convert S3 key to public image URL
 */
export function imageUrl(s3Key: string | null, config: Config): string | null {
  if (!s3Key) return null;

  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }

  const baseUrl = config.s3PublicBaseUrl.replace(/\/$/, "");
  const key = s3Key.replace(/^\//, "");
  return `${baseUrl}/${key}`;
}

/**
 * Category slug to label mapping
 */
const CATEGORY_LABELS: Record<string, string> = {
  electronice: "Electronice",
  auto: "Auto, moto și ambarcațiuni",
  imobiliare: "Imobiliare",
  "casa-gradina": "Casă și grădină",
  moda: "Modă și frumusețe",
  joburi: "Locuri de muncă",
  servicii: "Servicii, afaceri",
  sport: "Sport și timp liber",
  gratuit: "Oferite gratuit",
};

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? "Diverse";
}

/**
 * Listing -> ListingCardResponse mapping
 */
export interface ListingCardResponse {
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

export function toListingCardResponse(
  listing: ListingRow,
  images: ListingImageRow[],
  sellerVerified: boolean,
  config: Config
): ListingCardResponse {
  const coverImage = images.find((img) => img.position === 0);
  const createdAt = typeof listing.created_at === 'string'
    ? listing.created_at
    : listing.created_at.toISOString();
  const expiresAt = typeof listing.expires_at === 'string'
    ? listing.expires_at
    : listing.expires_at.toISOString();
  return {
    id: listing.id,
    title: listing.title,
    price_ron: listing.price_ron,
    city: listing.city,
    category: listing.category,
    cover_url: imageUrl(coverImage?.s3_key ?? null, config),
    seller_verified: sellerVerified,
    posted_at: createdAt,
    active: listing.active,
    expires_at: expiresAt,
  };
}

/**
 * Listing -> ListingResponse mapping
 */
export interface ListingResponse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: boolean;
  category: string;
  city: string;
  active: boolean;
  expires_at: string;
  created_at: string;
}

export function toListingResponse(listing: ListingRow): ListingResponse {
  const createdAt = typeof listing.created_at === 'string'
    ? listing.created_at
    : listing.created_at.toISOString();
  const expiresAt = typeof listing.expires_at === 'string'
    ? listing.expires_at
    : listing.expires_at.toISOString();
  return {
    id: listing.id,
    user_id: listing.user_id,
    title: listing.title,
    description: listing.description,
    price_ron: listing.price_ron,
    is_negotiable: listing.is_negotiable,
    category: listing.category,
    city: listing.city,
    active: listing.active,
    expires_at: expiresAt,
    created_at: createdAt,
  };
}

/**
 * SellerRow -> SellerSummary mapping
 */
export interface SellerSummary {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  member_since: string;
  active_listings_count: number;
}

export function toSellerSummary(
  seller: SellerRow,
  activeListingsCount: number,
  config: Config
): SellerSummary {
  const memberSince = typeof seller.created_at === 'string'
    ? seller.created_at
    : seller.created_at.toISOString();
  return {
    id: seller.id,
    display_name: seller.display_name,
    avatar_url: imageUrl(seller.avatar_url, config),
    phone_verified: seller.phone_verified,
    member_since: memberSince,
    active_listings_count: activeListingsCount,
  };
}

/**
 * Listing + related data -> ListingDetailResponse mapping
 */
export interface ListingDetailResponse {
  id: string;
  title: string;
  description: string;
  price_ron: number | null;
  is_negotiable: boolean;
  category: string;
  category_label: string;
  city: string;
  images: Array<{
    id: string;
    url: string | null;
    position: number;
  }>;
  view_count: number;
  posted_at: string;
  expires_at: string;
  active: boolean;
  seller: SellerSummary;
  license_type: string;
  file_format: string | null;
  file_size_bytes: number | null;
  download_count: number;
  assets: AssetResponse[];
}

export function toListingDetailResponse(
  listing: ListingRow,
  images: ListingImageRow[],
  seller: SellerSummary,
  config: Config,
  assets: AssetResponse[] = []
): ListingDetailResponse {
  const createdAt = typeof listing.created_at === 'string'
    ? listing.created_at
    : listing.created_at.toISOString();
  const expiresAt = typeof listing.expires_at === 'string'
    ? listing.expires_at
    : listing.expires_at.toISOString();
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price_ron: listing.price_ron,
    is_negotiable: listing.is_negotiable,
    category: listing.category,
    category_label: categoryLabel(listing.category),
    city: listing.city,
    images: images.map((img) => ({
      id: img.id,
      url: imageUrl(img.s3_key, config),
      position: img.position,
    })),
    view_count: listing.view_count,
    posted_at: createdAt,
    expires_at: expiresAt,
    active: listing.active,
    seller,
    license_type: listing.license_type,
    file_format: listing.file_format,
    file_size_bytes: listing.file_size_bytes,
    download_count: listing.download_count,
    assets,
  };
}

/**
 * Paginated listings response
 */
export interface ListingsPageResponse {
  listings: ListingCardResponse[];
  total_count: number;
  total_pages: number;
  page: number;
}

/**
 * Asset response for listing detail
 */
export interface AssetResponse {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
}
