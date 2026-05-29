---
title: Reviews & Ratings
slug: reviews-ratings
category: product
tags: [reviews, ratings, trust, verified-purchase, orders]
sources: 0
updated: 2026-05-29
---

# Reviews & Ratings

Buyers who have **purchased** a listing can leave a 1–5 star rating plus an optional text review. The
listing detail page shows the average rating, the review count, and the list of reviews. One review per
buyer per listing (re-submitting updates the existing one). This addresses the buyer review/rating
system that [[overview]] listed as an open question.

## Verified-purchase gate

A buyer may only review a listing they actually bought. The gate reuses the existing
`hasPaidOrder(...)` check from the orders module (see [[digital-asset-commerce]]) — submitting a review
without a paid order returns a 403-style `AppError`. This is the key trust property: ratings come only
from real customers.

## Backend

- Migration `20260621020000_reviews.sql`: `reviews` table (id, listing_id, buyer_user_id, rating 1–5,
  body, created_at, updated_at) with a **UNIQUE index on (listing_id, buyer_user_id)** enforcing
  one-per-buyer, plus an index for listing-scoped fetches. Kysely `ReviewsTable` added to the schema.
- `repositories/reviews.repo.ts`: upsert, list-for-listing (joins buyer `display_name`, newest first),
  aggregate (avg + count), get-mine, delete-mine.
- `modules/reviews.ts` (`registerReviewsRoutes`):
  - `POST /listings/:id/reviews` — auth + paid-order gate; upserts the caller's review.
  - `GET /listings/:id/reviews` — public; returns `{ reviews, rating_avg, rating_count }`.
  - `DELETE /listings/:id/reviews/mine` — auth; removes the caller's review.
- `ListingDetailResponse` gained `rating_avg: number | null` and `rating_count: number`, populated in
  `toListingDetailResponse(...)` (two new optional params). `GET /listings/:id` fetches the aggregate
  and passes it through.

## Frontend

- Feature module `frontend/src/app/modules/reviews/` (types, service, hooks, `ReviewsSection`).
- `ReviewsSection` renders on the listing detail page after the seller card: average stars + count, the
  review list, and — when the viewer is authed, has purchased, and is not the seller — a submit/edit
  form. i18n `reviews.*` in ro/en.

## See also

- [[digital-asset-commerce]] — orders + `hasPaidOrder` that the purchase gate reuses
- [[listing]] — detail response gains `rating_avg` / `rating_count`
- [[user]] — reviewer identity (display_name shown on reviews)
