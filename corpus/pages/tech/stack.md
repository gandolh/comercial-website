---
title: Tech Stack
slug: stack
category: tech
tags: [backend, frontend, fastify, react, kysely, sqlite, tailwind, typescript]
sources: 1
updated: 2026-05-28
---

# Tech Stack

## Backend

**Runtime:** Node.js + TypeScript. Exact-pinned npm deps (`package-lock.json`).

**Framework:** Fastify — schema validation, plugin ecosystem, performance over Express.

**Workspace:**
```
backend/
  core/        ← @my-olx/core — db, auth, storage, config, http factory, errors, email
  app/         ← @my-olx/app  — routes, modules, repositories
  migrations/  ← raw .sql files (SQLite); auto-applied at startup
```

**4-layer architecture (within `app/`):**
```
routes/ → handlers/ → services/ → repositories/
```
- `routes/` — Fastify route registration (not yet split into handlers/services in current code; modules contain all three layers)
- `repositories/` — Kysely queries; boolean columns stored as 0/1 integers (SQLite convention)

**DB:** SQLite (`better-sqlite3`) + Kysely. Synchronous migrator; auto-runs `migrations/*.sql` at every server startup. DB file: `backend/data/my-olx.db`.

**Schema notes (SQLite specifics):**
- Timestamps: TEXT (ISO 8601 strings)
- Booleans: INTEGER (0 or 1)
- UUIDs: TEXT (generated in app code)
- No partial indexes, no full-text `tsvector` — search done via `LIKE %q%` in repo

**Auth:** JWT + Argon2. `core/auth/`. Token carries `user_id`.

**Storage:** Disk-based (`core/storage/`). Files saved to `UPLOADS_DIR` (default `data/uploads/`). Served by `@fastify/static` at `/uploads/<key>`. Upload via `@fastify/multipart` direct POST — no presigned URLs.

**Email:** `LogEmailService` (console log) in dev; `SmtpEmailService` for prod — swap via `createEmailService({host: ...})`.

**Errors:** `AppError` enum in `core/errors.ts`; all layers throw it; mapped to HTTP status + JSON at route boundary.

## Frontend

**Build:** Vite + TypeScript. Aliases: `@/` → `src/`, `@core/*` → `src/core/`, `@app/*` → `src/app/`.

**Routing:** React Router v7 — `BrowserRouter`; routes in `src/routes/`.

**Server state:** React Query v5 + Axios (`src/core/lib/axios.ts` — Bearer token, 401 handling).

**Styling:** Tailwind CSS v4. Design system: [[carpathian-clear]].

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
| Uploads | `backend/data/uploads/` |
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

- [[overview]] — project context
- [[carpathian-clear]] — design system tokens
- [[business-rules]] — constraints the stack enforces
