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

## [2026-10-16] docs | README and docs/ to the readme-docs standard

- Summary: Replaced the missing root README with a landing page (title PiațăRo, the name the UI shows; `my-olx` stays the code name) and added `docs/`: `README.md` (index), `getting-started.md`, `architecture.md`, and `images/` with four screenshots, `shots.md`, `demo-previews.html` (generated preview pictures) and `demo-seed.mjs` (fixes the seeded listings' missing images, adds four listings and two reviews through the API).
- Found while running it, not fixed: `/adauga-anunt` never loads for a new listing (`useDraft` disabled query stays pending in React Query v5); "Anunțurile mele" calls `GET /me/listings`, which the API lacks; `npm run dev` needs `npm run build` first on a fresh clone; nothing reads `backend/.env`; `backend/app/data/` is not gitignored; the migrations insert demo accounts with a known password into every database; no SMTP is wired, so emails only reach the log; paid files sit inside the folder served at `/uploads/`; the safety tip on listing pages is physical-goods copy; CLAUDE.md names React Router and `backend/data`, and `backend/app/CONTRACT.md` is the pre-pivot API.
