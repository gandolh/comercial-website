# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**my-olx** (formerly "PiațăRo") is a **digital-assets marketplace**: sellers upload downloadable files (zip, pdf, psd, mp4, etc.), buyers download them. No physical goods, no shipping, no location/city. Asset categories: software, grafica (grafică), sabloane (șabloane), audio, video, ebook, fonturi, cod-sursa (cod sursă), diverse.

Monorepo: **Node.js/TypeScript + Fastify** backend (npm workspace with `@my-olx/core` engine + `@my-olx/app` implementation), **React/TypeScript + Vite** frontend. Exact-pinned dependencies; Kysely + raw SQL + custom migrator for DB; early stage — auth/listings core implemented.

## Commands

### Local Infrastructure (start first)

```bash
cd infrastructure/my-olx-local
docker-compose up -d          # starts PostgreSQL 16, LocalStack (S3), MailHog
```

### Backend (Node.js/TypeScript + Fastify)

```bash
cd backend
npm install                   # first time only (installs both @my-olx/core and @my-olx/app)
npm run dev                   # tsx watch — server on 0.0.0.0:8080
npm run build                 # tsc -b (compiles core then app)
npm test                      # vitest
npm run migrate               # apply backend/migrations/*.sql to local Postgres
```

Backend uses `@my-olx/core` (engine: db, auth, storage, config) and `@my-olx/app` (routes/handlers/services/repos/dto for digital assets). `.env` values must match docker-compose defaults.

### Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev                   # dev server with HMR (proxies API to localhost:8080)
npm run build                 # tsc + vite build
npm run lint                  # ESLint
```

Frontend reads `VITE_API_URL` (default: `http://localhost:8080`) from `.env`.

## Architecture

### Backend: npm Workspace with 4-Layer App

**Structure:**
```
backend/
  core/                 ← @my-olx/core (shared engine)
    src/db/            ← Kysely + raw SQL + custom migrator
    src/auth/          ← JWT + Argon2 password hashing
    src/storage/       ← S3 client
    src/config/        ← env parsing
    src/http.ts        ← Fastify factory
    src/errors.ts      ← AppError enum
  app/                  ← @my-olx/app (marketplace implementation)
    src/
      routes/          ← Fastify route assembly
      handlers/        ← thin HTTP extraction/response
      services/        ← business logic
      repositories/    ← db queries (trait + Postgres impl)
      dto/             ← request/response JSON shapes
  migrations/           ← raw .sql files (run via npm run migrate)
```

**Within `app/` (4-layer):**
```
routes/ → handlers/ → services/ → repositories/ → models/
```

- **routes/** — Fastify route assembly (`/auth`, `/listings`, `/assets`, etc.)
- **handlers/** — Thin: parse request, call service, return response; protected endpoints use `user_id` from JWT
- **services/** — Business logic; generic over repository traits for unit testing with mocks
- **repositories/** — Kysely queries + raw SQL; defined as traits
- **dto/** — Request/response JSON shapes (separate from DB models)

**Core engine:**
- **db/** — Kysely instance + custom migrator (`npm run migrate` applies `backend/migrations/*.sql`)
- **auth/** — JWT creation/verification + Argon2 hashing; `password_hash` only, never plaintext
- **storage/** — S3 client (LocalStack in dev)
- **http.ts** — Fastify factory with middleware: CORS, compression, tracing
- **errors.ts** — Single `AppError` enum; all layers return `Result<T, AppError>`; maps to HTTP status + JSON

**Key:** Exact-pinned npm versions (`package-lock.json`); `@my-olx/core` is stable, `@my-olx/app` depends on it.

### Frontend: React Router + React Query with Core/App Split

- **Routing:** React Router v7 — `BrowserRouter` in `App.tsx`; routes in `src/routes/`
- **Layout:** `src/core/layout/` (Navbar, Footer, PageShell)
- **Shared UI:** `src/core/ui/` — reusable components (Button, Input, Modal, etc.)
- **Server state:** React Query v5 + Axios (`src/core/lib/axios.ts` — adds Bearer token, handles 401)
- **Styling:** Tailwind CSS v4; path aliases `@/` → `src/`, `@core/*` → `src/core/`, `@app/*` → `src/app/`
- **Forms:** React Hook Form + Zod
- **i18n:** react-i18next with Romanian default; translations in `public/locales/{lang}/common.json`
- **State:** Zustand available; prefer React Query for server state

**Feature modules:** `src/app/{feature}/` with subfolders `pages/`, `components/`, `hooks/`, `types/`, `apis/`, `queries/`.

### Design System: Carpathian Clear

Tokens: `design/design-system/carpathian-clear.json` (Material Design 3 conventions).
- Primary: `#0056D2` (blue), Secondary: `#008B8B` (teal), Tertiary: `#2E7D32` (green)
- Fonts: Manrope (headlines), Inter (body)
- Border radius: 8px (`rounded-xl`)
- HTML mockups for reference: `design/screens/` and `design/code/`

### Key Business Rules

- **Free tier:** 5 listings/week per user (enforced in `services/listings.ts`)
- **Listings expire:** 30 days after creation (auto-set at creation)
- **Digital assets required:** Publishing requires ≥1 uploaded downloadable file (not images alone); images are optional preview screenshots
- **Asset fields:** file_format, file_size_bytes, download_count; license_type (personal | commercial | extended)
- **New endpoints:** `GET /listings/:id/assets/*` (list downloads), `GET /listings/:id/download` (authenticated download)
- **Currency:** RON (optional pricing; `None` = free listing)
- **Categories:** software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse
- **Romanian localization:** Required throughout UI; correct diacritics (ă, â, î, ș, ț)
- **Target:** < 3 min listing creation, WCAG 2.1 AA accessibility
