# Task 13: The server in the house code structure

**Depends on:**

- In comercial-website: brief 11, for the backend's ESLint, `n/no-process-env` (a warning until this brief), the `pretest` build, TypeScript 6.0.3, `erasableSyntaxOnly`, and `.claude/rules/server.md`.
- In the owner's skills library:
  - brief 03, *A code-structure skill for the Fastify + React apps*: rules 1-11, the `server-skeleton.md` reference, `zod-type-provider.md`, `migrating-a-server.md`, `check-structure.mjs`, and the dependency-cruiser and knip presets;
  - brief 16, *The Fastify servers adopt the code structure*: this repo's row and the method;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: `check-structure` runs `--warn-only` until this brief is done.
- The owner's grilling of 2026-11-10 and its technical calls:
  - Q1 (how services start: a container starting a file path, so renaming the entry means changing the `Dockerfile`'s `CMD`);
  - Q23 (`features/<name>/`);
  - Q24 (plugin options, explicit registration);
  - Q25 (response schemas everywhere);
  - Q53 (stream and binary routes);
  - Q56 (`AppError` and decorators);
  - Q43 (the error body, and Fastify's own 4xx), Q52 (validation before authorisation) and Q55 (where schemas live);
  - and the questions left open in "Decisions".

**Order:** after brief 11. It touches no frontend file, and the two lockfiles are separate, so it may run before or after brief 12, but never at the same time as brief 11.

## Context

The owner asked on 2026-11-09 for one researched code structure, enforced in every repo. This repo's server is two packages: `backend/core` (`@my-olx/core`, a library of plugins and helpers) and `backend/app` (`@my-olx/app`, the routes and the entry). It already has what most of the estate lacks:

- an entry that listens, and a `createServer(config)` that builds the app and doesn't (`backend/app/src/server.ts`, `backend/app/src/create-server.ts`);
- one error handler;
- a typed `AppContext` handed to every route registrar (`backend/app/src/context.ts`);
- 18 test files and 160 tests that build the real app on a temporary database (`backend/app/src/test-app.ts`).

What it lacks:

- feature folders (the code is `modules/*.ts` plus `repositories/*.ts`);
- route schemas of any kind (`grep -rnE "schema:|response:" backend/app/src backend/core/src` finds no Fastify `schema`), so every reply goes through `JSON.stringify` and a field added to a row leaks;
- `fastify-plugin` on the cross-cutting plugins, and `close-with-grace`;
- an app that builds without side effects: `createServer` runs `mkdir`, the migrations and a file move before it builds (`create-server.ts:74-90`);
- one reader of the environment: 21 sites read `process.env` (below);
- zod 4: both packages are on zod 3.24.1.

### The versions (verified 2026-11-10)

- **fastify 5.12.7**, pinned in `backend/core/package.json` and `backend/app/package.json`. The latest is 5.12.8 (`npm view fastify version`). The type provider needs `^5.5.0`. Not bumped here (decision 9).
- **zod 3.24.1** in both packages, with one copy in `backend/package-lock.json`. The provider needs `>=4.2.0`, so this brief starts with a zod move to 4.6.7 (`npm view zod version`). The frontend is on zod 4.3.6 in its own project and is not touched.
- **`@fastify/type-provider-zod` 1.0.3**, with required peers `zod >=4.2.0`, `fastify ^5.5.0`, `@fastify/swagger >=9.5.1` and `openapi-types ^12.1.3` (`npm view @fastify/type-provider-zod@1.0.3 peerDependencies --json`). npm installs the two last ones. They are type-only weight at run time. Pin `@fastify/swagger` 9.9.3 and `openapi-types` 12.1.3, and name both in [wiki/stack.md](../../wiki/stack.md).
- **`fastify-plugin` 6.0.1** and **`close-with-grace` 2.5.0**. The lockfile already holds `fastify-plugin` 5.1.0 hoisted and 6.0.1 under `@fastify/static`; the new pin makes them one copy where it can.
- **TypeScript 6.0.3** from brief 11.

### zod 3 to 4 in this repo (measured 2026-11-10)

`grep -rnE <pattern> backend/app/src backend/core/src --include=*.ts`, tests excluded:

| Construct | Count | What changes in zod 4 |
|---|---|---|
| `.errors` on a `ZodError` | 8, including `backend/core/src/errors/index.ts` | removed; it is `.issues` |
| `z.string().email()` and `.email(` | 2 | the top-level `z.email()` is preferred; the method still works but is deprecated |
| `.url(` | 3 | the same, `z.url()` |
| `.default(` | 8 | a default now short-circuits when the input is `undefined` and is not parsed; check each one |
| `.transform(` | 3: `backend/app/src/modules/listings.ts:154-155`, `backend/app/src/modules/users.ts:163` | works, but see the serializer trap below |
| `z.coerce` and `z.preprocess` | 9 | `z.coerce` input type is `unknown`; check the inferred types |
| `.refine(` and `.superRefine` | 7 | the `message` option moves to `error`; `message:` is still accepted (25 uses) |
| `.strict()`, `.passthrough()`, `z.nativeEnum`, `z.record(` | 0 | |

The user-visible effect: the default validation messages differ ("Required" in zod 3, "Invalid input: expected string, received undefined" in zod 4). The error handler returns the first issue's message as the body (`core/src/errors/index.ts`), so tests and users see new text for fields without a custom message. Step 1 saves the before messages, and step 4 compares them.

### A trap for the response schemas (from the skills library, applies here)

The provider's serializer calls zod's `safeEncode`, and **zod throws when encoding through a `.transform()`**. This repo has three transforms, all on input schemas (a query string's `"true"` to a boolean, and an empty website to `null`), which are decoded, and decoding is fine. The rule is: response schemas are **separate, transform-free output schemas**. Write them next to the input schemas and never reuse an input schema as a response.

### The move map: every file under `backend/` (61 files, 43 source and 18 tests)

Paths below are from `backend/` unless noted. Line counts are from `wc -l`, 2026-11-10. Files not listed (`core/src/db/schema.ts`, `core/src/db/index.ts`, `core/src/db/migrator.ts` and their tests, `core/src/storage/`, `core/src/auth/` token code) stay where they are or move only into the `core` layout below.

**The app, `app/src/`**

| Today | Lines | Target | Note |
|---|---|---|---|
| `server.ts` | 27 | the same | Entry: `loadEnvFile()`, `loadConfig()`, `buildApp`, `close-with-grace`, `listen`. Already the right name, so the `Dockerfile` `CMD ["node", "app/dist/server.js"]` (`infrastructure/Dockerfile:112`) does not change. The `NODE_ENV !== "test"` gate (line 19) becomes an option. |
| `create-server.ts` | 94 | `app.ts` | Exports `buildApp(config, options)` and registers in a fixed order. The `mkdir`, migrations and asset move (lines 74-90) move to `app/src/startup/prepare-storage.ts`, called by `server.ts` and by the test helper. `buildApp` then has no I/O of its own beyond opening the db. |
| `context.ts` | 23 | the same | `AppContext` stays as the typed plugin options (decision 2). |
| `test-app.ts` | 33 | `testing/test-app.ts` | Keeps `startTestApp` (decision 7). The `Dockerfile`'s `find ... -name 'test-app.*' -delete` (line 96) matches by base name, so it still works. |
| `move-assets.ts`, `move-assets.test.ts` | 24, 27 | `startup/move-assets.ts`, `.test.ts` | |
| `migrate.ts`, `seed-dev.ts`, `seed-samples.ts`, `create-owner.ts` | 32, 32, 166, 57 | the same | CLIs. Their environment reads move to `config.ts`. |
| `payout-fee.ts` | 12 | `lib/payout-fee.ts` | Pure. Orders, payouts and `seed-samples.ts` use it. |
| `ward-client.ts` | 11 | `features/ward/client.ts` | |
| `jobs/expiry-reminders.ts`, `.test.ts` | 86, 297 | `features/reminders/service.ts`, `service.test.ts` | Plus a new `features/reminders/index.ts` exporting `startExpiryReminderJob`. |
| `modules/auth.ts` | 346 | `features/auth/routes.ts` | 7 routes. |
| `repositories/users-auth.repo.ts` | 230 | `features/auth/store.ts` | Only auth imports it. |
| `modules/users.ts` | 573 | `features/users/routes.ts` | 7 routes. Over rule 11's 400 lines: a warning to leave. |
| `modules/favorites.ts` | 164 | `features/favorites/routes.ts` | 4 routes. |
| `modules/listings.ts`, `repositories/listings.repo.ts`, `listings-helpers.ts`, `repositories/listings.repo.test.ts`, `modules/listings.test.ts` | 599, 676, 193, 170, 23 | `features/listings/{routes,store,helpers}.ts` and their tests | 14 routes. Two files over 400 lines. `features/listings/index.ts` exports `toListingCardResponse` (bundles uses it) and the store. |
| `modules/images.ts` | 194 | `features/images/routes.ts` | 3 routes, multipart upload. |
| `modules/assets.ts`, `repositories/assets.repo.ts`, `modules/assets.test.ts` | 309, 166, 55 | `features/assets/{routes,store}.ts`, `routes.test.ts` | 5 routes. It imports `hasPaidOrder` and `isFree` from `./orders.js` (line 8); afterwards from `../orders/index.js`. |
| `modules/bundles.ts`, `repositories/bundles.repo.ts`, `bundles.test.ts` | 110, 82, 250 | `features/bundles/{routes,store}.ts`, `routes.test.ts` | 2 routes. |
| `modules/messaging.ts` | 555 | `features/messaging/routes.ts` | 7 routes. Over 400. |
| `modules/orders.ts`, `modules/orders.test.ts` | 320, 62 | `features/orders/{routes,service}.ts`, `routes.test.ts` | 4 routes. `FakePaymentProvider` and `hasPaidOrder`, `isFree` go through `features/orders/index.ts`. Reviews and assets import them (`reviews.ts:18`, `assets.ts:8`). |
| `modules/reviews.ts`, `repositories/reviews.repo.ts`, `repositories/reviews.test.ts` | 141, 140, 313 | `features/reviews/{routes,store}.ts`, `store.test.ts` | 3 routes. |
| `modules/payouts.ts`, `payouts.test.ts` | 131, 101 | `features/payouts/routes.ts`, `routes.test.ts` | 2 routes. |
| `modules/invoices.ts`, `invoices.test.ts` | 859, 369 | `features/invoices/routes.ts`, `routes.test.ts` | 7 routes, the biggest file. Over 400: a warning to leave. |
| `modules/anaf.ts` | 175 | `features/anaf/routes.ts` | 1 route. |
| `modules/ward.ts`, `ward.test.ts` | 109, 121 | `features/ward/routes.ts`, `routes.test.ts` | 4 routes, two of them redirects. |
| (new) | | `features/health/routes.ts` | `GET /health`, from `core/src/http/index.ts:38`. |
| (new) | | `config.ts` | The one reader of the environment (below). |

**The core package, `core/src/`.** It is a library with one consumer, `@my-olx/app`: all 43 imports use the root `"@my-olx/core"` (`grep -rhn 'from "@my-olx/core' app/src | sed 's/.*from //' | sort | uniq -c`), although its `package.json` lists eight subpath `exports`. How a plugin library fits the structure is decision 1. The map:

| Today | Lines | Target | Note |
|---|---|---|---|
| `errors/index.ts`, `errors.test.ts` | 111, 77 | `lib/api-error.ts` (`AppError`) and `plugins/errors.ts` (`registerErrorHandler`) | `AppError` has no Fastify import and stays a class (decision 6). The handler becomes a `fastify-plugin`. |
| `auth/index.ts`, `auth.test.ts` | 210, 171 | `lib/tokens.ts` (sign and verify) and `plugins/auth.ts` (`registerAuth`, which decorates `app.authenticate`) | The plugin takes `{ secret }` as typed options. |
| `http/index.ts`, `http.test.ts` | 41, 67 | `plugins/http.ts` (CORS, compression, multipart, the static uploads route) | Takes typed options (`corsOrigins`, `uploadsDir`, `logLevel`). The `Fastify()` call and the `/health` route leave it. |
| `config/index.ts`, `config.test.ts` | 48, 70 | `Config` and its reader move to `backend/app/src/config.ts`; `core` keeps no environment code | A library should not read the environment. |
| `email/index.ts`, `email.test.ts` | 322, 139 | `lib/email.ts` | Line 113 reads `FRONTEND_BASE_URL` at module load (`const BASE_URL = process.env…`), so it can't be injected. The templates take the base URL as an argument instead. |
| `storage/`, `db/` | | the same, under `lib/` and `db/` | |

### Every reader of the environment (21 sites in source, 14 in tests)

Command: `grep -rn "process.env" backend/app/src backend/core/src --include=*.ts | grep -v "\.test\.ts"`.

| Where | What | Afterwards |
|---|---|---|
| `core/src/config/index.ts:24-42` | 10 reads: `JWT_SECRET`, `PORT`, `DATABASE_PATH`, `UPLOADS_DIR`, `ASSETS_DIR`, `PUBLIC_BASE_URL`, `JWT_EXPIRY_SECONDS`, `CORS_ALLOWED_ORIGINS`, `HOST`, `FRONTEND_BASE_URL` | `loadConfig()` in `app/src/config.ts`, a zod schema that fails loudly |
| `core/src/http/index.ts:11` | `LOG_LEVEL` | a `config.logLevel` field |
| `core/src/email/index.ts:113` | `FRONTEND_BASE_URL` at module load | the config's `frontendBaseUrl`, passed in |
| `app/src/server.ts:10-11, 19` | `.env` file load (optional on purpose, since a container has none) and `NODE_ENV` | `loadEnvFile()` in `config.ts`; the reminder job becomes an option |
| `app/src/ward-client.ts:8` | `WARD_OIDC_*`, through `env = process.env` | the config's `ward` block, built once |
| `app/src/seed-samples.ts:157-159` | `DATABASE_PATH`, `UPLOADS_DIR`, `ASSETS_DIR`, each with its own `data/` default | `resolveDataPaths()` in `config.ts`, one rule shared with the server |
| `app/src/seed-dev.ts:18, 23` | `NODE_ENV` guard and `DATABASE_PATH` | decision 8 |
| `app/src/create-owner.ts:41, 50` | `OWNER_EMAIL`, `OWNER_PASSWORD`, `OWNER_NAME`, `DATABASE_PATH` | `loadOwnerConfig()` in `config.ts` |
| tests | set the environment | excepted |
| outside `backend/` | `frontend/vite.config.ts` (`PIATARO_BASE`) | out of scope: a build config |

**An env file that is optional is a quiet failure** (a Round 8 fact from the estate). `server.ts:10-11` skips `.env` when it is missing, and every other variable has a default (`PORT` 8080, `HOST` `0.0.0.0`, the data paths relative to the folder the API runs in). Only `JWT_SECRET` throws. The relative path `../../.env` is computed from `import.meta.url` of `app/src/server.ts` and `app/dist/server.js`, which is why the entry must stay at that depth. `config.ts` should log which file it loaded, or that none was found, and keep the defaults, because the container passes real variables.

### Every route: 71, by feature

Command: a script over `app/src/modules/*.ts` and `core/src/http/index.ts`, 2026-11-10 (the regular expression `app\.(get|post|put|patch|delete)(<…>)?\(` plus the path string). No route has a Fastify `schema`. 21 routes parse request input by hand with `.parse(request.…)` or `.safeParse(request.…)`:

- `listings.ts:98, 160, 193, 262, 355`;
- `orders.ts:120`;
- `bundles.ts:50`;
- `reviews.ts:83`;
- `images.ts:105`;
- `auth.ts:159, 216, 246, 293, 324`;
- `payouts.ts:109`;
- `messaging.ts:99, 291`;
- `invoices.ts:631, 711`;
- `users.ts:171, 379`.

`ward.ts:63` casts `request.query as { link?: string }` instead, which the regular-expression check in the skill misses. `request.params` is read in 38 places, mostly `request.params.id`, with no schema.

| Feature | Routes | Request schemas today | Response schema |
|---|---|---|---|
| health (1) | `GET /health` | none | new: `{ status: "ok" }` |
| auth (7) | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/email/verify`, `/auth/email/resend`, `/auth/phone/request-code`, `/auth/phone/verify` | `loginSchema`, `emailVerifySchema`, `emailResendSchema`, `phoneRequestCodeSchema`, `phoneVerifySchema` (inline, `auth.ts`) | new, from `AuthResponse` (`auth.ts:182`) and the small acks |
| users (7) | `GET`, `PATCH /users/me`, `GET /users/me/stats`, `PATCH /users/me/password`, `POST /users/me/avatar`, `GET /users/:id`, `GET /users/:id/listings` | inline `schema.parse` (`users.ts:171, 379`) | new, from `UserSummary`, `MyStatsResponse`, `PublicUserResponse`, `ListingCardResponse` |
| favorites (4) | `POST`, `DELETE /favorites/:listing_id`, `GET /me/favorites`, `GET /me/favorites/ids` | none | new, `ListingCardResponse[]` and the id list |
| listings (14) | `GET /listings`, `/me/listings`, `/listings/featured`, `/listings/suggest`, `/listings/:id`, `/listings/:id/related`, `/listings/:id/seller-phone`; `POST /listings`, `/:id/publish`, `/:id/renew`, `/:id/deactivate`, `/:id/activate`; `PATCH`, `DELETE /listings/:id` | `ListingFiltersSchema`, `MyListingsQuerySchema`, `CreateListingRequestSchema`, `SuggestQuerySchema`, `UpdateListingRequestSchema` | new, from `ListingsPageResponse` (`listings.ts:139, 178`) and the detail shape |
| images (3) | `POST /listings/:id/images`, `PATCH /listings/:id/images/reorder`, `DELETE /listings/:id/images/:image_id` | `reorderSchema` | new for the PATCH and DELETE; the POST is multipart (Q53) |
| assets (5) | `POST /listings/:id/assets`, `DELETE /listings/:id/assets/:asset_id`, `GET /listings/:id/assets`, `GET /listings/:id/download`, `GET /listings/:id/assets/:asset_id/download` | none | new for the DELETE and the list; the POST is multipart and the two GET downloads are streams (Q53) |
| bundles (2) | `POST`, `GET /listings/:id/bundle-items` | `SetBundleItemsSchema` | new |
| messaging (7) | `POST /listings/:id/conversations`, `GET /conversations`, `/conversations/:id`, `/conversations/:id/messages`, `POST /conversations/:id/messages`, `/conversations/:id/read`, `GET /me/unread-count` | `createConversationSchema`, `createMessageSchema` | new |
| orders (4) | `POST /orders`, `GET /orders`, `/orders/:id`, `POST /orders/:id/mark-paid` | `CreateOrderSchema` | new |
| reviews (3) | `POST`, `GET /listings/:id/reviews`, `DELETE /listings/:id/reviews/mine` | `SubmitReviewSchema` | new |
| payouts (2) | `GET /me/earnings`, `POST /me/payouts` | `PayoutRequestSchema` | new |
| invoices (7) | `GET`, `PUT /invoices/profile`, `GET`, `POST /invoices`, `GET /invoices/:id`; `GET /invoices/:id/pdf`, `/xml` | `ProfileUpsertSchema`, `CreateInvoiceSchema` | new for the JSON routes; the PDF and XML routes are binary (Q53) |
| anaf (1) | `GET /anaf/company/:cui` | none | new |
| ward (4) | `GET /auth/ward/status`, `POST /auth/ward/link-ticket`, `GET /auth/ward/start`, `/auth/ward/callback` | none (the cast at `ward.ts:63`) | new for the first two; `start` and `callback` are redirects |

**Stream, redirect and upload routes (9):** `POST /listings/:id/images`, `POST /listings/:id/assets`, `POST /users/me/avatar`, `GET /listings/:id/download`, `GET /listings/:id/assets/:asset_id/download` (`reply.send(createReadStream(...))`, `assets.ts:259, 306`), `GET /invoices/:id/pdf`, `/xml`, `GET /auth/ward/start`, `/callback` (`reply.redirect`, `ward.ts:68-107`). A response schema would serialise them as JSON. They are exempt (Q53), declare their request side, and are listed in `scripts/conventions.json` with the reason.

**A declared status becomes a 500** (an estate fact). A response schema that declares a status the handler does not send itself, such as a 401 from the `authenticate` preHandler, makes that reply a serialization error. Declare only the statuses each handler sends (200, 201, 204 and the 404 or 409 that handlers return with `reply.code(...)`).

### The error plugin

`core/src/plugins/errors.ts`, a `fastify-plugin`, registered first. **It keeps the body `{ error: "<message>" }`**, because the frontend reads it: `.error` at `frontend/src/app/modules/orders/components/BuyButton.tsx:59` and `frontend/src/app/modules/reviews/components/ReviewsSection.tsx:160`, and only the status elsewhere (`frontend/src/core/lib/axios.ts:17`, `PhoneVerifyModal.tsx:41`, `CreateListingWizard.tsx:83`). Three places also read `.message`, which the API never sends (`PasswordSection.tsx:33`, `ContactSellerModal.tsx:41`, `BuyButton.tsx:58`), so those branches are dead and fall through to the generic text. That is a frontend finding, not part of this brief. The handler, in order:

1. `AppError` → its status and message.
2. `hasZodFastifySchemaValidationErrors(error)` → 422, the first issue's message, as today (the status stays 422, not 400, because the frontend and the tests expect it).
3. A `ZodError` raised in a handler → 422, from `error.issues[0]`.
4. `isResponseSerializationError(error)` → 500 `internal error`, logged with the method and URL, never shown.
5. **A 4xx that Fastify raised** (bad JSON, an oversized body, an unsupported media type) → its own status. Today it falls through to the last branch and answers 500, because the handler checks no `statusCode` (`core/src/errors/index.ts:80-110`). Step 3 adds a test for it, and the change is a deliberate fix.
6. Anything else → 500, logged, no detail to the client.

### The entry, and timeouts

`server.ts` calls `loadEnvFile()` and `loadConfig()`, runs `prepareStorage(config)`, builds the app with `buildApp(config, { logger, server })`, wires `close-with-grace`, and listens. `buildApp` passes `server` to `Fastify()`. The defaults:

- `connectionTimeout: 10_000`;
- `keepAliveTimeout: 125_000`, above Caddy's default two-minute idle timeout to its upstreams;
- `trustProxy`: loopback, because Caddy fronts the container;
- **`requestTimeout` stays at Fastify's default of `0`.** An estate fact: a request timeout cuts long responses and uploads. This API accepts 500 MB multipart uploads (`core/src/http/index.ts:148`, `fileSize`) and streams downloads, so a 30 s limit would cut a slow upload. If the owner wants one, it must be per route.

### Test impact

- 18 test files, 160 tests, on vitest 4.1.12, 7 of them calling `inject()`. Baseline: all pass once `core` is built (and, since brief 11, `pretest` builds it).
- Moved tests need their relative imports updated. No test changes an assertion, apart from the zod 4 messages, which the before and after comparison names.
- New tests:
  - a validation failure answers 422 with the first issue's message, and a malformed body with no session answers 422, not 401 (decision 12);
  - bad JSON answers 400, not 500;
  - an extra field on a store row is stripped from a reply;
  - a reply that fails its response schema is a 500 `internal error` with no detail;
  - the health route;
  - a read of an unset `JWT_SECRET` fails at `loadConfig()` with a clear message.

## Decisions

Items marked "decided" are final. The rest are defaults this brief builds.

1. **How the plugin library fits the structure.** Default: `backend/core` stays a separate workspace package, now organised as the skill's `plugins/` and `lib/`, and it knows nothing about a listing or an order:
   - **`plugins/`**: `errors`, `auth` and `http`, each a `fastify-plugin` with typed options, exported by name and registered explicitly by `app/src/app.ts`. No autoload, and no decorator except the one `authenticate` preHandler it already adds (Q56: keep, and list it).
   - **`lib/`**: pure code with no Fastify import (`AppError`, tokens, email, storage, db).
   - **No environment reading** in `core`. `app/src/config.ts` is the one reader and passes values in.

   The alternative is to fold `core` into `app` as `plugins/` and `lib/`, which removes the `core/dist` build step that makes a fresh `npm test` fail and removes the Dockerfile's second workspace. The package boundary earns nothing here, since there is one consumer and none of the eight subpath `exports` is used, but the owner chose the two-package layout when they built it and the corpus calls `core` "domain-agnostic engine". *Question for the owner: keep `core`, or fold it in?*
2. **Typed plugin options and explicit registration** (decided 2026-11-10, technical call, Q24). Keep `AppContext` (the skill's `FeatureContext`) as each feature plugin's options, typed as `FastifyPluginAsyncZod<AppContext>`, and keep explicit registration by name. No autoload, and no decorator as a test seam (tests pass dependencies as plugin options).
3. **`backend/app/src/features/<name>/`** (decided 2026-11-10, technical call, Q23). As in the move map.
4. **A response schema on every JSON route** (decided 2026-11-10, technical call, Q25, Q53 and Q55). Written as transform-free output schemas in each feature's `schemas.ts`. There is no `shared/` package and the frontend keeps its own types, so a schema lives in its feature folder (Q55). Pass-through JSON, if any, uses a loose object. The 9 stream, redirect and upload routes are exempt (Q53), each with an entry in `scripts/conventions.json`.
5. **The error body** (decided 2026-11-10, technical call, Q43). One error handler, keeping the repo's body `{ error: string }` and status 422 for validation. It **passes Fastify's own 4xx through**: today bad JSON answers 500, which the plugin's branch 5 and its test fix on purpose. It never echoes a thrown message to the client.
6. **`AppError` and parameter properties** (decided 2026-11-10, technical call, Q56). One `AppError` class stays, with its static constructors, since that is how the handler finds it and 136 call sites use them. `erasableSyntaxOnly` (brief 11) removed the parameter properties from the seven classes. The repository classes (five of them) stay classes with a declared field each, and the house prefers factories returning an interface: converting them is a follow-up, not this brief. The one `authenticate` decorator stays, listed in `scripts/conventions.json`, and is not a test seam.
7. **The test helper's name.** Default: keep `startTestApp` in `testing/test-app.ts`. Renaming to the skill's `buildTestApp` touches the 6 files that import it (`grep -rln startTestApp backend/app/src backend/core/src`) for nothing. Record it in `scripts/conventions.json` if the checker looks for the name.
8. **`NODE_ENV` in `seed-dev.ts:18`.** It guards a script that makes a known-password account, so it must not be removed. Default: it moves into `config.ts` as `loadDevSeedConfig()`, the one place allowed to read it, and `scripts/conventions.json` records the exception for the checker's `NODE_ENV` rule. The alternative is a required `ALLOW_DEV_SEED=1`, which changes the documented dev workflow.
9. **Fastify 5.12.8.** Default: not in this brief. The bump goes with the estate's next one.
10. **Inline SQL in the handlers.** 129 references to `ctx.db` or Kysely sit in `modules/*.ts`, so most handlers hold their queries (rule 7: SQL belongs in `store.ts`). Default: not extracted here; rule 7 and rule 11 report warnings for it, and the count goes in the outcome note as the next brief's input. Only the five existing repository classes move.
11. **Logging.** Default: JSON as today, no `pino-pretty`. The container reads JSON.
12. **Validation before authorisation** (decided 2026-11-10, technical call, Q52). Fastify validates before the `authenticate` preHandler runs, and that order is accepted. So a request with a malformed body and no session answers 422, where the hand-parsing handlers answered 401 first. That is one named behaviour change: it goes in the before and after comparison, and a test pins it.
13. **Test runner and roots** (decided 2026-11-10, technical call, Q27). vitest stays, and tests stay co-located as today. The checkers read this repo's roots from `scripts/conventions.json`: server `backend/app/src` and `backend/core/src`.

## Files you OWN

- `backend/app/src/**` and `backend/core/src/**`: the moves, the plugins, the schemas wired in.
- `backend/package.json`, `backend/core/package.json`, `backend/app/package.json` (scripts, the zod move, the new dependencies pinned), and `backend/package-lock.json`.
- `backend/.env.example`: add `ASSETS_DIR`, which `config.ts` reads and the file omits, and `LOG_LEVEL` notes if needed.
- `infrastructure/Dockerfile`: only if a path changes (expect none; the `CMD` stays `app/dist/server.js`).
- `.dependency-cruiser.cjs` (new, from the skill's preset) and the knip config, as brief 11 wired them.
- `backend/eslint.config.js`: `n/no-process-env`, from warning to error.
- `scripts/conventions.json`: the exceptions from decisions 7 and 8 and the 9 stream, redirect and upload routes.
- `.claude/rules/server.md`: the structure lines.
- Docs and corpus:
  - the root `CLAUDE.md` (the Architecture section, lines 58-76, and the Commands) and `docs/architecture.md:65-68` (links to `backend/app/src/modules/` and `backend/core/src/`);
  - [wiki/stack.md](../../wiki/stack.md) (the layered layout at line 24, and the new dependencies);
  - [wiki/invoicing.md](../../wiki/invoicing.md) (lines 14 and 30), [wiki/bundles.md](../../wiki/bundles.md) (lines 21 and 26), [wiki/reviews-ratings.md](../../wiki/reviews-ratings.md) (lines 25 and 27), [wiki/digital-asset-commerce.md](../../wiki/digital-asset-commerce.md) (lines 35 and 40), [wiki/notifications.md](../../wiki/notifications.md) (lines 12, 13, 20), [wiki/expiry-reminders.md](../../wiki/expiry-reminders.md) (line 19), [wiki/accounts-and-profiles.md](../../wiki/accounts-and-profiles.md) (line 58), [wiki/business-rules.md](../../wiki/business-rules.md) (line 38);
  - `docs/getting-started.md` (line 149, which names `create-server.ts`);
  - [wiki/decisions.md](../../wiki/decisions.md), [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).

## Files you must NOT touch

- `frontend/`. A response schema that drops a field the frontend reads is a finding: fix the schema, not the frontend.
- `backend/app/vendor/`: the vendored Ward library, generated.
- `backend/migrations/` and the database schema.
- The deploy beyond the `Dockerfile` if a path changes. vps-deploy's `piataro` stack runs the image's `CMD`, which does not change.
- Behaviour: status codes, error messages and every route's JSON, apart from the zod 4 default messages (named in the outcome note), the Fastify 4xx fix (step 3), the 422-before-401 order of decision 12, and fields the comparison shows were leaks.

## What to do

Follow `migrating-a-server.md`. One commit per step. After each, `npm run check` (from the repo root) and `npm run build` in `backend/` pass, and `npm start` serves `GET /health`.

1. **Before.**
   - Run `check-structure` strict and record its counts by rule.
   - Create a scratch `DATA_DIR` with `npm run seed:dev` and `npm run seed:samples`. Save the JSON of every JSON route in the table, with a fixed query where one is needed, signed in as the seeded owner. Include a listing with bundle items, a conversation with messages, and a paid order.
   - Save the validation messages the tests and the frontend may show: one failing request per input schema, with its body.
   - Record `npm test` (18 files, 160 tests).
2. **zod 4.** Move `zod` to 4.6.7 in both packages, with one copy in the lockfile (add a root `overrides` entry if npm keeps two). Fix the constructs in the table above: `.errors` to `.issues`, the two `.email()` and three `.url()`, the eight `.default(` sites one by one, and the nine coerce and preprocess sites against their inferred types. Every test passes unchanged, or each changed message is listed. Its own commit, before any provider work.
3. **`config.ts`, the entry, and the error plugin.**
   - `app/src/config.ts` with `loadEnvFile()`, `loadConfig()`, `resolveDataPaths()`, `loadOwnerConfig()` and `loadDevSeedConfig()`. The seed scripts and `create-owner.ts` use them. `core` loses its environment reads.
   - Split `create-server.ts` into `prepareStorage()` and `app.ts` (`buildApp`). Fix the migrations path, which is computed from the file's folder (`create-server.ts:79-80`), so it survives the move. The reminder job and the `NODE_ENV` gate become a `buildApp` option.
   - `close-with-grace`, the timeouts and `trustProxy` in `server.ts`.
   - The `lib/api-error.ts` and `plugins/errors.ts` split, with the 4xx fix and its test.
   - `n/no-process-env` is now an error.
4. **Feature folders.** `git mv` file by file per the map, so history follows. Add each `index.ts`, and break the one cycle to avoid: `orders` must not import `reviews` or `assets`, and reviews and assets import orders only through `features/orders/index.ts`. Move `core` into `plugins/` and `lib/`, and register the three plugins explicitly in `app.ts` in this order: errors, http, auth. Add `.dependency-cruiser.cjs` (rules 5 and 7). Check that a deliberate import of `features/orders/service.js` from `features/reviews/` fails it.
5. **The type provider and the schemas, one feature per commit.** Order: health, anaf, payouts, bundles, reviews, favorites, orders, messaging, images, assets, users, auth, invoices, listings, ward. Each commit:
   - declares params, querystring, body and response, and removes that feature's `.parse(request.…)` calls (and the `ward.ts:63` cast);
   - types the plugin as `FastifyPluginAsyncZod<AppContext>`;
   - writes a transform-free output schema, never reusing an input schema;
   - declares only the statuses the handler sends;
   - adds the new tests that apply.

   Keep `idParamsSchema` a plain `{ id: string }` if a test expects a non-numeric id to answer 404, as the current handlers do.
6. **After.** Save the same JSON again and diff it against step 1's. A field that disappeared is a leak (keep it dropped, list it) or a missing schema field (add it). Diff the validation messages too. Put the summary in the `log.md` entry.
7. **Strict.** Drop `check-structure`'s `--warn-only`. dependency-cruiser joins `check:conventions`.
8. **Corpus.**
   - [wiki/decisions.md](../../wiki/decisions.md): an entry adopting the structure and the plugin-library layout, with what was rejected (autoload, TypeBox, the layer split) and why.
   - Update the pages listed under Files you OWN, `.claude/rules/server.md`, [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).
   - Run `bash corpus/lint.sh` until it is clean.

## Acceptance

- [ ] `check-structure` passes **strict**, with each exception in `scripts/conventions.json` and its reason. Its counts before and after are in the outcome note, for the skills library's brief 16 table.
- [ ] `grep -rnE "\.(safeParse|parse)\(request\." backend/app/src` prints nothing, and `grep -n "request.query as" backend/app/src/features/ward/routes.ts` prints nothing. Every JSON route in the table has a `schema` with a `response`.
- [ ] `grep -rn "process\.env" backend/app/src backend/core/src --include=*.ts | grep -v "\.test\.ts"` prints only `backend/app/src/config.ts`, and `n/no-process-env` is an error.
- [ ] `grep -rn "NODE_ENV" backend/app/src backend/core/src --include=*.ts | grep -v "\.test\.ts"` prints only `config.ts` (decision 8).
- [ ] The new tests pass, along with every existing test unchanged apart from listed zod 4 messages: `cd backend && npm test` reports 18 files and at least 160 tests plus the new ones.
- [ ] With `core/dist` and `app/dist` deleted, `npm test` in `backend/` still passes (the `pretest` build).
- [ ] The before and after JSON comparison is in `log.md`, with every dropped field named.
- [ ] `npm run build` writes `backend/app/dist/server.js`, and `docker build -f infrastructure/Dockerfile .` succeeds. The container answers its health check (`infrastructure/Dockerfile:111`), and `docker run` with no `JWT_SECRET` exits with the `loadConfig()` message.
- [ ] A 500 MB-class multipart upload is not cut by a request timeout: `grep -n "requestTimeout" backend/app/src/server.ts backend/app/src/app.ts` prints nothing, or a per-route value.
- [ ] dependency-cruiser fails on a deliberate cross-feature import and passes clean.
- [ ] `npm run check` passes at the repo root, and `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 11 turned `erasableSyntaxOnly` on, so the seven classes with parameter properties are already rewritten when this brief moves them.
- The skills library should hear about this repo's two additions to the estate facts: a shared plugin library with a single consumer, and an error handler that answers 500 to Fastify's own 4xx.
- The owner's deploy needs nothing: the `CMD`, the port and the data folder do not change. If the owner chooses to fold `core` into `app` (decision 1), the Dockerfile's `COPY backend/core` lines (`infrastructure/Dockerfile:39, 47, 58, 85-86`) go with it, and that is part of this brief.
