import type { Config } from "@my-olx/core";
import type { ListingImageRow, ListingRow, SellerRow } from "./repositories/listings.repo.js";

export function imageUrl(s3Key: string | null, config: Config): string | null {
  if (!s3Key) return null;
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) return s3Key;
  const base = config.publicBaseUrl.replace(/\/$/, "");
  const key = s3Key.replace(/^\//, "");
  return `${base}/uploads/${key}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  grafica: "Grafică & Ilustrații",
  sabloane: "Șabloane & Template-uri",
  software: "Software & Aplicații",
  "cod-sursa": "Cod Sursă",
  audio: "Audio & Muzică",
  video: "Video & Motion",
  ebook: "E-Bookuri & Cursuri",
  fonturi: "Fonturi",
  documente: "Documente & Template-uri Legale",
  "3d": "Modele 3D & AR",
  mestesugart: "Artizanat Digital",
  diverse: "Diverse",
};

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? "Diverse";
}

export interface ListingCardResponse {
  id: string;
  title: string;
  price_ron: number | null;
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
  return {
    id: listing.id,
    title: listing.title,
    price_ron: listing.price_ron,
    category: listing.category,
    cover_url: imageUrl(coverImage?.s3_key ?? null, config),
    seller_verified: sellerVerified,
    posted_at: listing.created_at,
    active: Boolean(listing.active),
    expires_at: listing.expires_at,
  };
}

export interface ListingResponse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_ron: number | null;
  category: string;
  active: boolean;
  expires_at: string;
  created_at: string;
}

export function toListingResponse(listing: ListingRow): ListingResponse {
  return {
    id: listing.id,
    user_id: listing.user_id,
    title: listing.title,
    description: listing.description,
    price_ron: listing.price_ron,
    category: listing.category,
    active: Boolean(listing.active),
    expires_at: listing.expires_at,
    created_at: listing.created_at,
  };
}

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
  return {
    id: seller.id,
    display_name: seller.display_name,
    avatar_url: imageUrl(seller.avatar_url, config),
    phone_verified: Boolean(seller.phone_verified),
    member_since: seller.created_at,
    active_listings_count: activeListingsCount,
  };
}

export interface AssetResponse {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
}

export interface ListingDetailResponse {
  id: string;
  title: string;
  description: string;
  price_ron: number | null;
  category: string;
  category_label: string;
  images: Array<{ id: string; url: string | null; position: number }>;
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
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price_ron: listing.price_ron,
    category: listing.category,
    category_label: categoryLabel(listing.category),
    images: images.map((img) => ({
      id: img.id,
      url: imageUrl(img.s3_key, config),
      position: img.position,
    })),
    view_count: listing.view_count,
    posted_at: listing.created_at,
    expires_at: listing.expires_at,
    active: Boolean(listing.active),
    seller,
    license_type: listing.license_type,
    file_format: listing.file_format,
    file_size_bytes: listing.file_size_bytes,
    download_count: listing.download_count,
    assets,
  };
}

export interface ListingsPageResponse {
  listings: ListingCardResponse[];
  total_count: number;
  total_pages: number;
  page: number;
}
