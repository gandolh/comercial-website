import { z } from "zod";

// ─── Reply schemas: output only, separate from the input ones ────────────────

/** A listing as a card: the shape toListingCardResponse builds, also answered by bundles, favorites and users. */
export const listingCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  price_ron: z.number().nullable(),
  category: z.string(),
  cover_url: z.string().nullable(),
  seller_verified: z.boolean(),
  posted_at: z.string(),
  active: z.boolean(),
  expires_at: z.string(),
});

/** The page GET /listings and GET /me/listings answer. */
export const listingsPageSchema = z.object({
  listings: z.array(listingCardSchema),
  total_count: z.number(),
  total_pages: z.number(),
  page: z.number(),
});

/** A listing as its owner edits it: the shape toListingResponse builds. */
export const listingSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string(),
  price_ron: z.number().nullable(),
  category: z.string(),
  active: z.boolean(),
  expires_at: z.string(),
  created_at: z.string(),
});

const sellerSummarySchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  phone_verified: z.boolean(),
  member_since: z.string(),
  active_listings_count: z.number(),
  total_downloads: z.number(),
});

const assetSchema = z.object({
  id: z.string(),
  original_filename: z.string(),
  file_size_bytes: z.number(),
  content_type: z.string(),
  position: z.number(),
});

/** A listing's page: the shape toListingDetailResponse builds. */
export const listingDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price_ron: z.number().nullable(),
  category: z.string(),
  category_label: z.string(),
  images: z.array(z.object({ id: z.string(), url: z.string().nullable(), position: z.number() })),
  view_count: z.number(),
  posted_at: z.string(),
  expires_at: z.string(),
  active: z.boolean(),
  seller: sellerSummarySchema,
  license_type: z.string(),
  file_format: z.string().nullable(),
  file_size_bytes: z.number().nullable(),
  download_count: z.number(),
  assets: z.array(assetSchema),
  rating_avg: z.number().nullable(),
  rating_count: z.number(),
  is_bundle: z.boolean(),
});

export const sellerPhoneSchema = z.object({ phone: z.string() });
