---
title: Digital-Asset Commerce (Purchase & Download)
slug: digital-asset-commerce
category: product
tags: [payments, orders, downloads, assets, stripe, paywall]
sources: 0
updated: 2026-05-29
---

# Digital-Asset Commerce (Purchase & Download)

How buyers obtain a listing's files: free listings download directly; paid listings require a
completed order before any file can be downloaded. Originated from todos
`download-all-assets`, `payment-processing`.

## Per-asset downloads

A listing can carry multiple downloadable files. Each is individually retrievable.

- `GET /listings/:id/assets` — list a listing's assets (name, format, size).
- `GET /listings/:id/assets/:asset_id/download` — authenticated, streams that specific file with
  `Content-Disposition: attachment`, increments `download_count`, fires the first-download email hook.
- `GET /listings/:id/download` — legacy endpoint, still works; downloads the primary asset (position 0).
- Frontend: `ListingDetailPage` renders an `AssetFileList` (name + size + per-file download button);
  i18n under the `listing_files.*` namespace.

## Payments & download gate

Storefront model — the platform collects payment. PSP is abstracted behind a `PaymentProvider`
interface so a real processor drops in later.

- **Default provider:** `FakePaymentProvider`, active whenever `STRIPE_SECRET_KEY` is unset (the
  current state). It makes the full buy → pay → download flow end-to-end testable with no real PSP.
- **Stripe:** `StripePaymentProvider` is a thin stub against Stripe's REST API via `fetch` (no `stripe`
  npm package). Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` and `selectProvider()` switches at startup.
- **`orders` table:** id, buyer_user_id, listing_id, seller_user_id, amount_ron, currency, status
  (`pending|paid|failed|cancelled`), provider, provider_ref, created_at, paid_at. Migration
  `20260620020000_orders.sql`.

Endpoints (in `modules/orders.ts`):
- `POST /orders` — create order / get checkout URL. Idempotent: returns an existing `paid` order instead of re-charging.
- `GET /orders`, `GET /orders/:id` — buyer's order history / status.
- `POST /orders/webhook` — PSP callback, marks order paid. Idempotent (`WHERE status != 'paid'`).
- `POST /orders/:id/mark-paid` — **test-only**, registered only when the fake provider is active.

**Download-gate rule** (`modules/assets.ts`, both download endpoints): if the listing is *not* free
(`price_ron` is a positive number) *and* the requester is not the listing owner, a `paid` order for
that listing is required, else `403`. Free listings (`price_ron` null or ≤ 0) and the owner always pass.

Frontend: a `Buy`/`Cumpără` button on `ListingDetailPage` for paid listings, plus an orders module
(`/comenzi`-style history + confirmation page). i18n under `orders.*`.

## Open questions

- Real Stripe wiring is unverified (no keys in this environment); the fake provider is the only tested path.
- No refund / chargeback flow.
- Platform fee / payout split to sellers is not modeled — `orders` records the gross only.

## See also

- [[asset]] — the downloadable-file entity
- [[listing]] — pricing (`price_ron`) drives the free-vs-paid gate
- [[invoicing]] — `invoices.order_id` is reserved (nullable, no FK) to link a paid order to its invoice
