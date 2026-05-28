# Corpus Log

Append-only. One entry per session event.
Format: `## [YYYY-MM-DD] type | description`

---

## [2026-05-28] init | Corpus created from wiki/ + docs/ migration

- Summary: Consolidated two separate wiki directories (`wiki/` and `docs/wiki/`) into a single `corpus/` with LLM-wiki pattern. Dropped stale Rust-era content (docs/wiki/ referenced Axum, sqlx, diesel — removed in Wave 5). Updated all pages for current Node.js + SQLite stack.
- Pages created: overview, business-rules, stack, carpathian-clear, listing, asset, user, product-ideas, gdpr-kits, social-media-templates, niche-packs, index, log, SCHEMA
- Pages dropped: all docs/wiki/architecture/ (Rust-era: why-axum, sqlx-over-diesel, four-layer-architecture, auth-jwt-argon2, cors-policy, testing-strategy, database-schema, infrastructure-wiring, openapi-documentation); all docs/wiki/features/ (Rust-era feature specs); docs/requirements-summary.md and docs/design-brief.md (physical-goods OLX-clone era)

## [2026-05-28] ingest | Romanian digital marketplace market research

- Summary: Web research on Romanian digital product market, e-Factura standard, Joomla community, AI art demand, GDPR enforcement, social media landscape, and niche cultural products
- Pages created: product-ideas, gdpr-kits, social-media-templates, niche-packs
- Pages updated: overview (market position added), stack (SQLite migration reflected)
