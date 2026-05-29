# Corpus Log

Append-only. One entry per session event.
Format: `## [YYYY-MM-DD] type | description`

---

## [2026-05-28] init | Corpus created from wiki/ + docs/ migration

- Summary: Consolidated two separate wiki directories (`wiki/` and `docs/wiki/`) into a single `corpus/` with LLM-wiki pattern. Dropped stale Rust-era content (docs/wiki/ referenced Axum, sqlx, diesel — removed in Wave 5). Updated all pages for current Node.js + SQLite stack.
- Pages created: overview, business-rules, stack, carpathian-clear, listing, asset, user, product-ideas, gdpr-kits, social-media-templates, niche-packs, index, log, SCHEMA
- Pages dropped: all docs/wiki/architecture/ (Rust-era: why-axum, sqlx-over-diesel, four-layer-architecture, auth-jwt-argon2, cors-policy, testing-strategy, database-schema, infrastructure-wiring, openapi-documentation); all docs/wiki/features/ (Rust-era feature specs); docs/requirements-summary.md and docs/design-brief.md (physical-goods OLX-clone era)

## [2026-05-28] backfill | Todo directory created with feature backlog

- Summary: Created `corpus/todo/` with 15 feature files covering every add/update/remove needed based on codebase audit and market research
- Files created: fix-frontend-upload-flow, remove-physical-goods-remnants, categories-update, payment-processing, gdpr-cookie-consent, invoice-generator, cui-lookup, download-all-assets, search-improvements, seller-profile, listing-renewal-and-expiry-ui, email-notifications, password-reset-ui, static-pages, listing-preview-before-publish
- Index updated with todo section

## [2026-05-28] ingest | Romanian digital marketplace market research

- Summary: Web research on Romanian digital product market, e-Factura standard, Joomla community, AI art demand, GDPR enforcement, social media landscape, and niche cultural products
- Pages created: product-ideas, gdpr-kits, social-media-templates, niche-packs
- Pages updated: overview (market position added), stack (SQLite migration reflected)

## [2026-05-29] implement | All 15 backlog todos shipped via parallel swarm

- Summary: Executed the orchestration plan in `corpus/orchestration/` — a 5-wave Sonnet subagent swarm, one git worktree/branch per todo, merged to `main`. Backend builds + 55 tests pass; all 19 migrations apply on a fresh DB; frontend builds; locale JSON valid. The only manual orchestrator work was deduping anticipated `merge=union` artifacts in `common.json` and a `copy-assets` build fix after the locations data file was deleted.
- Features delivered (waves): digital-pivot-cleanup (W0); search, notifications, cui-lookup, password-reset (W1); download-all, seller-profile, renewal-ui, gdpr (W2); static-pages, listing-preview, upload-fix (W3); invoicing then payment-processing (W4, sequential).
- Pages created: features/digital-pivot-cleanup, features/digital-asset-commerce, features/invoicing, features/search, features/notifications, features/accounts-and-profiles, features/listing-lifecycle, features/legal-and-compliance
- Pages updated: index (Todo backlog → Features + deferred follow-ups), entities/listing + entities/asset + entities/user (backlinks + stale-claim corrections), market/gdpr-kits (relink), SCHEMA (features/ layout, 12-category list)
- Todo files removed: all 15 (backlog now empty); deferred follow-ups recorded in index and the feature pages' Open questions
