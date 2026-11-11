# comercial-website corpus — index

Start here. Triage on the summary lines; open at most 2–3 pages.

- [CLAUDE.md](CLAUDE.md) — the rules and conventions for this corpus
- [routing.md](routing.md) — intent/knowledge routing for work-intake
- [log.md](log.md) — chronological record of meaningful changes

## Wiki

- [accounts-and-profiles](wiki/accounts-and-profiles.md) — Seller profiles and the upload flow (2026-05-29), and sign-in since 2026-11-03 — owner only (create-owner), no sign-up or email reset, Sign in with Ward linked by subject.
- [asset](wiki/asset.md) — The Asset entity: a downloadable file on a listing, its columns, file-format and license rules, and how a download is gated.
- [bundles](wiki/bundles.md) — Event-template bundles: a listing that sells several child listings at one price, and how buying it grants their downloads.
- [business-rules](wiki/business-rules.md) — The enforced marketplace rules (listing rate limit, expiry, the publish requirement, pricing, the platform fee) and where each is checked.
- [carpathian-clear](wiki/carpathian-clear.md) — The Carpathian Clear design system: colour roles, type, radii and where the tokens live.
- [decisions](wiki/decisions.md) — Locked calls future briefs must not relitigate — the project is a deployed demo with fake payments (Stripe removed, no live ANAF), only the owner signs in (own login plus Ward, linked by Ward subject), a fake payout ledger at 2.5%, the /piataro address, sample listings that never expire, the house style and its checks (vendored, width 120).
- [digital-asset-commerce](wiki/digital-asset-commerce.md) — How buyers get files: free downloads, orders gating paid ones through the simulated fake payment (Stripe removed 2026-11-03), and download-all.
- [digital-pivot-cleanup](wiki/digital-pivot-cleanup.md) — The pivot from the OLX-era physical-goods clone to digital files only: what was removed, and the category overhaul.
- [expiry-reminders](wiki/expiry-reminders.md) — Expiry-reminder emails three days before and on the day a listing expires, with the opt-out and no duplicates.
- [gdpr-kits](wiki/gdpr-kits.md) — Market research: Romanian GDPR document kits, the documents the law requires, competitors' prices and the gap for sector packs.
- [glossary](wiki/glossary.md) — The project's vocabulary — PiațăRo vs my-olx, listing, asset, order, sample listing, platform fee, payout — one definition each with the words it displaces.
- [invoicing](wiki/invoicing.md) — The offline invoice generator (PDF and UBL 2.1 e-Factura XML, issuer profiles) and the ANAF CUI lookup; never checked against live ANAF, which the owner dropped on 2026-11-03.
- [legal-and-compliance](wiki/legal-and-compliance.md) — The static legal and info pages, and the GDPR cookie-consent banner.
- [listing-lifecycle](wiki/listing-lifecycle.md) — The listing preview before publishing, and expiry and renewal in the dashboard.
- [listing](wiki/listing.md) — The Listing entity, the marketplace's unit for sale: columns, status lifecycle, pricing, expiry and the publish rule (at least one asset).
- [niche-packs-audio-3d](wiki/niche-packs-audio-3d.md) — Market research: Romanian royalty-free music and 3D models of Romanian architecture as digital products (supply, demand, pricing, opportunity).
- [niche-packs](wiki/niche-packs.md) — Market research: Romanian embroidery patterns and folklore colouring pages as digital products (evidence, pricing, opportunity), and the summary table for all four niches.
- [notifications](wiki/notifications.md) — Transactional email on a new message and on a sale, and the opt-out.
- [open-questions](wiki/open-questions.md) — Nothing is open. The real-launch questions the demo decision parked were dropped by the owner on 2026-11-04.
- [overview](wiki/overview.md) — What PiațăRo (code name my-olx) is, a Romanian digital-files marketplace, and where it stands: a deployed demo with fake payments, decided 2026-11-03.
- [product-ideas](wiki/product-ideas.md) — A brainstorm of product categories and platform features for a Romania-focused digital marketplace.
- [reviews-ratings](wiki/reviews-ratings.md) — Verified-purchase reviews: a 1-5 star rating plus text, one per buyer per listing, and the average on the listing page.
- [search](wiki/search.md) — Listing search on SQLite FTS5 with diacritics folding ("sablon" matches "șablon").
- [social-media-templates](wiki/social-media-templates.md) — Market research: social-media template packs for Romanian SMBs (platform reach, the price gap between packs and agencies, what to sell).
- [stack](wiki/stack.md) — The tech stack: the Fastify, Kysely and SQLite backend workspace, the React and Vite frontend, auth and storage, and how they fit.
- [status](wiki/status.md) — Dated snapshot (2026-11-11) — PiațăRo as a deployed demo; briefs 01-11 are done (one line each), briefs 10 and 11 wait for a deploy, and the owner's steps.
- [user](wiki/user.md) — The User entity: one account type that both buys and sells, its columns, auth fields, seller profile and email opt-outs.

## Work

- Brief states live one-per-line in [wiki/status.md](wiki/status.md);
  specs in [briefs/](briefs/), captures in [todos/](todos/).
