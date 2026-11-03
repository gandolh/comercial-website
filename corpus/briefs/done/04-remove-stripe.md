# Task 04 — Remove the Stripe payment path

## Context
Payments are fake in the demo (decisions.md → *Stripe removed*). The Stripe provider in
`backend/app/src/modules/orders.ts` and its webhook (`POST /orders/webhook`) marked orders paid without
checking `Stripe-Signature`. Replaces the former todo `stripe-webhook-signature`.

## Files you OWN
`backend/app/src/modules/orders.ts`, `orders.test.ts`, the backend config for `STRIPE_*`, any frontend
code that branches on Stripe, `corpus/wiki/digital-asset-commerce.md`.

## What to do
1. Delete the Stripe provider, its config guard, `STRIPE_*` settings and the webhook route; the fake
   provider is the only one. Keep the provider seam only if it costs nothing (one implementation is fine).
2. The checkout UI says plainly that payment is simulated (Romanian copy).
3. Update the tests and [digital-asset-commerce](../../wiki/digital-asset-commerce.md) (remove the ⚠️ webhook note).

## Acceptance
- `grep -rni stripe backend/app/src frontend/src` finds nothing.
- A paid listing can be bought with the fake provider and then downloaded; tests pass.

---

**Outcome (2026-11-03).** Done (`2b40a95`).
- **Removed:** the Stripe provider, `resolveStripeConfig`, `selectProvider` and `POST /orders/webhook`.
  The webhook was also open with the fake provider: anyone could mark any order paid.
- **The fake flow:** `FakePaymentProvider` is the only provider, and the buyer's `mark-paid` is always on.
  The provider seam stays (one interface, one class), at no cost. The Buy button carries a "Plată simulată"
  line in Romanian and English.
- **Tests:** they run through the real app: the fake checkout URL, mark-paid by the buyer only and
  idempotent, and the webhook 404. The 24 Stripe tests went, so the backend is 147 tests.
- **Checked on the dev API:** sign in, order a paid listing, mark it paid; the webhook answers 404.
- **Docs:** `grep -i stripe` finds only the notes saying it was removed.
