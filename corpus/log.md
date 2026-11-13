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
- [09](briefs/done/09-deploy-stack.md): the container and the vps-deploy stack.

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

## [2026-11-03] done | Brief 09 — the container and the deploy stack

[Brief 09](briefs/done/09-deploy-stack.md), `fdca5b4` and vps-deploy's `ba089e6`. The API runs from
`infrastructure/` on loopback 8807, with its data in `/data`. vps-deploy's `piataro` stack builds the
frontend under `/piataro/`, seeds the samples, and creates the owner's account when it is missing,
with the password over ssh stdin. Checked with a local container behind the Caddy stand-in and a dry
run of the stack. Not deployed; the owner's steps are in [status.md](wiki/status.md).

## [2026-11-04] decision | The real-launch questions are dropped

In an estate-wide grill the owner dropped the questions the demo decision had parked (a payment
processor, real payouts, a premium seller tier, a name free of "olx"). [open-questions.md](wiki/open-questions.md)
is empty and the overview no longer points at them.

## [2026-11-10] todo | Briefs 11-13 revised to the grilling's answers; redesign brief 14 added

Revised briefs 11-13 for the owner's answers and technical calls of 2026-11-10. Brief 11:
`house-style` is vendored (Q6, no change to the Dockerfile), width 120 with its measured cost
(Q8, Q51), the backend's TypeScript 5.7.3 is bumped to 6.0.3 before `erasableSyntaxOnly` (Q11),
`!` is an error in source with its 66 sites fixed in step 5 and a warning in tests (Q47),
components use named exports (Q49). Brief 12: the folder-per-wrapper layout stays (Q59), the
third-party `sonner` toasts move to Base UI `Toast` behind the same call shape, the two native
`<select>`s stay native on phones (Q16), the theme control is a `RadioGroup` (Q41, Q57),
form dialogs set `disablePointerDismissal` (Q58), and the phone menu note records Q40. Brief 13:
Q23-Q25, Q43, Q52, Q53, Q55 and Q56 are marked decided; the handler passes Fastify's own 4xx
through; validation before authorisation is accepted and its one visible change (a malformed body
with no session answers 422, not 401) is named. Added brief 14, a redesign with Hallmark on the
estate board (Q39).

## [2026-11-10] done | Brief 10 — Base UI 1.9.0

`@base-ui/react` 1.4.1 to 1.9.0, pinned exactly in `frontend/` (c4dd42c). Typecheck, lint (28, unchanged) and build pass; the renamed OTPField and `sanitizeValue` are not used. Not done: release-notes read and the browser check. Needs a deploy; run `npm install` in `frontend/` after pulling.

## [2026-11-11] done | Brief 11 — the house style and the quality harness

Adopted `house-style` 1.1.0 (vendored at the root, pins in the root `package.json`). Re-measured on the real
tree: Prettier at 120 changed 238 files (3,494 lines added, 5,012 removed); the backend's `noUnusedLocals`
24, `noImplicitOverride` 1 and parameter properties 9 matched, as did the frontend's one
`noUncheckedIndexedAccess` error. Typed lint before the fixes, frontend / backend: `no-floating-promises`
30 / 0, `no-misused-promises` 49 / 0, `await-thenable` 0 / 0, `switch-exhaustiveness-check` 0 / 0,
`no-unnecessary-type-assertion` 11 / 37 (30 in source), `no-non-null-assertion` 8 / 78 (58 in source),
`no-explicit-any` 5 / 65, `no-console` 4 / 10 (outside the CLIs), `no-default-export` 4 / 0,
`n/no-process-env` n/a / 21 in source. The three rules over 20, characterised: `no-floating-promises` is
`invalidateQueries` and event wrappers called without `void` (fixed with `void`, no bug found);
`no-misused-promises` is async handlers on `onClick`, `onSubmit` and `onRetry` (held as a warning);
`no-explicit-any` in the backend is untyped rows and bodies in the route modules, 25 of them in
`users.ts` (held as a warning). No `React.lazy` page needs a default export once the lazy line maps the name.
Lint time, `projectService`, cold: 9.7 s backend, 14.9 s frontend. After: 0 errors in both projects;
warnings: backend `no-explicit-any` 63 in source and 1 in tests, `no-non-null-assertion` 19 in tests,
`n/no-process-env` 11, `no-console` 6; frontend `no-misused-promises` 49, `exhaustive-deps` 4,
`incompatible-library` 4. knip is clean after dated exceptions for 12 unused frontend files and two
dependencies. dependency-cruiser: 0 violations. `check-base-ui` 2 errors and 1 warning, and
`check-structure` 116 errors and 5 warnings, both `--warn-only`. `check:fast` takes about 20 s for both
projects with one file changed, and `check` about a minute. Outcome note in
[brief 11](briefs/done/11-the-house-style-harness.md).

## [2026-11-12] done | Brief 12 — Base UI by the conventions, and a theme switch

Every interactive widget is on Base UI 1.9.0 behind a wrapper in `frontend/src/core/components/ui/`: `Modal` on
`Dialog` (Esc guard, focus on the first field, outside clicks off for its two form callers), `ConfirmDialog`
(one close path, held while `loading`), `Dropdown` and `Tooltip` (the caller's element through `render`),
`Switch`, `Checkbox`, `RadioGroup` (filters, star rating, theme), `Accordion`, and a `Toast` behind the old
`toast.*` call shape (`sonner` removed; the `alert()` in `PasswordSection` is a success toast). The two native
`<select>`s stay native (Q16). The 23 white and black classes, the rating yellow, the 13 `rgba(` shadows, the
raw z values and the 47 inline font families moved to role tokens and utilities; the icon-font rule stays
unlayered, with its comment. A Light / Dark / System switch sits in the footer (`data-theme` on `<html>`, a
first visit light, kept in `localStorage`). `check-base-ui` went from 2 errors and 1 warning to 0 and runs
strict. Outcome note, counts and deviations in [brief 12](briefs/done/12-base-ui-by-the-conventions.md).


## [2026-11-12] done | Brief 13 — The server in the house code structure

The backend follows the `code-structure` skill. zod 3.24.1 → 4.6.7. `app/src/config.ts` is the one reader of
the environment (`JWT_SECRET` required, in a container too); `server.ts` listens with close-with-grace,
`connectionTimeout` 10 s, `keepAliveTimeout` 125 s and no whole-request timeout (the 500 MB uploads);
`app.ts` builds. `core` is `plugins/` (errors, http, auth, each a `fastify-plugin`), `lib/` and `db/`; the app
is `features/<name>/`, with the stores several features share in `db/`. Every JSON route declares zod schemas
with a response schema through `@fastify/type-provider-zod` 1.0.3; two file streams, the invoice PDF and XML
and the two Ward redirects declare inputs only. `check-structure` went from 116 errors to 0 and runs strict.
**Before and after:** 927 replies captured through `inject()` on a seeded database, signed out and as three
users. Every success body is byte-identical, so no field was dropped (no leak found). Status changes: 77
cells 401 → 422 and 15 cells 403 → 422 on invalid input (validation before `authenticate`, decision 12), and
Fastify's own 4xx keep their status (bad JSON, an empty JSON body, 415, 413 and a JSON post to an upload route
answered 500). Error text: zod 4's wording; orders, bundles, invoices and reviews send the first issue's
message instead of zod's issue list as JSON; an unknown route answers `{ error: "not found" }`. Tests 160 → 187.
Outcome note, the access matrix and the deviations in
[brief 13](briefs/done/13-the-server-in-the-code-structure.md).

## [2026-11-13] approved | Brief 14 — the redesign direction

The owner approved the redesign direction "The filter band" for PiațăRo on the estate redesign board, with every
question on the board standing as proposed: the reopened Carpathian Clear identity, the phone bottom bar instead of
a Drawer, and the direction itself. The build follows in this brief.

## [2026-11-13] done | Brief 14 — The filter band redesign

Built the approved redesign: the new tokens and one self-hosted face, a navy shell with a phone bottom bar, the
category and search screens as a raised filter band (a `Filtre` sheet on phones that applies its picks together),
home, detail, and every undrawn screen on the same patterns. The Carpathian Clear identity, the phone navigation and
the apply-at-once filters changed ([decisions.md](wiki/decisions.md), [carpathian-clear.md](wiki/carpathian-clear.md)).
Contrast is tested over both themes and Playwright covers focus rings, reduced motion, 390 px overflow and the theme.
`Mai multe filtre` is not built until a category has a fourth facet. Outcome note, measurements and the comp
comparison in [brief 14](briefs/done/14-a-redesign-with-hallmark-on-the-estate-board.md).

## 2026-11-13: brief 15 done (replies that say less)
The conversation summary stops sending the other party's email and phone, the asset upload its storage key; the avatar URL gets /uploads/; the summary's flags are booleans. Todo replies-that-say-too-much promoted and built. Ready for deploy.

## 2026-11-13: brief 16 done (the password form, the dead files)
The change-password form is on the account settings page, with Romanian errors and a 12-character floor for the new password; the other eleven never-wired frontend files are deleted and knip's frontend ignore list is gone. Todo the-change-password-form-is-not-wired promoted and built. Ready for deploy (phase `all`).

## 2026-11-13: brief 17 done (the house-style warnings)
`no-misused-promises`, `no-explicit-any` and `no-console` are errors again and their warning blocks are gone; the hook warnings are fixed; `AppContext` carries a logger. Left: 19 non-null assertions in backend tests and knip's three dependency exceptions. Todo house-style-warnings promoted and built. Ready for deploy (phase `all`).

## 2026-11-13: brief 18 done (backend/core folded into backend/app)
`plugins/`, `lib/` and `db/` from the old core package now sit beside `features/` in `backend/app/src`; one package, one `tsc -b`, a Dockerfile without the core stage. No behaviour change, same 193 + 107 tests. Todo fold-backend-core-into-backend-app promoted and built. Ready for deploy (phase `all` with briefs 10 to 17); the docker build is the owner's step.
