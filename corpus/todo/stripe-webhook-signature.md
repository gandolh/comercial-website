---
title: Stripe webhook HMAC verification + live checkout test
slug: stripe-webhook-signature
category: product
tags: [stripe, payments, webhook, security, hmac, verification]
type: update
priority: critical
status: pending
updated: 2026-05-29
---

# Stripe webhook HMAC verification + live checkout test

The `StripePaymentProvider` now has a fail-fast config guard (partial config throws at boot; key-prefix
checks — see [[digital-asset-commerce]]), but the live payment path is untested and has a **security
gap**: the webhook handler parses the payload **without verifying the `Stripe-Signature` header**.

## Why this is critical

`POST /orders/webhook` marks an order **paid** based on the request body. Without HMAC signature
verification, a forged request could mark arbitrary orders paid (unlock paid downloads for free). This
must not ship to production as-is. It is currently a documented stub.

## Acceptance criteria

- Implement `Stripe-Signature` verification in `StripePaymentProvider.verifyWebhook()`:
  compute `HMAC-SHA256(timestamp + "." + rawBody, STRIPE_WEBHOOK_SECRET)` (Node `crypto.createHmac`, no
  new npm dep) and constant-time-compare against the `v1` value; reject on mismatch or stale timestamp.
  Requires access to the **raw** request body (Fastify content-type parser config), not the parsed JSON.
- Reject malformed / unsigned / replayed payloads with a 400; add tests for each (extend the existing
  `orders.test.ts` cases).
- Verify the **live** checkout end-to-end with Stripe **test** keys: set `STRIPE_SECRET_KEY=sk_test_…`
  + `STRIPE_WEBHOOK_SECRET=whsec_…`, run `stripe listen --forward-to localhost:8080/orders/webhook`,
  trigger `POST /orders`, complete test-card checkout, confirm the order flips to `paid` only via a
  validly-signed webhook.
- Update [[digital-asset-commerce]] — remove the ⚠️ "webhook HMAC is a stub" note once done.

## See also

- [[digital-asset-commerce]] — orders + the Stripe provider/guard this hardens
- [[overview]] — payment processing open question
