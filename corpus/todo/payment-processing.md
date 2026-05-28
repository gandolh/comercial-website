---
title: Payment Processing
slug: payment-processing
type: add
priority: high
status: pending
area: backend, frontend
updated: 2026-05-28
---

# Payment Processing

## What

Integrate a payment provider so buyers can purchase paid listings. Currently all downloads are free regardless of `price_ron`.

## Options

**Romanian PSPs (recommended for RON, local compliance):**
- **Netopia Payments (mobilPay)** — largest Romanian PSP; supports RON, cards, online banking; good API docs; used by most Romanian e-commerce
- **TWISPAY** — Romanian fintech, EU-licensed, cards + Apple/Google Pay; REST API
- **euPlatesc** — older Romanian PSP; widely used locally

**International:**
- **Stripe** — best DX, great docs; supports RON natively; handles EU SCA; but foreign entity may complicate Romanian fiscal compliance

## Key decisions needed

- Which PSP?
- Is the platform a marketplace (split payments to sellers) or a storefront (platform collects, pays out manually)?
- Payout model: instant, weekly batch, manual withdrawal?
- Do free listings (price_ron = null) skip payment entirely?

## Backend changes

- New `orders` table: `id, buyer_id, listing_id, amount_ron, status (pending|paid|refunded), payment_ref, created_at`
- New `POST /listings/:id/buy` — creates order, initiates payment flow, returns payment URL or client secret
- Payment webhook handler (provider-specific) — updates order status, grants download access
- `GET /listings/:id/download` — gate behind paid order check (if listing has price > 0)
- Seller payout tracking (future)

## Frontend changes

- "Cumpără" (Buy) button on ListingDetailPage replacing direct download for paid listings
- Order confirmation page
- Purchase history in Dashboard
- Download button only shown after purchase

## Acceptance criteria

- [ ] Free listings (price_ron = null or 0) downloadable without payment
- [ ] Paid listings require completed order before download
- [ ] Payment flow works end-to-end with at least one PSP in test mode
- [ ] Order status persisted and queryable
- [ ] Webhook handling is idempotent

## See also

- [[listing]] — price_ron field
- [[asset]] — download flow
- [[invoice-generator]] — e-Factura generation on purchase
