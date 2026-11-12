---
summary: How buyers get files: free downloads, orders gating paid ones through the simulated fake payment (Stripe removed 2026-11-03), and download-all.
updated: 2026-11-12
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

Payments are **simulated** (the demo decision of 2026-11-03, [decisions](decisions.md)): the platform
"collects" through `FakePaymentProvider`, the only provider. No money moves; the Buy button says so.
The Stripe provider, its config guard and the payment webhook were removed on 2026-11-03.

- **The flow:** `POST /orders` creates an order and returns the fake checkout URL, the local return page
  marked paid; the buyer's `POST /orders/:id/mark-paid` marks it paid.
- **`orders` table:** id, buyer_user_id, listing_id, seller_user_id, amount_ron, currency, status
  (`pending|paid|failed|cancelled`), provider (`fake`), provider_ref, created_at, paid_at. Migration
  `20260620020000_orders.sql`.

Endpoints (in `features/orders/routes.ts`; the provider and the paid-order check in `service.ts`):
- `POST /orders` — create order / get checkout URL. Idempotent: returns an existing `paid` order instead of re-charging.
- `GET /orders`, `GET /orders/:id` — buyer's order history / status.
- `POST /orders/:id/mark-paid` — the fake payment; only the order's buyer may call it. Idempotent.

**Download-gate rule** (`features/assets/routes.ts`, both download endpoints): if the listing is *not* free
(`price_ron` is a positive number) *and* the requester is not the listing owner, a `paid` order for
that listing is required, else `403`. Free listings (`price_ron` null or ≤ 0) and the owner always pass.

Frontend: a `Buy`/`Cumpără` button on `ListingDetailPage` for paid listings, plus an orders module
(`/comenzi`-style history + confirmation page). i18n under `orders.*`.

## Open questions

- No refund / chargeback flow.
- Platform fee and payouts: brief 06 adds a simulated ledger at 2.5%.

## See also

- [asset](asset.md) — the downloadable-file entity
- [listing](listing.md) — pricing (`price_ron`) drives the free-vs-paid gate
- [invoicing](invoicing.md) — `invoices.order_id` is reserved (nullable, no FK) to link a paid order to its invoice
