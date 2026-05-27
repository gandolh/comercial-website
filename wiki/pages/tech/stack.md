---
title: Tech Stack
slug: stack
category: tech
tags: [backend, frontend, infra, fastify, react, kysely, tailwind]
sources: 1
updated: 2026-05-27
---

# Tech Stack

## Backend

**Runtime:** Node.js + TypeScript. Exact-pinned npm dependencies (`package-lock.json`).

**Framework:** Fastify — chosen for schema validation, plugin ecosystem, and performance over Express.

**Workspace structure:**
```
backend/
  core/   ← @my-olx/core — db, auth, storage, config, http factory, errors
  app/    ← @my-olx/app  — routes, handlers, services, repositories, dto
  migrations/  ← raw .sql files applied via `npm run migrate`
```

**4-layer architecture (within `app/`):**
```
routes/ → handlers/ → services/ → repositories/
```
- `routes/` — Fastify route registration
- `handlers/` — HTTP extraction; reads `user_id` from JWT; calls service; sends response
- `services/` — business logic; generic over repository traits (mockable for unit tests)
- `repositories/` — Kysely queries + raw SQL; defined as traits (interfaces)
- `dto/` — request/response JSON shapes (separate from DB models)

**DB:** PostgreSQL 16 + Kysely (query builder). Custom migrator runs `migrations/*.sql`. No ORM.

**Auth:** JWT (creation + verification in `core/auth/`) + Argon2 password hashing. Tokens carry `user_id`.

**Storage:** S3-compatible client in `core/storage/`. LocalStack in dev, real AWS S3 in prod.

**Error handling:** Single `AppError` enum in `core/errors.ts`. All layers return `Result<T, AppError>`. Maps to HTTP status + JSON body at the handler boundary.

---

## Frontend

**Build:** Vite + TypeScript. Path aliases: `@/` → `src/`, `@core/*` → `src/core/`, `@app/*` → `src/app/`.

**Routing:** React Router v7 — `BrowserRouter` in `App.tsx`; routes in `src/routes/`.

**Server state:** React Query v5 + Axios. Axios instance in `src/core/lib/axios.ts` — adds Bearer token, handles 401.

**Styling:** Tailwind CSS v4. Design system: [[carpathian-clear]].

**Forms:** React Hook Form + Zod.

**i18n:** react-i18next, Romanian default. Translations: `public/locales/{lang}/common.json`.

**State:** Zustand available; prefer React Query for server state.

**Feature module structure:** `src/app/{feature}/` with `pages/`, `components/`, `hooks/`, `types/`, `apis/`, `queries/`.

---

## Infrastructure (dev)

| Service | Tool | Port |
|---|---|---|
| PostgreSQL 16 | docker-compose | 5432 |
| S3 (local) | LocalStack | 4566 |
| Email (dev) | MailHog | 8025 (UI), 1025 (SMTP) |

All started with `docker-compose up -d` in `infrastructure/my-olx-local/`.

---

## Open questions

- Production infra not yet defined (AWS ECS Fargate likely given LocalStack + S3 usage)
- Payment provider not chosen
- CI/CD pipeline not set up

## See also

- [[overview]] — project context
- [[business-rules]] — constraints the stack must enforce
- [[carpathian-clear]] — design system
