# Corpus Index — my-olx

Master catalog of all pages. Read this first before answering any query.
Format: `[Title](path) — hook | category | updated`

---

## Synthesis

- [Overview](overview.md) — project summary, architecture at a glance, open questions | synthesis | 2026-05-28

---

## Product

- [Business Rules](product/business-rules.md) — rate limits, expiry, publish requirements, pricing, categories | product | 2026-05-28

---

## Market

- [Product Ideas](market/product-ideas.md) — full brainstorm: AI art, Joomla, e-books, invoice generator, compliance templates, fonts, SMB tools; prioritization matrix | market | 2026-05-28
- [GDPR Document Kits](market/gdpr-kits.md) — mandatory documents, ANSPDCP enforcement, competitor pricing, sector gaps | market | 2026-05-28
- [Social Media Templates](market/social-media-templates.md) — platform landscape, full Romanian marketing calendar, industry packs, pricing | market | 2026-05-28
- [Niche Packs](market/niche-packs.md) — embroidery DST/PES, Dacian/Brâncuși coloring pages, royalty-free music, 3D models | market | 2026-05-28

---

## Tech

- [Tech Stack](tech/stack.md) — Fastify backend, React frontend, SQLite + Kysely, disk storage, no Docker | tech | 2026-05-28
- [Carpathian Clear](tech/carpathian-clear.md) — design system tokens: colors, typography, border radius | tech | 2026-05-28

---

## Entities

- [Listing](entities/listing.md) — primary marketplace unit; SQLite schema, lifecycle, endpoints | entity | 2026-05-28
- [Asset](entities/asset.md) — downloadable file; disk storage, license types, upload flow | entity | 2026-05-28
- [User](entities/user.md) — seller/buyer account; JWT + Argon2, email/phone verification | entity | 2026-05-28

---

## Features (shipped)

All 15 backlog items were implemented (2026-05-29) via the parallel-swarm orchestration in
`corpus/orchestration/` (5 waves, one branch per todo, merged to `main`; build + 55 tests green).
The `corpus/todo/` backlog is now empty and removed — shipped work is documented in `pages/features/`.

- [Digital Pivot — Cleanup & Categories](features/digital-pivot-cleanup.md) — dropped city/is_negotiable/locations; 12 digital categories | product | 2026-05-29
- [Digital-Asset Commerce](features/digital-asset-commerce.md) — per-asset downloads + payments (Stripe/fake PSP) gating paid downloads | product | 2026-05-29
- [Invoicing & ANAF CUI Lookup](features/invoicing.md) — PDF + UBL 2.1 XML invoices; `/anaf/company/:cui` auto-fill | product | 2026-05-29
- [Search (FTS5)](features/search.md) — SQLite FTS5, diacritics-folding, BM25 ranking | tech | 2026-05-29
- [Email Notifications](features/notifications.md) — new-message + first-download emails; opt-out | product | 2026-05-29
- [Accounts & Seller Profiles](features/accounts-and-profiles.md) — password-reset UI, bio/website/social, upload fix | product | 2026-05-29
- [Listing Lifecycle UI](features/listing-lifecycle.md) — preview-before-publish, renewal & expiry UI | product | 2026-05-29
- [Legal & Compliance](features/legal-and-compliance.md) — 6 static legal pages + GDPR cookie consent | product | 2026-05-29
- [Expiry-Reminder Emails](features/expiry-reminders.md) — in-process 6h interval job; 3-day + expiry-day reminders, opt-out aware | product | 2026-05-29
- [Reviews & Ratings](features/reviews-ratings.md) — 1–5 stars, verified-purchase gated, aggregate on listing detail | product | 2026-05-29
- [Event-Template Bundles](features/bundles.md) — bundle-as-listing + bundle_items; purchase grants child downloads ("Pachet Nuntă"); bundle-builder UI on the edit page | product | 2026-05-29

> Also shipped 2026-05-29: the **`invitatii` ("Invitații Digitale")** category for Romanian event
> templates (nuntă, botez, cununie, logodnă, majorat, aniversări, sărbători). See [[digital-pivot-cleanup]] / [[business-rules]].

### Deferred follow-ups — all cleared 2026-05-29

The five carried-over follow-ups were all addressed in a second swarm (parallel Sonnet agents in
worktrees, merged to `main`; backend 156 tests green, frontend typecheck + Vite build green, fresh-DB
migration chain of 23 applies):

- ✅ **Bundle-builder UI** — owners can mark a listing as a bundle and pick children from their own
  listings on the edit page, with a price-comparison/discount helper. (Server-side discount enforcement
  intentionally not added — bundle price is the listing's own price.) See [[bundles]].
- ✅ **Unknown category slugs** now redirect to `/categorii` (`CATEGORY_LABELS` is the sole source of
  truth; valid-but-empty slugs still show the normal empty state). See [[digital-pivot-cleanup]].
- ✅ **Profile total-downloads count** — `SUM(download_count)` over a seller's active listings, shown on
  the public profile. See [[accounts-and-profiles]].
- ⚠️ **e-Factura XML / Stripe hardening** — added an offline UBL structural validator (fails loudly on
  malformed e-Factura) and a Stripe fail-fast config guard (partial config throws at boot; key-prefix
  checks). STILL UNVERIFIED against live ANAF submission and live Stripe checkout/webhook-signature (no
  credentials in this environment). See [[invoicing]], [[digital-asset-commerce]].
- ✅ **Tech debt** — removed the avatar-upload `window.fetch` monkey-patch (callers use the direct
  `uploadAvatar` POST); dropped the unused `city`/`is_negotiable` columns
  (`20260621040000_drop_city_is_negotiable.sql`) and all code references. See [[accounts-and-profiles]],
  [[digital-pivot-cleanup]].

### Remaining backlog (tracked in `corpus/todo/`)

The genuinely-not-done items are now actionable backlog files:

- [stripe-webhook-signature](../todo/stripe-webhook-signature.md) — **critical**: verify the
  `Stripe-Signature` HMAC (webhook currently trusts the body — forgeable) + test live checkout with
  Stripe test keys. See [[digital-asset-commerce]].
- [verify-efactura-live](../todo/verify-efactura-live.md) — high: validate the UBL XML against the real
  ANAF XSD/SDK and submit to the ANAF test endpoint. See [[invoicing]].
- [creator-payouts](../todo/creator-payouts.md) — high: money-out to sellers (Stripe Connect + ledger +
  platform fee) — design-first. See [[overview]].

---

## Sources ingested

- market research: Romanian digital marketplace landscape (web research, 2026-05-28)
- market research: GDPR, social media templates, niche packs deep-dive (web research, 2026-05-28)
