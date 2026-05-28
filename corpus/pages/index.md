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

## Todo (feature backlog)

Format: `[Title](../../todo/file.md) — description | type | priority`

- [Fix Frontend Upload Flow](../../todo/fix-frontend-upload-flow.md) — multipart migration; frontend still calls old presigned-URL endpoints | update | critical
- [Remove Physical-Goods Remnants](../../todo/remove-physical-goods-remnants.md) — drop city field, locations module, old categories, dead seed data | remove | high
- [Categories Update](../../todo/categories-update.md) — replace OLX-era slugs with 12 digital-native categories | update | high
- [Payment Processing](../../todo/payment-processing.md) — integrate PSP (Netopia/Stripe); gate downloads behind paid orders | add | high
- [GDPR Cookie Consent Banner](../../todo/gdpr-cookie-consent.md) — legally required; equal accept/reject buttons (Law 506/2004) | add | high
- [Invoice & e-Factura Generator](../../todo/invoice-generator.md) — PDF + UBL 2.1 XML; saved emitter profile; ANAF CUI auto-fill | add | high
- [ANAF CUI Company Lookup](../../todo/cui-lookup.md) — proxy ANAF public API; used by invoice generator | add | medium
- [Download All Assets](../../todo/download-all-assets.md) — per-asset download endpoint; multi-file listing support | update | medium
- [Search Improvements](../../todo/search-improvements.md) — SQLite FTS5 with diacritics folding; relevance ranking | update | medium
- [Seller Profile](../../todo/seller-profile.md) — bio, website URL, total downloads count | update | medium
- [Listing Renewal & Expiry UI](../../todo/listing-renewal-and-expiry-ui.md) — renew/deactivate/activate actions in dashboard; expiry warnings | update | medium
- [Email Notifications](../../todo/email-notifications.md) — new message, first download, expiry reminders | add | medium
- [Password Reset UI](../../todo/password-reset-ui.md) — verify end-to-end flow works post-MailHog removal | update | medium
- [Static Legal Pages](../../todo/static-pages.md) — Termeni, Confidențialitate, Cookies, Despre, Contact, Ajutor | add | medium
- [Listing Preview Before Publish](../../todo/listing-preview-before-publish.md) — preview step in create-listing wizard | add | low

---

## Sources ingested

- market research: Romanian digital marketplace landscape (web research, 2026-05-28)
- market research: GDPR, social media templates, niche packs deep-dive (web research, 2026-05-28)
