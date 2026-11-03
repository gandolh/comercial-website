# Task 03 — Close the security gaps before the demo goes public

## Context
Two gaps found on 2026-10-16 that a public deploy must not carry ([log.md](../../log.md)):
`migrations/20260428010000_seed_data.sql` (and `20260601000100_seed_digital.sql`) insert demo accounts
with the known password `12345678` into every database; and paid files sit in the folder
`@fastify/static` serves at `/uploads/` (`backend/core/src/http/index.ts`), so anyone with the key can
download a paid file without an order.

## Files you OWN
`backend/migrations/` (the seed files), a dev seed script, `backend/core/src/http/`,
`backend/core/src/storage/`, `backend/app/src/modules/assets.ts`, `orders.ts`, `images.ts`, their tests.

## What to do
1. **Seeds out of migrations.** Migrations create schema only. Move the demo rows into a dev seed
   command (e.g. `npm run seed:dev`) that refuses to run unless `NODE_ENV=development`. A fresh
   production database has no account at all (brief 05 adds the owner's). Existing dev databases keep
   their rows; say so in `docs/getting-started.md`.
2. **Paid files off the public path.** Keep listing **images** public. Store asset files outside the
   statically served folder, and serve them only through the authorized download routes
   (`GET /listings/:id/download`, the asset routes), which check a paid order or a free listing.
   Move existing asset files on startup or with a one-off script, and say which.
3. Tests: an asset file is not reachable by any static URL; the download route refuses without an
   order on a paid listing and serves with one.

## Acceptance
- A fresh database has no users; `npm run seed:dev` creates the demo data in development only.
- `curl` on a paid asset's old `/uploads/` URL gets 404; the authorized download still works.
- Backend build and tests pass.
