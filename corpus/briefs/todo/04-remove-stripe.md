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
