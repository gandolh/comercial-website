---
title: Creator payout flow (money-out to sellers)
slug: creator-payouts
category: product
tags: [payouts, payments, sellers, stripe-connect, ledger]
type: add
priority: high
status: pending
updated: 2026-05-29
---

# Creator payout flow (money-out to sellers)

Payment **in** exists (orders + Stripe/fake PSP gating paid downloads — see [[digital-asset-commerce]]),
but there is **no money-out**: the platform never pays sellers their earnings. `orders` records the
gross only; no platform fee, balance, or payout is modeled.

## Why this is needed

Without payouts there is no real two-sided commerce — sellers can be charged buyers' money but cannot
receive it. This blocks the marketplace from operating beyond free/test listings.

## Open design questions (resolve before building)

- **Mechanism:** Stripe Connect (Express/Standard accounts + transfers) vs. manual/off-platform payouts
  with a ledger? Connect is the standard answer but adds onboarding/KYC surface.
- **Platform fee:** what cut does my-olx take per sale? (Currently "no platform fee defined yet" in
  [[business-rules]].) Needs a decision; it determines the payout amount.
- **Ledger:** a `seller_balances` / `payouts` model tracking earned vs. paid-out, tied to `orders`.
- **Romanian tax/invoicing implications** for payouts to PFA/SRL sellers (ties into [[invoicing]]).

## Acceptance criteria (high level — refine after design)

- A seller can see their **available balance** (sum of paid orders minus fees minus prior payouts).
- A payout can be initiated (manual trigger or scheduled) and the ledger updated atomically.
- Platform fee is applied and recorded per order.
- Tests cover balance computation and payout idempotency.

## See also

- [[digital-asset-commerce]] — the payment-in side; `orders` records gross only
- [[business-rules]] — platform fee is undefined (blocker for the fee cut)
- [[overview]] — creator payout flow listed as an open question
