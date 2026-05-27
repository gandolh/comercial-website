---
name: backend-development
description: Use when adding features, endpoints, business logic, or DB changes to the Node.js/TypeScript + Fastify backend of this project (my-olx digital-assets marketplace)
---

# Backend Development — my-olx (Node.js/TypeScript + Fastify)

## Architecture: npm Workspace + 4-Layer App

**Workspace structure:**
```
backend/
  core/              ← @my-olx/core (shared engine: db, auth, storage, http factory, errors)
  app/               ← @my-olx/app (marketplace impl: routes, handlers, services, repos, dto)
  migrations/        ← raw .sql files run via npm run migrate
```

**Within `app/` (4-layer, bottom-up):**
```
models → repositories → services → handlers → routes
(types)   (Kysely+SQL)  (business)   (HTTP)    (Fastify)
```

Logic belongs in `services/`. DB queries belong in `repositories/`. Handlers are thin: parse request → call service → return response. Never put Kysely queries in services or business logic in handlers.

## Task Checklists

### New endpoint (full stack)
1. Migration first: create `.sql` file in `backend/migrations/` (see below)
2. Update/create model/type in `app/src/types/` or within the domain folder
3. Extend repository trait + Postgres impl in `app/src/repositories/`
4. Add business logic in `app/src/services/`
5. Write thin handler in `app/src/handlers/`
6. Wire route in `app/src/routes/` and root `routes.ts`
7. Write tests alongside implementation (services layer minimum; use vitest)

### New business rule only
- Touch `services/` only
- Add/update unit test with mock repo

### New DB column or table
1. Migration first: add to `backend/migrations/{timestamp}_{desc}.sql`
2. Run `npm run migrate` locally
3. Update `app/src/types/` (DB model)
4. Update repository queries
5. Update affected DTOs in `app/src/dto/`

### New endpoint security gate (before marking done)
- [ ] Needs JWT auth? Extract `user_id` from token in handler (auth middleware in Fastify).
- [ ] Input validated via Zod schema in `app/src/dto/`?
- [ ] Returns correct `AppError` variant (not `Internal` for user errors)?

## Migrations — Always First

Raw SQL files in `backend/migrations/` run in lexicographic order via custom migrator. Always create migration before writing TypeScript code.

**Create migration:**
```bash
# From backend/, manually create file (no CLI helper yet)
touch migrations/001_create_users_table.sql
```

**Write migration (UP + DOWN):**
```sql
-- UP
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOWN
DROP TABLE users;
```

**Apply migrations:**
```bash
npm run migrate     # runs pending migrations in backend/migrations/ against local Postgres
```

Migrations are tracked in a `_migrations` table; run before starting dev server or tests.

## Repository Pattern

Reference `app/src/repositories/` as the canonical pattern:
- Define `interface *Repository { async query1(...): Promise<T>; ... }`
- Implement as `class Postgres*Repository implements *Repository { ... }`
- Use interface in services (enables mock testing with stubs)
- Queries use Kysely + raw SQL where needed

## Testing

Tests live in the same file or adjacent `*.test.ts` (vitest). Services are the primary test target — mock the repository interface.

```bash
npm test            # run vitest
npm test -- --ui    # watch mode with UI
```

Tests required; write them alongside or immediately after implementation.

## Error Handling

All layers return `AppError` (from `@my-olx/core`). Use the most specific variant:

| Situation | Code | HTTP |
|-----------|------|------|
| Not found in DB | `NOT_FOUND` | 404 |
| Bad JWT / no token | `UNAUTHORIZED` | 401 |
| Wrong owner / no permission | `FORBIDDEN` | 403 |
| Invalid input (Zod fail) | `VALIDATION_ERROR` | 400 |
| Duplicate (email, etc.) | `CONFLICT` | 409 |
| Weekly listing limit hit | `RATE_LIMIT` | 429 |
| Unexpected failures | `INTERNAL_ERROR` | 500 |

Throw `AppError` or let it bubble; Fastify error handler maps to HTTP response.

## Exact-Pinned Dependencies

All npm versions are locked in `package-lock.json`. Never bump without explicit agreement. When adding a package:

```bash
npm install <package>@<exact-version>
npm ci                  # install with lock file (CI/dev standard)
```

## Key Business Rules

- **Free tier:** 5 listings/week per user (enforced in `services/listings.ts`)
- **Listings expire:** 30 days after creation (auto-set at creation)
- **Digital assets required:** Publishing requires ≥1 uploaded file (images optional)
- **Asset fields:** file_format, file_size_bytes, license_type (personal|commercial|extended), download_count
- **New endpoints:** `GET /listings/:id/assets` (list), `GET /listings/:id/download` (authenticated download)
- **Currency:** RON optional (None = free listing)
- **Categories:** software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse

## Commands

```bash
npm install              # install workspace deps (core + app + node_modules)
npm run dev              # start Fastify dev server (tsx watch, 0.0.0.0:8080)
npm run build            # TypeScript build: tsc -b (core → app)
npm test                 # vitest (all test files)
npm run migrate          # apply pending SQL migrations to Postgres
```

Requires PostgreSQL, LocalStack S3, MailHog running. See `backend/.env.example` and `infrastructure/my-olx-local/docker-compose.yml`.
