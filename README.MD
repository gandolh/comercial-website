# my-olx — Digital Assets Marketplace

A modern Romanian marketplace for selling/buying digital files: software, graphics, templates, audio, video, ebooks, fonts, source code, and more.

**Stack:** Node.js/TypeScript + Fastify (backend) · React/TypeScript + Vite (frontend) · PostgreSQL + LocalStack S3

---

## Quick Start

### 1. Start local infrastructure (Postgres, S3, MailHog)

```bash
cd infrastructure/my-olx-local
docker-compose up -d
```

### 2. Install backend dependencies & run migrations

```bash
cd backend
npm install
npm run migrate
npm run dev          # server runs on http://localhost:8080
```

### 3. Install frontend & start dev server

```bash
cd frontend
npm install
npm run dev          # opens http://localhost:5173 (proxies API to :8080)
```

---

## Architecture Snapshot

**Backend:** npm workspace with `@my-olx/core` (engine: Kysely DB, auth, storage) + `@my-olx/app` (routes/handlers/services/repos for listings & assets). Fastify + raw SQL migrations.

**Frontend:** React Router + React Query. Organized as `src/core/` (shared UI engine) + `src/app/` (feature modules). Tailwind CSS v4.

---

## Documentation

- **CLAUDE.md** — Full dev guide: commands, architecture, business rules, design system
- **backend/.env.example** — Backend config (must match docker-compose defaults)
- **frontend/.env** — Frontend config (VITE_API_URL defaults to http://localhost:8080)

---

## Key Features

- **Digital-asset focused:** Sellers upload downloadable files; buyers download. No physical shipping.
- **Free tier:** 5 listings/week per user. Listings auto-expire after 30 days.
- **Asset management:** File format, size, license type (personal/commercial/extended), download tracking.
- **Romanian marketplace:** Full localization with correct diacritics (ă, â, î, ș, ț).
- **Modern UX:** Carpathian Clear design system; < 3 min listing creation target.

---

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` (backend) | Start Fastify dev server with hot reload |
| `npm run build` (backend) | TypeScript build (core → app) |
| `npm test` (backend) | Run vitest suite |
| `npm run migrate` (backend) | Apply SQL migrations to Postgres |
| `npm run dev` (frontend) | Vite dev server with HMR |
| `npm run build` (frontend) | Production build (tsc + Vite) |
| `npm run lint` (frontend) | ESLint check |

---

## For Detailed Guidance

See **CLAUDE.md** in the repo root for architecture, 4-layer backend design, frontend module structure, business rules, and design system specifics.
