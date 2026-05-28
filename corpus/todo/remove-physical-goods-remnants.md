---
title: Remove Physical-Goods Remnants
slug: remove-physical-goods-remnants
type: remove
priority: high
status: pending
area: backend, frontend
updated: 2026-05-28
---

# Remove Physical-Goods Remnants

## What

The codebase has leftovers from the original OLX-clone physical goods phase. These need to be cleaned up now that the platform is digital-assets only.

## Items to remove

**Backend:**

- `city` field on listings — digital assets have no location. Column exists in DB (`city TEXT DEFAULT ''`), appears in `CreateListingRequest`, `ListingResponse`, and `ListingDetailResponse`. Remove from API responses and creation flow. Keep the DB column nullable/empty for now (migration would drop data).
- `is_negotiable` field — irrelevant for digital goods. Remove from API + frontend.
- `locations` module (`locations.ts`, `GET /locations/counties`, `GET /locations/cities`) — only existed for physical listing city picker. Remove the module and routes. (CONTRACT.md already notes "Wave 3 drops these")
- `city` filter in `ListingFilters` — remove from search query params
- `cities-by-counties.json` data file in `backend/app/src/data/` — delete

**Frontend:**

- City picker in create-listing wizard — remove step or field
- City display on `ListingCardResponse` and `ListingDetailPage` — remove
- Location-related components in `create-listing/` module
- Old category slugs (`electronice`, `auto`, `imobiliare`, etc.) — see [[categories-update]]

**Seed data:**

- `20260428010000_seed_data.sql` and `20260429010000_seed_locations.sql` — the locations seed (600KB of Romanian cities) is now dead weight. The seed listings use old physical categories. Both should be replaced or removed.

## Careful

- `city` is still in the DB schema — don't drop the column in a migration yet; just stop sending/accepting it in the API. Remove the column in a later cleanup migration.
- Keep `is_negotiable` in the DB but stop exposing it in API responses.

## Acceptance criteria

- [ ] `POST /listings` no longer accepts or requires `city`
- [ ] `ListingResponse` and `ListingDetailResponse` no longer include `city` or `is_negotiable`
- [ ] `/locations/*` routes removed
- [ ] Create-listing wizard has no city step
- [ ] `cities-by-counties.json` deleted
- [ ] Seed data updated to use digital categories

## See also

- [[categories-update]] — replace old category slugs
- [[listing]] — listing entity
