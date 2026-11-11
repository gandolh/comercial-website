---
paths:
  - "backend/**/src/**"
---

# The backend (`backend/core/src`, `backend/app/src`)

- Read the `code-structure` skill before you add or move a route, a plugin or a module.
- `@my-olx/core` is a plugin library: auth, config, db, email, errors, http, storage. It knows nothing about
  listings or orders. Domain code goes in `@my-olx/app`.
- Errors are `AppError`, which the one handler in `core/src/errors` maps to a status and `{ error }`. Route
  modules throw it for a failure.
- A protected handler reads the signed-in user with `requireUserId(request)` (`app/src/auth-user.ts`), never
  `request.userId!`.
- The API never serves a paid file from the public uploads folder: paid files live under `ASSETS_DIR`.
- Dates and money rules are in [corpus/wiki/business-rules.md](../../corpus/wiki/business-rules.md).
- `core/src/config/index.ts` is the env reader. Several files still read `process.env` themselves (an ESLint
  warning for now); add no new reader.
- No `console` outside the CLIs (`seed-dev`, `seed-samples`, `create-owner`, `migrate`, `server`,
  `create-server`). Log through Fastify's logger.
- `backend/app/vendor/` is Ward's generated library. Never edit it.
- `npm run check:conventions` runs `check-structure` over these folders, `--warn-only` for now.
