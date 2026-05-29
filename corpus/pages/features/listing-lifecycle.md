---
title: Listing Lifecycle UI (Create, Preview, Renew, Expiry)
slug: listing-lifecycle
category: product
tags: [listings, expiry, renewal, dashboard, create-listing, preview]
sources: 0
updated: 2026-05-29
---

# Listing Lifecycle UI (Create, Preview, Renew, Expiry)

Front-of-house lifecycle UX: a buyer-accurate preview before publishing, and expiry/renewal management
in the dashboard. Originated from todos `listing-preview-before-publish`,
`listing-renewal-and-expiry-ui`.

## Preview before publish

- The create-listing wizard's `ReviewStep` renders the collected draft (title, description, category
  label, price, license, images, asset file list) styled like the public listing — "exactly how buyers
  will see it" — before the Publish action. Reads existing wizard form state; no new data fetching.
- Back navigation to edit is preserved; the existing publish flow is unchanged. i18n under `createListing.preview.*`.

## Renewal & expiry

Listings expire 30 days after creation (see [[business-rules]]).

- Expiry status surfaces on `MyListingsPage` and `DashboardPage`: "expiră în N zile" / "expiră azi" /
  "expirat" badges, with urgency coloring (red ≤ 3 days).
- `ExpiringSection` lists soon-to-expire listings on the dashboard with a warning banner.
- `RenewButton` calls `POST /listings/:id/renew` (extends +30 days), shows loading + success, and is
  rate-limit aware: on `429` it shows a live countdown ("poți reînnoi din nou în X minute") and
  invalidates the relevant React Query caches on success.
- Activate/deactivate toggles and the expired-listings tab were pre-existing and retained. i18n under `dashboard.*`.

## Open questions

- Rate-limit retry-after field name (`retry_after_seconds`) is assumed from the backend response shape.
- Expiry *reminder emails* are a separate, deferred concern — see [[notifications]].

## See also

- [[listing]] — lifecycle, expiry, renew endpoint
- [[notifications]] — deferred expiry-reminder emails
- [[business-rules]] — 30-day expiry, 5-listings/week quota
