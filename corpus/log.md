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

## [2026-10-31] maintenance | README checked; routing.md added; the corpus-flow layout filed as a todo

- Summary: A README refresh pass with the readme-docs standard. The README and its four images still match the code: the only commits since 2026-10-16 are security updates. Added `corpus/routing.md`, the file the orchestrate skill reads. Moving the whole corpus to corpus-flow's layout would move every page and its links, so it is [a todo](briefs/done/01-corpus-flow-layout.md) for the owner instead.
- Found while running it: `npm run build` in `backend/` failed since the 2026-10-23 security updates, on `core/src/email/email.test.ts` line 118. The newer nodemailer types pick `sendMail`'s callback overload, whose return is `void`, so the mock's `{ messageId }` no longer typechecks. The mock now casts its value; the email tests pass (9 of 9).
- Checked: `npm install` and `npm run build` in `backend/`, the API on port 8080, and `npm install` and `npm run dev` in `frontend/` on port 5173.


## [2026-11-03] grill | PiațăRo becomes a deployed demo

- Summary: the owner settled what this project is for now, before any brief is written.
  - **Goal:** a working demo, deployed, with fake payments. The live ANAF verification is dropped (the
    offline e-Factura generator stays as shipped).
  - **Access:** only the owner signs in, and the public browses listings read-only. Sign-up is closed.
    The owner signs in either with the app's own login (the account is created by a command at deploy,
    password from vps-deploy's secrets) or through Ward (linked to that account by email).
  - **Stripe:** the provider and its webhook are removed; only the fake provider remains.
  - **Payouts:** a fake ledger with a 2.5% platform fee per sale, recorded on the order. A payout
    request settles at once, marked simulated.
  - **Address:** `<domain>/piataro`, with the API at `/piataro-api`.
  - **Demo content:** the first deploy seeds the sample listings under seller profiles that can't sign
    in, and samples never expire. The owner's own listings keep the 30-day rule.
  - **Corpus:** it moves to the corpus-flow layout first, and the work lands as numbered briefs.
- Also in scope:
  - the 2026-10-16 findings: the add-listing page, `GET /me/listings`, the seeded demo accounts, paid
    files under `/uploads/`, the 500 on a bad token, the stale CLAUDE.md and CONTRACT.md, the
    physical-goods safety tip;
  - the vps-deploy stack.
- Calls made without asking: no SMTP (email stays in the log, and only the owner signs in); Ward links by
  email.

## [2026-11-03] done | Brief 01 — the corpus is in corpus-flow's layout

[Brief 01](briefs/done/01-corpus-flow-layout.md):
- The pages are now a flat `wiki/` with `summary:` + `updated:` frontmatter and plain relative links
  (no `[[wikilinks]]`).
- The rest of the layout: `index.md` generated by the new `lint.sh`, `todos/`, `briefs/`, and
  `corpus/CLAUDE.md` in place of `SCHEMA.md`.
- New spine pages from the grill: [decisions](wiki/decisions.md), [status](wiki/status.md),
  [glossary](wiki/glossary.md), [open-questions](wiki/open-questions.md).
- `niche-packs` split in two to fit the page cap. Links in the root CLAUDE.md, README and `docs/`
  re-pointed.
- The four todos became briefs 04 and 06 or were dropped (live ANAF).

Entries above this one link to the old `pages/` and `todo/` paths and are left as written.

## [2026-11-03] todo | Briefs 02-09 filed for the demo

The demo's work as eight briefs, from the 2026-11-03 grill ([decisions](wiki/decisions.md)):
- [02](briefs/done/02-fix-the-broken-flows.md): fix the broken flows and the stale docs.
- [03](briefs/done/03-security-before-going-public.md): the seeds out of the migrations, and paid files
  off the public path.
- [04](briefs/done/04-remove-stripe.md): remove Stripe.
- [05](briefs/done/05-owner-only-sign-in-and-ward.md): owner-only sign-in, plus Ward.
- [06](briefs/done/06-fake-payout-ledger.md): the fake payout ledger at 2.5%.
- [07](briefs/done/07-sample-listings.md): sample listings that never expire.
- [08](briefs/done/08-base-path.md): the `/piataro` base path.
- [09](briefs/todo/09-deploy-stack.md): the container and the vps-deploy stack.

## [2026-11-03] done | Brief 02 — the add-listing flow works again

[Brief 02](briefs/done/02-fix-the-broken-flows.md), `6d87ef4`. Creating a listing had two faults
stacked: the wizard waited forever on a disabled query, and the API refused the empty draft the wizard
creates. Also fixed: `GET /me/listings`, 401 instead of 500 on a bad token, the digital-goods safety tip,
`.env` loading, the stale CLAUDE.md, and `CONTRACT.md` is removed. A listing was published end to end in
the browser. The frontend lint's 9 older errors are unchanged.

## [2026-11-03] done | Brief 03 — no known-password accounts, paid files private

[Brief 03](briefs/done/03-security-before-going-public.md), `05572b5`. The demo accounts and listings
are no longer migrations: `npm run seed:dev` creates them in development only, and a new database is
empty. Files for sale moved from the public uploads folder to `ASSETS_DIR`, served only through the
download routes. The server's assembly is `createServer()`, and tests start it with `test-app.ts`.

## [2026-11-03] done | Brief 04 — Stripe removed; payments are simulated

[Brief 04](briefs/done/04-remove-stripe.md), `2b40a95`. The fake provider is the only one, and the
buyer marks their own order paid. The payment webhook went with Stripe: with the fake provider it
let anyone mark any order paid. The Buy button says the payment is simulated.

## [2026-11-03] done | Brief 05 — owner-only sign-in, and Ward linked by subject

[Brief 05](briefs/done/05-owner-only-sign-in-and-ward.md), `e058ff3`. Sign-up and the email reset are
gone, and `npm run create-owner` makes the one account. Sign in with Ward uses the vendored ward-auth
client. The decision changed on the way: Ward's token has no email, so the owner links Ward from
Settings and Ward finds the user by subject ([decisions](wiki/decisions.md) → *Two ways in*). A real
Ward round trip waits for the deploy.

## [2026-11-03] done | Brief 06 — the simulated payout ledger at 2.5%

[Brief 06](briefs/done/06-fake-payout-ledger.md), `4a9a4d8`. Paid orders record a 2.5% fee and the
seller's net, older ones backfilled; payouts settle at once, simulated. The dashboard had never loaded
(it called `/me/stats`, not `/users/me/stats`); it does now, with a Câștiguri section. A sweep of the
frontend's API paths against the routes found nothing else in use.

## [2026-11-03] done | Brief 07 — sample listings that never expire

[Brief 07](briefs/done/07-sample-listings.md), `5d87199`. `npm run seed:samples` adds nine sample
listings under three sellers who cannot sign in, with previews and demo ZIPs. They never expire (a
flag and an expiry at the end of time) and get no reminders. The deploy runs it once.

## [2026-11-03] done | Brief 08 — the app at /piataro, the API at /piataro-api

[Brief 08](briefs/done/08-base-path.md), `f5f23e9`. `PIATARO_BASE` sets the Vite base, the router's
basepath and the translations' path, and one `apiUrl()` helper replaces the scattered API defaults. A
build under `/piataro/` behind a local Caddy stand-in served pages, images, sign-in and downloads.
