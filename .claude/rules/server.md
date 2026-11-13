---
paths:
  - "backend/**/src/**"
---

# The backend (`backend/app/src`)

Follow the `code-structure` skill; these are its rules as they hold here.

- `app/src/server.ts` alone listens: settings, `prepareStorage`, `buildApp`, close-with-grace, the timeouts
  (`connectionTimeout` 10 s, `keepAliveTimeout` 125 s, no whole-request timeout because of the 500 MB
  uploads). `app/src/app.ts` exports `buildApp(config, options)` and registers by name: the zod compilers,
  then the plugins `errors`, `http`, `auth`, then each feature through its `index.ts`.
- `app/src/config.ts` is the only reader of `process.env` (`n/no-process-env` is an error) and the only
  reader of `NODE_ENV` (the dev seed's guard). The CLIs take their settings from it.
- `plugins/` (fastify-plugin wrapped, typed options), `lib/` (no Fastify import: `AppError`, tokens, email,
  storage) and `db/` sit beside `features/`. The plugins and the generic lib files know nothing about
  listings or orders and read no environment.
- A feature is `app/src/features/<name>/`: `routes.ts` (a `FastifyPluginAsyncZod<AppContext>`), optional
  `schemas.ts`, `service.ts`, `store.ts`, and `index.ts`, its public surface. Another feature imports it only
  through that index (dependency-cruiser). A store several features share lives in `app/src/db/`.
- Every route declares its `params`, `querystring` and `body` with zod, and a `response` schema for each
  success status its handler sends, never a 401/403/404/409/422 (the error plugin writes those). Response
  schemas are output schemas: no `.transform()`, no `.strict()`. No handler parses request input. Streams,
  file bodies and redirects declare inputs only, each with a `scripts/conventions.json` entry.
- Validation runs before the `authenticate` preHandler: a malformed body answers 422 even signed out.
- Errors are `AppError` (`app/src/lib/api-error.ts`). The one handler (`app/src/plugins/errors.ts`) answers
  `{ error }`: 422 with the first issue's message (or the route's `fixedValidationMessage`), Fastify's own 4xx
  with their status, anything else a logged 500 `internal error`.
- A protected handler reads the signed-in user with `requireUserId(request)` (from `app/src/plugins/auth.ts`), never
  `request.userId!`.
- The API never serves a paid file from the public uploads folder: paid files live under `ASSETS_DIR`.
- Dates and money rules are in [corpus/wiki/business-rules.md](../../corpus/wiki/business-rules.md).
- No `console` outside the CLIs (`seed-dev`, `seed-samples`, `create-owner`, `migrate`). Log through
  Fastify's logger.
- `backend/app/vendor/` is Ward's generated library. Never edit it.
- Tests use `startTestApp()` (`app/src/testing/test-app.ts`): the whole app on a temporary data folder.
- `npm run check:conventions` runs `check-structure` strict over these folders.
