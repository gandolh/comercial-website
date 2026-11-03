# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Knowledge Base

The project corpus is at `corpus/`. Read `corpus/index.md` first, and `corpus/CLAUDE.md` for its rules.
- `corpus/wiki/` — LLM-maintained wiki (overview, decisions, status, entities, features, market research)
- `corpus/briefs/` — numbered work specs (`todo/`, `done/`, `superseded/`)
- `corpus/raw/` — immutable source documents (never edit)

## Project Overview

**PiațăRo** (the name the UI shows; code name **my-olx**, the `@my-olx/*` packages) is a Romanian
**digital-files marketplace**: sellers upload downloadable files, buyers download them. No physical
goods, no shipping. Since 2026-11-03 it is being turned into a **deployed demo with fake payments**
that only the owner signs into (`corpus/wiki/decisions.md`).

Two npm projects with their own lockfiles: `backend/` (Node + TypeScript + Fastify, a workspace of
`@my-olx/core` and `@my-olx/app`, Kysely over SQLite with `better-sqlite3`, files on disk) and
`frontend/` (React + Vite + TanStack Router + React Query + Tailwind v4). Exact-pinned dependencies.
The root `package.json` has no dependencies; its scripts only call into the two (and vps-deploy needs
one at the checkout's root).

**Deploy:** vps-deploy's `piataro` stack serves the frontend at `/piataro/` and the API's container
(`infrastructure/`, port 8807, data in a bind-mounted `/data`) at `/piataro-api/`. See `docs/deploy.md`.

## Commands

### Backend

```bash
cd backend
npm install
cp .env.example .env          # then set JWT_SECRET; the API reads backend/.env when it exists
npm run dev                   # builds @my-olx/core, then tsx watch on port 8080; migrations run at start
npm run build                 # core, then app
npm test                      # vitest, both workspaces
```

The app imports `@my-olx/core` from `core/dist/`: after changing `core/`, rebuild it (or restart
`npm run dev`). Data defaults to `backend/app/data/` (the SQLite file and uploads; gitignored),
relative to the folder the API runs in.

### Frontend

```bash
cd frontend
npm install
npm run dev                   # Vite on port 5173
npm run build                 # tsc + vite build
npm run lint                  # ESLint
```

The frontend calls the API at `VITE_API_URL` (default `http://localhost:8080` in dev and
`/piataro-api` in a build; `frontend/src/core/lib/api-url.ts`). `PIATARO_BASE` sets the base path.

## Architecture

### Backend

```
backend/
  core/src/       @my-olx/core: auth/ (JWT + Argon2, the authenticate hook), config/, db/ (Kysely,
                  SQLite, the migrator), email/, errors/ (AppError + the Fastify error handler),
                  http/ (the Fastify factory: CORS, multipart, static /uploads/), storage/ (disk)
  app/src/        @my-olx/app: server.ts (the entry), modules/ (one file per domain: auth, listings,
                  assets, images, orders, invoices, reviews, bundles, messaging, favorites, users,
                  anaf), repositories/ (Kysely queries), jobs/ (expiry reminders)
  migrations/     raw .sql files, applied at start
```

Routes live in `app/src/modules/*.ts`; each registers its routes on the Fastify app and throws
`AppError` for failures, which the error handler maps to a status and `{ error }` JSON. There is no
separate API contract file: the route modules are the contract.

### Frontend

- **Routing:** TanStack Router; the route tree is in `src/app/routes/`, and `src/core/lib/router.ts`
  wraps the router's hooks and components (`Navigate`, `useNavigate`, `useParams`).
- **Feature modules:** `src/app/modules/<feature>/` with `pages/`, `components/`, `hooks/`, `services/`.
- **Shared:** `src/core/components/` (layout, ui), `src/core/lib/` (axios with the bearer token, auth,
  i18n, query client), path aliases `@/`, `@core/`, `@app/`.
- **Server state:** React Query v5 + Axios. **i18n:** react-i18next, Romanian default
  (`public/locales/{ro,en}/`).

### Design system: Carpathian Clear

Tokens in `design/design-system/carpathian-clear.json` (Material Design 3 conventions): primary
`#0056D2`, secondary `#008B8B`, tertiary `#2E7D32`; Manrope headlines, Inter body. Mockups in
`design/screens/` and `design/code/`.

### Key business rules

See `corpus/wiki/business-rules.md`. In short: 5 listings per rolling week per user; listings expire
30 days after creation; publishing needs at least one downloadable asset (images are previews);
prices in RON, `null` is free; 13 categories (`backend/app/src/listings-helpers.ts`); Romanian UI with
correct diacritics (ă, â, î, ș, ț).
