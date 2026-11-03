# Getting started

Run PiațăRo on your own machine: the API in `backend/` and the web app in
`frontend/`. They are separate npm projects with their own lockfiles.

## Prerequisites

- Node and npm. No `engines` field pins a version; the steps below were run on
  Node 24.14.
- `openssl`, or any other way to make a random string for `JWT_SECRET`.
- Nothing else. There is no Docker, no database server and no mail server; the
  SQLite file and the uploads folder are created on first start.

## Backend

```bash
cd backend
npm install
cp .env.example .env    # then set JWT_SECRET, e.g. to the output of: openssl rand -hex 32
npm run dev
```

`npm run dev` builds `@my-olx/core` first (the app imports it from
`core/dist/`), then runs the app under `tsx watch`, applies any new migrations
from `backend/migrations/`, and listens on port 8080 on every interface. After
changing `core/`, restart it.

A `JWT_SECRET` that changes signs everyone out; the one in `.env` stays put.

### Configuration

The API reads `backend/.env` at start when the file exists; real environment
variables (the command line, your shell, a container) win over it.
`backend/.env.example` lists the values.

| Variable | Purpose | Default |
|---|---|---|
| `JWT_SECRET` | Signs sign-in tokens. **Required**: the API stops at start-up without it | none |
| `JWT_EXPIRY_SECONDS` | Token lifetime | `86400` |
| `HOST`, `PORT` | Where the API listens | `0.0.0.0`, `8080` |
| `DATABASE_PATH` | The SQLite file | `data/my-olx.db` under the folder the API runs in, which is `backend/app/` |
| `UPLOADS_DIR` | Listing preview images, served publicly at `/uploads/` | `data/uploads` under the same folder |
| `ASSETS_DIR` | The files for sale, outside the public folder; they go out only through the download routes | `data/assets` under the same folder |
| `PUBLIC_BASE_URL` | The API's own address, used in image and file URLs | `http://localhost:<PORT>` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins the browser may call from | `http://localhost:5173` |
| `FRONTEND_BASE_URL` | The web app's address, used in the links inside emails | `http://localhost:5173` |
| `LOG_LEVEL` | Fastify log level | `info` |

`backend/app/data/`, where a local run keeps the database and uploads, is
gitignored.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app on <http://localhost:5173/>. The app calls the API at
`VITE_API_URL`, which defaults to `http://localhost:8080`; set it in
`frontend/.env` (copy `frontend/.env.example`) to point elsewhere.

## The demo data

A new database has no accounts and no listings. For local work, create the demo
data with:

```bash
cd backend
NODE_ENV=development npm run seed:dev
```

It refuses to run without `NODE_ENV=development`, applies the migrations first,
and adds the rows in `backend/seed/dev/` (a rerun changes nothing):

- three accounts at `example.com` addresses, with verified email and phone.
  Their shared password is in a comment at the top of
  `backend/seed/dev/01-demo-accounts-and-listings.sql`;
- five listings with file and image records.

Until 2026-11-03 these rows were migrations, so a database made before then
already has them; nothing removes them from it.

The image and file records point at files that are not in the repo, so those
five listings show broken previews until you replace them. The README's
screenshots use [images/demo-seed.mjs](images/demo-seed.mjs) to do that; the
steps are in [images/shots.md](images/shots.md).

## Signing up and email

New accounts must verify their email before they can create listings. No SMTP
server is wired in (`createEmailService({})` in `backend/app/src/create-server.ts`),
so every email, including the verification link, password resets and expiry
reminders, is written to the API's log instead of being sent.

## Payments

Payments are simulated, here and in the deployed demo: a fake provider handles
checkout, and `POST /orders/:id/mark-paid` lets the buyer mark their own order
paid. No money moves. There is no payment-provider integration (Stripe was
removed on 2026-11-03).

## Test, typecheck, lint, build

```bash
cd backend && npm test && npm run typecheck   # vitest; tsc over core and app
cd frontend && npm run lint && npm run build  # eslint; tsc + vite build
```

On 2026-10-16 the backend's 156 tests passed and the typecheck was clean. The
frontend built, and `npm run lint` reported 9 errors and 19 warnings that were
already there.

## Common problems

- **`ERR_MODULE_NOT_FOUND` for `@my-olx/core/dist/index.js`.** Run
  `npm run build` in `backend/` first.
- **`JWT_SECRET environment variable is required`.** Pass it on the command
  line; `backend/.env` is not read.
- **`ENOSPC: System limit for number of file watchers reached`.** Something
  else, often VS Code, holds most of the watchers. Run either dev server with
  `CHOKIDAR_USEPOLLING=1 CHOKIDAR_INTERVAL=300` in front.
- **Every API call fails with a CORS error.** Vite moved to another port
  because 5173 was taken, and the API only allows 5173. Free the port, or add
  the new origin to `CORS_ALLOWED_ORIGINS`.
