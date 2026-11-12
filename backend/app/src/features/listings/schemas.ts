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
