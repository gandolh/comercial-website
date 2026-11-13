---
summary: The tech stack: the Fastify, Kysely and SQLite backend workspace, the React and Vite frontend, auth and storage, and how they fit.
updated: 2026-11-12
---

# Tech Stack

## Backend

**Runtime:** Node.js + TypeScript. Exact-pinned npm deps (`package-lock.json`).

**Framework:** Fastify — schema validation, plugin ecosystem, performance over Express.

**Workspace:**
```
backend/
  app/         ← @my-olx/app  — server.ts, app.ts, config.ts, features/<name>/, plugins/ (errors, http, auth), lib/, db/ (Kysely, migrator, shared stores)
  migrations/  ← raw .sql files (SQLite); auto-applied at startup
```

**Code structure (since 2026-11-12, brief 13; the `code-structure` skill):** one folder per feature,
`app/src/features/<name>/` (`routes.ts`, `schemas.ts`, `service.ts`, `store.ts`, `index.ts`), with the
stores several features share in `app/src/db/`. Most handlers still hold their Kysely queries (rule 7 is
the next step). Boolean columns are stored as 0/1 integers (SQLite convention).

**Validation and replies:** zod 4.6.7 through `@fastify/type-provider-zod` 1.0.3 on every route (params,
querystring, body and a response schema per success status), with its required peers `@fastify/swagger`
9.9.3 and `openapi-types` 12.1.3, installed but unused at run time. `fastify-plugin` 6.0.1 wraps core's
plugins; `close-with-grace` 2.5.0 ends the process on SIGTERM.

**DB:** SQLite (`better-sqlite3`) + Kysely. Synchronous migrator; auto-runs `migrations/*.sql` at every server startup. DB file: `backend/data/my-olx.db`.

**Schema notes (SQLite specifics):**
- Timestamps: TEXT (ISO 8601 strings)
- Booleans: INTEGER (0 or 1)
- UUIDs: TEXT (generated in app code)
- No partial indexes, no full-text `tsvector` — search done via `LIKE %q%` in repo

**Auth:** JWT + Argon2. `core/auth/`. Token carries `user_id`.

**Storage:** Disk-based (`app/src/lib/storage.ts`). Listing images go to `UPLOADS_DIR` (default `data/uploads/`), served by `@fastify/static` at `/uploads/<key>`. Files for sale go to `ASSETS_DIR` (default `data/assets/`), which is not served: they leave only through the download routes, which check the order (since 2026-11-03). Upload via `@fastify/multipart` direct POST — no presigned URLs.

**Email:** `LogEmailService` (console log) in dev; `SmtpEmailService` for prod — swap via `createEmailService({host: ...})`.

**Errors:** `AppError` enum in `core/errors.ts`; all layers throw it; mapped to HTTP status + JSON at route boundary.

## Frontend

**Build:** Vite + TypeScript. Aliases: `@/` → `src/`, `@core/*` → `src/core/`, `@app/*` → `src/app/`.

**Routing:** React Router v7 — `BrowserRouter`; routes in `src/routes/`.

**Server state:** React Query v5 + Axios (`src/core/lib/axios.ts` — Bearer token, 401 handling).

**Styling:** Tailwind CSS v4. Design system: [carpathian-clear](carpathian-clear.md).

**Forms:** React Hook Form + Zod.

**i18n:** react-i18next, Romanian default. Translations: `public/locales/{lang}/common.json`.

**State:** Zustand available; prefer React Query for server state.

**Feature modules:** `src/app/{feature}/` with `pages/`, `components/`, `hooks/`, `types/`, `apis/`, `queries/`.

## Infrastructure (dev)

**No Docker.** SQLite and uploads dir are auto-created on first run.

```bash
cd backend && npm run dev   # starts server on :8080, runs migrations
cd frontend && npm run dev  # starts Vite on :5173
```

| What | Path |
|---|---|
| Database | `backend/data/my-olx.db` |
| Uploads (images) | `backend/app/data/uploads/` |
| Assets (files for sale) | `backend/app/data/assets/` |
| Public URL | `http://localhost:8080/uploads/<key>` |

## Key npm scripts

```bash
# Backend (from backend/)
npm run dev       # tsx watch src/server.ts
npm run build     # tsc -b core then app
npm test          # vitest

# Frontend (from frontend/)
npm run dev       # vite dev server
npm run build     # tsc + vite build
npm run lint      # ESLint
```

## Open questions

- Production DB: SQLite works for MVP; migrate to PostgreSQL or Turso for multi-instance scale
- Payment provider not chosen (Stripe vs. Romanian PSP: Netopia/TWISPAY)
- CI/CD pipeline not set up

## See also

- [overview](overview.md) — project context
- [carpathian-clear](carpathian-clear.md) — design system tokens
- [business-rules](business-rules.md) — constraints the stack enforces

## Deployed paths (2026-11-03)

The deploy serves the frontend at `/piataro/` (built with `PIATARO_BASE=/piataro/`) and the API at
`/piataro-api/`, with the prefix stripped, so the API keeps its bare routes. The frontend reaches the API
through `apiUrl()` (`frontend/src/core/lib/api-url.ts`); `PUBLIC_BASE_URL` and `FRONTEND_BASE_URL` give the
API its public addresses for image URLs and redirects.
