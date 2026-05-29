/**
 * Tests for selectProvider(), resolveStripeConfig(), StripePaymentProvider,
 * and FakePaymentProvider (Stripe hardening — config-guard + offline tests).
 *
 * UNVERIFIED (no live Stripe credentials in this environment):
 *   - Real HTTPS call to https://api.stripe.com/v1/checkout/sessions
 *   - Stripe Checkout session creation round-trip
 *   - HMAC-SHA256 webhook signature verification (StripePaymentProvider.verifyWebhook
 *     currently parses the raw JSON without verifying the Stripe-Signature HMAC).
 *     Do NOT deploy to production without implementing proper signature verification
 *     using HMAC-SHA256 over rawBody with the webhook signing secret.
 * To verify:
 *   1. Set STRIPE_SECRET_KEY=sk_test_... and STRIPE_WEBHOOK_SECRET=whsec_...
 *   2. Use `stripe listen --forward-to localhost:8080/orders/webhook` (Stripe CLI).
 *   3. Trigger a checkout via POST /orders on a paid listing.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  selectProvider,
  resolveStripeConfig,
  FakePaymentProvider,
  StripePaymentProvider,
} from "./orders.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearStripeEnv() {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
}

function setStripeEnv(key: string, webhook: string) {
  process.env.STRIPE_SECRET_KEY = key;
  process.env.STRIPE_WEBHOOK_SECRET = webhook;
}

// ─── resolveStripeConfig ───────────────────────────────────────────────────────

describe("resolveStripeConfig", () => {
  beforeEach(clearStripeEnv);
  afterEach(clearStripeEnv);

  it("returns null when neither key is set", () => {
    expect(resolveStripeConfig()).toBeNull();
  });

  it("returns config when both keys are valid", () => {
    setStripeEnv("sk_test_abc123", "whsec_def456");
    const cfg = resolveStripeConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.secretKey).toBe("sk_test_abc123");
    expect(cfg!.webhookSecret).toBe("whsec_def456");
  });

  it("throws when STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_onlykey";
    expect(() => resolveStripeConfig()).toThrow(/STRIPE_WEBHOOK_SECRET is missing/);
  });

  it("throws when STRIPE_WEBHOOK_SECRET is set but STRIPE_SECRET_KEY is missing", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_onlywebhook";
    expect(() => resolveStripeConfig()).toThrow(/STRIPE_SECRET_KEY is missing/);
  });

  it("throws when STRIPE_SECRET_KEY does not start with sk_", () => {
    setStripeEnv("pk_test_wrong", "whsec_valid");
    expect(() => resolveStripeConfig()).toThrow(/unexpected format/);
    expect(() => resolveStripeConfig()).toThrow(/sk_/);
  });

  it("throws when STRIPE_WEBHOOK_SECRET does not start with whsec_", () => {
    setStripeEnv("sk_test_valid", "not_a_webhook_secret");
    expect(() => resolveStripeConfig()).toThrow(/unexpected format/);
    expect(() => resolveStripeConfig()).toThrow(/whsec_/);
  });
});

// ─── selectProvider ────────────────────────────────────────────────────────────

describe("selectProvider", () => {
  beforeEach(clearStripeEnv);
  afterEach(clearStripeEnv);

  it("returns FakePaymentProvider when no env vars are set", () => {
    const provider = selectProvider();
    expect(provider).toBeInstanceOf(FakePaymentProvider);
    expect(provider.name).toBe("fake");
  });

  it("returns StripePaymentProvider when both valid env vars are set", () => {
    setStripeEnv("sk_test_abc123", "whsec_def456");
    const provider = selectProvider();
    expect(provider).toBeInstanceOf(StripePaymentProvider);
    expect(provider.name).toBe("stripe");
  });

  it("throws when only STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    expect(() => selectProvider()).toThrow(/STRIPE_WEBHOOK_SECRET is missing/);
  });

  it("throws when only STRIPE_WEBHOOK_SECRET is set", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc123";
    expect(() => selectProvider()).toThrow(/STRIPE_SECRET_KEY is missing/);
  });

  it("throws when STRIPE_SECRET_KEY has wrong prefix", () => {
    setStripeEnv("live_wrong_format", "whsec_valid");
    expect(() => selectProvider()).toThrow(/unexpected format/);
  });
});

// ─── FakePaymentProvider ───────────────────────────────────────────────────────

describe("FakePaymentProvider", () => {
  const fake = new FakePaymentProvider();

  describe("createCheckout", () => {
    it("returns a local checkout URL containing the orderId", async () => {
      const result = await fake.createCheckout({
        orderId: "test-order-1",
        amountRon: 99.99,
        listingTitle: "Asset digital",
        returnUrl: "http://localhost:5173/comenzi/confirmare",
        cancelUrl: "http://localhost:5173/anunturi/abc",
      });
      expect(result.checkoutUrl).toContain("order_id=test-order-1");
      expect(result.checkoutUrl).toContain("status=paid");
      expect(result.providerRef).toContain("test-order-1");
    });

    it("always includes provider=fake in the URL", async () => {
      const result = await fake.createCheckout({
        orderId: "ord-x",
        amountRon: 10,
        listingTitle: "Test",
        returnUrl: "http://localhost/return",
        cancelUrl: "http://localhost/cancel",
      });
      expect(result.checkoutUrl).toContain("provider=fake");
    });
  });

  describe("verifyWebhook", () => {
    it("parses a valid fake webhook payload", () => {
      const body = JSON.stringify({ order_id: "ord-1", paid: true });
      const event = fake.verifyWebhook(body, "");
      expect(event.orderId).toBe("ord-1");
      expect(event.paid).toBe(true);
    });

    it("marks paid=true when paid field is absent (default)", () => {
      const body = JSON.stringify({ order_id: "ord-2" });
      const event = fake.verifyWebhook(body, "");
      expect(event.paid).toBe(true);
    });

    it("marks paid=false when paid is explicitly false", () => {
      const body = JSON.stringify({ order_id: "ord-3", paid: false });
      const event = fake.verifyWebhook(body, "");
      expect(event.paid).toBe(false);
    });

    it("throws on empty body", () => {
      expect(() => fake.verifyWebhook("", "")).toThrow();
    });

    it("throws on malformed JSON", () => {
      expect(() => fake.verifyWebhook("{not json}", "")).toThrow();
    });

    it("throws when order_id is missing", () => {
      const body = JSON.stringify({ paid: true });
      expect(() => fake.verifyWebhook(body, "")).toThrow();
    });
  });
});

// ─── StripePaymentProvider ────────────────────────────────────────────────────
// NOTE: createCheckout is NOT exercised here — it would make a real HTTPS call
// to the Stripe API. Only input-validation and verifyWebhook parsing are tested.

describe("StripePaymentProvider", () => {
  // Construct directly with test keys (never connects to real Stripe in these tests)
  const stripe = new StripePaymentProvider("sk_test_fake", "whsec_fake");

  describe("verifyWebhook", () => {
    it("throws when signature header is absent/empty", () => {
      const body = JSON.stringify({
        type: "checkout.session.completed",
        data: { object: { payment_status: "paid", metadata: { order_id: "ord-1" } } },
      });
      expect(() => stripe.verifyWebhook(body, "")).toThrow(/missing Stripe-Signature/);
    });

    it("parses a checkout.session.completed event with paid status", () => {
      // NOTE: this does NOT verify the HMAC signature — that requires the stripe package.
      // The test exercises the JSON parsing path only.
      const body = JSON.stringify({
        type: "checkout.session.completed",
        data: {
          object: {
            payment_status: "paid",
            metadata: { order_id: "ord-99" },
          },
        },
      });
      const event = stripe.verifyWebhook(body, "whsec_any_non_empty");
      expect(event.orderId).toBe("ord-99");
      expect(event.paid).toBe(true);
    });

    it("returns paid=false for non-completed event type", () => {
      const body = JSON.stringify({
        type: "payment_intent.created",
        data: {
          object: {
            payment_status: "unpaid",
            metadata: { order_id: "ord-100" },
          },
        },
      });
      const event = stripe.verifyWebhook(body, "whsec_any");
      expect(event.paid).toBe(false);
    });

    it("throws on malformed JSON payload", () => {
      expect(() => stripe.verifyWebhook("{bad json}", "whsec_any")).toThrow();
    });

    it("throws when order_id is missing from metadata", () => {
      const body = JSON.stringify({
        type: "checkout.session.completed",
        data: { object: { payment_status: "paid", metadata: {} } },
      });
      expect(() => stripe.verifyWebhook(body, "whsec_any")).toThrow();
    });
  });
});
