# Migration Plan — PiațăRo → Digital-Assets Marketplace (Node/Fastify backend)

## Goal

Transform the general-purpose Romanian classifieds marketplace ("PiațăRo") into a
**digital-assets-only marketplace** where sellers upload **downloadable files** and
buyers download them. As part of this:

1. **Rewrite the backend** from Rust/Axum to **Node + TypeScript + Fastify**, with
   **fixed npm versions** (exact pins, no `^`/`~`). Use **Kysely + raw SQL** over the
   existing PostgreSQL. **Preserve the existing REST contract** so the current frontend
   keeps working, then evolve it for digital assets.
2. **Restructure both backend and frontend** into a **core engine library** (shared,
   domain-agnostic code + UI components) and **implementation code** (digital-asset
   specifics) in separate directories.
3. **No payments** in this phase — listing/catalog/upload/download mechanics only.

## Decisions (confirmed with user)

| Topic | Decision |
|---|---|
| Backend stack | Node + TypeScript + **Fastify**, **exact-pinned** npm versions |
| API contract | **Preserve** existing endpoints/JSON shapes, then extend for digital assets |
| DB layer | **Kysely + raw SQL**; reuse existing `.sql` migrations |
| Digital asset | **Downloadable files** (seller uploads to S3, buyer downloads after) |
| Payments | **None** this phase |

---

## Target repository layout

```
my-olx/
├── backend/                       # NEW Node/Fastify backend
│   ├── core/                      # ENGINE: domain-agnostic shared code
│   │   ├── src/
│   │   │   ├── db/                # Kysely instance, migrator, raw-sql helpers
│   │   │   ├── errors/            # AppError + Fastify error mapping
│   │   │   ├── auth/             # JWT sign/verify, Argon2 hashing, auth plugin
│   │   │   ├── http/             # Fastify app factory, CORS, compression, logging
│   │   │   ├── storage/          # S3 client + presigned URL helpers
│   │   │   ├── email/            # EmailService interface + SMTP/log impls
│   │   │   ├── validation/       # zod helpers, shared schema utils
│   │   │   └── repository/       # generic repo helpers (pagination, etc.)
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── app/                       # IMPLEMENTATION: digital-asset marketplace
│   │   ├── src/
│   │   │   ├── routes/            # route registration
│   │   │   ├── handlers/          # request handlers (thin)
│   │   │   ├── services/          # business logic
│   │   │   ├── repositories/      # Kysely queries
│   │   │   ├── models/            # DB row types
│   │   │   ├── dto/               # zod request/response schemas
│   │   │   ├── config.ts
│   │   │   └── server.ts          # entrypoint
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── migrations/                # MOVED from old backend, + new digital-asset migs
│   ├── package.json               # workspace root (npm workspaces)
│   └── tsconfig.base.json
├── backend-rust-legacy/           # OLD Rust backend (moved aside, deleted at end)
├── frontend/
│   ├── src/
│   │   ├── core/                  # ENGINE: shared UI lib + primitives
│   │   │   ├── components/        # MOVED components/ui (28 components)
│   │   │   ├── layout/            # MOVED components/layout
│   │   │   └── lib/               # axios, i18n, queryClient, formatters
│   │   └── app/                   # IMPLEMENTATION: digital-asset modules
│   │       ├── modules/           # MOVED & adapted modules/*
│   │       └── routes/
└── MIGRATION_PLAN.md
```

> Note: backend uses **npm workspaces** with two packages (`core`, `app`). `app` depends
> on `core`. Frontend stays a single Vite app but with an internal `core/` vs `app/` split
> and a path alias `@core/` → `src/core`, `@app/` → `src/app`.

---

## Domain migration: general marketplace → digital assets

### Schema changes (new migrations, additive where possible)

`listings` table today (physical-goods oriented):
`id, user_id, title, description, price_ron, is_negotiable, category, city, active,
view_count, expires_at, created_at, updated_at`

**Digital-asset migration** (`20260601000000_digital_assets.sql` and friends):

| Change | Rationale |
|---|---|
| ADD `asset_type TEXT NOT NULL DEFAULT 'file'` | distinguishes asset kinds (file for now) |
| ADD `file_format TEXT` | e.g. `zip`, `pdf`, `psd`, `mp4` |
| ADD `file_size_bytes BIGINT` | shown to buyer |
| ADD `license_type TEXT NOT NULL DEFAULT 'personal'` | `personal` / `commercial` / `extended` |
| ADD `download_count BIGINT NOT NULL DEFAULT 0` | digital analog of view_count for sales |
| DROP/IGNORE `city` | location irrelevant for digital — keep column nullable for contract compat, stop requiring it |
| DROP/IGNORE `is_negotiable` | digital assets have fixed price — keep nullable, default false |
| KEEP `expires_at` | reused as optional listing-visibility expiry (still 30d default) |
| Replace `listings_city_idx` | drop city index; add `listings_license_type_idx`, `listings_asset_type_idx` |
| New table `listing_assets` | the downloadable files: `id, listing_id, s3_key, original_filename, file_size_bytes, content_type, checksum_sha256, position, created_at` |
| New table `downloads` | records a buyer's download grant: `id, listing_id, user_id, downloaded_at` (also used to gate re-download / future purchase) |
| `categories` change | replace physical slugs (electronice/auto/imobiliare/…) with digital ones: `software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse` (data migration in seed file) |
| Seed data | rewrite `20260428010000_seed_data.sql` → digital sample listings (icon packs, Notion templates, sample code, ebooks). Drop `20260429010000_seed_locations.sql` (counties/cities) — not used. |
| Phone verification | keep tables/endpoints for contract compat but de-emphasize in UI; not required to publish digital asset |

### Business-rule changes (`services/listings`)

| Rule today | Digital-asset rule |
|---|---|
| 5 listings/week limit | **keep** (`WEEKLY_POST_LIMIT = 5`) |
| Requires ≥1 **image** to publish | Requires **≥1 uploaded asset file** to publish (images now optional preview) |
| `city` required | **removed** from validation |
| `price_ron` + negotiable | `price_ron` only; `is_negotiable` removed from create/publish |
| Renew (+30d), 1/hour | **keep** |
| Seller phone for contact | replaced by: **download endpoint** grants file access |

### New endpoints (added to preserved contract)

- `POST /listings/:id/assets/upload-url` — presigned S3 PUT for an asset file (mirror of existing image upload-url)
- `POST /listings/:id/assets` — commit uploaded asset (s3_key, filename, size, content_type, checksum)
- `DELETE /listings/:id/assets/:assetId`
- `GET  /listings/:id/download` — auth required; records a `downloads` row, returns presigned GET URL for the primary asset
- Existing image endpoints **stay** (used for preview screenshots)

### Frontend domain changes

- **Categories**: replace physical category grid/labels with digital ones (i18n + `CATEGORY_LABELS`).
- **Create-listing wizard**: replace `LocationPriceStep` city picker with price-only; add **AssetUploadStep** (upload downloadable files); keep `PhotosStep` but relabel as "Preview images".
- **Listing detail**: replace `SellerCard` phone/contact + `PricingCard` "call seller" with a **Download button** (calls `/download`), show file format/size/license.
- **Remove** `CityAutocomplete` usage from filters; replace city filter with **license-type** + **format** filters.
- **i18n**: rewrite Romanian strings for digital domain (păstrăm diacritice).
- Keep favorites, messaging, dashboard, auth, settings essentially intact.

---

## Work breakdown — wave structure

Work is split into **waves**. Within a wave, todos run in **parallel worktrees** (independent
haiku agents). Waves are sequential because later waves depend on earlier ones. Each agent:
works in its own git worktree off `main`, implements its todo, and reports back. The **opus
orchestrator** (me) reviews and merges each branch into `main` between waves.

### Wave 0 — Scaffolding (must finish before anything else) — SEQUENTIAL, done by orchestrator
- **T0.1** Move old Rust backend → `backend-rust-legacy/`. Create new `backend/` npm-workspace
  skeleton: root `package.json` (workspaces: `core`, `app`), `tsconfig.base.json`,
  `core/` and `app/` package dirs with `package.json` + `tsconfig.json` (all **exact-pinned**
  deps: fastify, kysely, pg, @fastify/cors, @fastify/compress, @fastify/jwt, argon2,
  zod, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, nodemailer, pino, typescript,
  tsx, vitest, @types/node). Move `migrations/` and `data/cities-by-counties.json`.
  Add `.env.example` matching docker-compose. Wire `npm run dev` (tsx watch), `build` (tsc),
  `test` (vitest), `migrate`.

### Wave 1 — Backend core engine (parallel, depend only on Wave 0)
- **T1.1** `core/db`: Kysely instance from `DATABASE_URL` (pg pool), `Database` interface
  type stub, a tiny SQL migrator that runs `migrations/*.sql` in order against a
  `_migrations` tracking table. CLI `migrate` script.
- **T1.2** `core/errors`: `AppError` class with variants (NotFound, Unauthorized, Forbidden,
  Validation(msg), Conflict(msg), RateLimit, Internal) + Fastify `setErrorHandler` that maps
  to the **same HTTP statuses + JSON body** the Rust backend produced (404/401/403/422/409/429/500).
- **T1.3** `core/auth`: JWT sign/verify (`@fastify/jwt`), Argon2 hash/verify wrappers, and a
  Fastify `authenticate` decorator/preHandler that extracts `AuthUser { userId }` from the
  Bearer token (mirrors Rust `AuthUser`).
- **T1.4** `core/http`: `buildApp()` Fastify factory — registers CORS (configurable origins),
  compression, pino logging, error handler, and a `/health` route. Plus `core/config` loader
  reading the same env vars as Rust `Config`.
- **T1.5** `core/storage`: S3 client (works against LocalStack endpoint), `presignPut` and
  `presignGet` helpers, key builders for `listings/{id}/...`.
- **T1.6** `core/email`: `EmailService` interface + `SmtpEmailService` (nodemailer→MailHog)
  + `LogEmailService`. Mirrors Rust email service.

### Wave 2 — Backend app: auth + users + listings parity (parallel, depend on Wave 1)
Each reimplements existing endpoints in Fastify against Kysely, **same JSON shapes**.
- **T2.1** Auth: `/auth/register|login|verify-email|verify-phone|request-phone-code|forgot-password|reset-password`. Repos: users, email_tokens, password_tokens, phone_tokens.
- **T2.2** Users + favorites: `/users/*`, `/me/*`, `/favorites/*`, avatar upload-url.
- **T2.3** Listings core (no digital extras yet, exact contract): `/listings` CRUD + search +
  featured + suggest + detail + publish + renew + activate + deactivate + related. Repos:
  listings (incl. full-text search via existing `search_tsv`), with `count_this_week`.
- **T2.4** Images: `/listings/:id/images/*` (upload-url, commit, reorder, delete).
- **T2.5** Messaging + locations: `/conversations/*`, `/locations/*` (locations kept for
  contract; will be dropped from UI later). Repos: conversations, messages, locations.

### Wave 3 — Digital-asset domain migration (parallel where independent; depend on Wave 2)
- **T3.1** DB migrations: new `.sql` files adding asset columns, `listing_assets`,
  `downloads` tables, new indexes; rewrite seed data to digital listings; drop locations seed.
- **T3.2** Backend asset endpoints + service rules: assets upload-url/commit/delete,
  `/listings/:id/download`; update listing create/publish validation (require ≥1 asset, drop
  city/negotiable). Update DTOs/models for new fields. (depends on T3.1)
- **T3.3** Frontend categories → digital: `CATEGORY_LABELS`, category index/page, home
  category grid, i18n strings.
- **T3.4** Frontend create-listing wizard: add AssetUploadStep, price-only step (remove city),
  relabel photos as preview. Update zod schemas + draft service.
- **T3.5** Frontend listing detail + cards: Download button + file/format/license display,
  remove phone/contact-seller-for-physical, adapt PricingCard/SellerCard.
- **T3.6** Frontend filters/search: replace city filter with license-type + format filters;
  remove CityAutocomplete from filter sidebar.

### Wave 4 — Library extraction / restructure (parallel; depend on Wave 3)
- **T4.1** Frontend: create `src/core/` (move `components/ui`, `components/layout`, shared
  `lib/`), add `@core`/`@app` path aliases in vite+tsconfig, move `modules` + `routes` under
  `src/app/`, fix all imports.
- **T4.2** Docs + infra: update `CLAUDE.md` (Node/Fastify, Kysely, digital-asset domain, new
  layout, commands), update root `README.MD`, update docker-compose comments/bucket name if
  needed, update `.env.example`. Update the three `.claude/skills` (backend-development,
  frontend-development, infrastructure-development) to reflect Node + new structure.

### Wave 5 — Verification (orchestrator)
- **T5.1** `npm run build` + `npm test` on backend; `npm run build` + `npm run lint` on
  frontend; bring up docker-compose, run migrations, smoke-test register→login→create
  listing→upload asset→download. Delete `backend-rust-legacy/`. Final merge to `main`.

---

## Orchestration mechanics

- One **git worktree per todo** within a wave, branched off `main` (`wt/T2.1-auth`, etc.).
- Haiku agents run in parallel within a wave; **opus only plans, reviews, and merges**.
- Between waves the orchestrator merges all branches into `main`, resolves conflicts, runs a
  quick `tsc`/build sanity check, then launches the next wave off the updated `main`.
- All new npm deps **exact-pinned** (verify no `^`/`~` in any `package.json`).

## Risks / notes
- Kysely needs a typed `Database` interface; T1.1 defines a base and each app repo extends it.
  To avoid cross-agent type churn, the **full `Database` interface is defined in T1.1** from the
  known schema (all tables/columns), so Wave-2 agents import a ready type.
- Preserving exact JSON shapes requires Wave-2 agents to match Rust DTO field casing
  (responses appear camelCase to the frontend — confirm serde rename in old DTOs; mirror it).
- `search_tsv` full-text: reuse existing column + trigger from migrations; Kysely uses raw SQL
  fragment for `@@ websearch_to_tsquery`.
