---
title: Event-Template Bundles
slug: bundles
category: product
tags: [bundles, packs, events, invitatii, orders, downloads]
sources: 0
updated: 2026-05-29
---

# Event-Template Bundles

A **bundle** is a special listing that groups several existing listings (children) and is sold at a
bundle price. Buying the bundle grants download access to every child listing's assets. The motivating
use case is event packs that pair with the new `invitatii` category — e.g. a **"Pachet Nuntă"** =
invitație + meniu + place cards + plan de masă + mulțumesc.

## Model: bundle = listing + join table

Chosen over a standalone bundle entity so the feature reuses all existing listing / order / download
machinery instead of duplicating it.

- Migration `20260621030000_bundles.sql`: adds `is_bundle INTEGER NOT NULL DEFAULT 0` to `listings`,
  and creates `bundle_items` (bundle_listing_id, child_listing_id, position; PK on the pair; FKs
  ON DELETE CASCADE). Kysely: `is_bundle` on `ListingsTable`, new `BundleItemsTable`.
- `repositories/bundles.repo.ts`: `setBundleItems` (replace children), `getBundleChildren` (as listing
  cards), `hasBundlePurchaseForChild` (JOIN `bundle_items` → `orders` WHERE status='paid').

## Download access (the key wiring)

The download-access check in `modules/assets.ts` was extended (via a `canDownloadListing()` helper) to
grant access when, **in order**: the listing is free → the user owns it → the user has a direct paid
order → the user purchased a **bundle** that contains this listing as a child. Additive — direct
purchases behave exactly as before. See [[digital-asset-commerce]] for the order/download base.

## Endpoints

- `POST /listings/:id/bundle-items` — auth + **owner only**; sets the child listing ids for a bundle
  the caller owns (validates children exist) and marks the listing `is_bundle=1`.
- `GET /listings/:id/bundle-items` — public; returns the child listing cards.
- `ListingDetailResponse` gained `is_bundle: boolean`. Children are fetched via the dedicated endpoint.

## Frontend

- Feature module `frontend/src/app/modules/bundles/` (types, service, hooks, `BundleContents`).
- On the listing detail page, when `isBundle` is true, a `<BundleContents>` section lists the child
  items as cards. i18n `bundles.*` in ro/en.

## Bundle-builder UI (added 2026-05-29)

Children are no longer API-only. `bundles/components/BundleManagerSection.tsx` renders on the listing
**edit page** (`EditListingPage`): the owner toggles "this listing is a bundle", picks child listings
from their own active listings (reuses `useMyListings({active:true})`, excludes the current listing),
and saves via a new `useSetBundleItems` mutation hook wrapping the existing `setBundleItems` service. A
**price-comparison helper** sums the selected children's prices ("Preț individual total") against the
bundle's own price and shows the discount % (warns if the bundle price ≥ the sum). i18n `bundles.edit.*`.

> Integrated manually onto `main` rather than merged: the rebuild branch had forked from a stale base
> and would have reverted the `city`/`is_negotiable` removal. Only the genuinely-new files were taken.

## Open questions / limits

- **No server-side discount enforcement** — bundle price is just the listing's own `price_ron`; the
  discount helper is UI guidance only. No create-listing wizard step (the edit-page surface was the
  must-have; a wizard step was skipped to avoid destabilising the 6-step happy path).
- No guard against circular/nested bundles (a bundle listed as a child of another bundle); not expected
  in practice but unvalidated.

## See also

- [[digital-asset-commerce]] — orders + download gate the access check extends
- [[listing]] — gains `is_bundle`; bundle is a listing variant
- [[product-ideas]] — event packs as a revenue idea; pairs with the `invitatii` category
