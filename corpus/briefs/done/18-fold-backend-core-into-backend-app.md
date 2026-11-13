# Task 18: Fold backend/core into backend/app

**Depends on:** brief 13 (the server in the code structure; its board question is answered here), brief 17 (the knip and lint blocks are as they are now), the todo [fold-backend-core-into-backend-app](../../todos/fold-backend-core-into-backend-app.md), and the owner's skills library's `code-structure` skill (where `plugins/`, `lib/` and `db/` go in a server).

## Context

The owner's answer of 2026-11-13 to brief 13's board question: fold the separate `@my-olx/core` package into `@my-olx/app`. That matches the estate's other Fastify servers (one package, `src/` with `plugins/`, `lib/` and `db/` beside `features/`), and it drops the `core/dist` build step and the Dockerfile's second workspace. No behaviour change.

## Files you OWN

- `backend/core/` (moved out and deleted), `backend/app/src/**`, `backend/app/package.json`, `backend/app/tsconfig.json`
- `backend/package.json`, `backend/package-lock.json`, `backend/knip.config.js`, `backend/eslint.config.js`, `backend/vitest.config.ts`
- `infrastructure/Dockerfile`, `.dependency-cruiser.cjs`, `scripts/conventions.json`
- `CLAUDE.md`, `README.md`, `docs/`, `.claude/rules/`, and the corpus wiki pages that name `backend/core`
- `corpus/` bookkeeping for this brief

## Files you must NOT touch

Migrations, `backend/app/vendor/`, `vendor/`, the frontend, deploy files other than the Dockerfile, behaviour, any dependency version, any new package.

## What to do

1. Record the test count of `npm run check` at the root before moving anything.
2. `git mv` `backend/core/src` under `backend/app/src`: `plugins/` (new), `lib/` and `db/` merged with the existing folders (no file overwritten), the barrel `index.ts` removed.
3. Rewrite every `@my-olx/core` import as a relative path with the `.js` suffix.
4. Move core's dependencies into `app/package.json` at the same exact versions, drop `@my-olx/core` from it, delete `core/package.json` and `core/tsconfig.json`, run `npm install` in `backend/`.
5. `backend/package.json`: the `core` workspace and every core build prefix go; `typecheck` becomes `tsc -b app`.
6. `infrastructure/Dockerfile`: the core manifest copies, the core build and the `core/dist` copy go; the image still holds `app/dist`, the migrations and the production dependencies, and the `find ./app/dist ...` strip stays.
7. The knip, dependency-cruiser and ESLint configs and `scripts/conventions.json`: drop the entries for `core/`, keep every rule passing (the `pino` and `@fastify/multipart` knip notes go or move as the lockfile allows).
8. The docs that name `backend/core`.

## Acceptance

- `npm run check` at the root passes with the same test count as before; `npm run build` in `backend/` and `bash corpus/lint.sh` exit 0.
- `grep -rn "@my-olx/core\|backend/core"` outside node_modules, dist, `corpus/briefs/done` and `log.md` is empty.
- No docker build (the owner's step).
- Owner step: deploy with vps-deploy's `piataro` stack; briefs 10 to 17 also wait for phase `all`, which ships this too.

## Outcome (2026-11-13)

Built. Commit 6e6c09f. `npm run check` before and after: 193 backend and 107 frontend tests, exit 0 both times.

- `core/src` moved with `git mv` into `app/src/plugins/` (new), `lib/` and `db/` (merged; no name clashed). The barrel `index.ts` is gone. 35 files' `@my-olx/core` imports became relative `.js` imports (by a script keyed on each export's file); a few files now have two imports from one module.
- Core's 11 dependencies and its devDependency moved into `app/package.json` at the same versions; `@my-olx/core` is gone from the lockfile, which changed only by the workspace entries (`npm install` in `backend/`). `backend/package.json` has one workspace, no core build prefixes, `typecheck` is `tsc -b app`.
- `infrastructure/Dockerfile`: the core manifest copies, the core copy and the `core/dist` copy are gone; the `find ./app/dist` strip stays. `.dockerignore`, `backend/eslint.config.js`, `knip.config.js` (the `@fastify/multipart` note went, since app lists it now; `pino` moved to the app block), `scripts/conventions.json` (the rule-2 exception for core went), `package.json`'s depcruise call, the docs, `.claude/rules/server.md` and the wiki follow.
- `no-non-null-assertion` warnings (19) and rule-11 size warnings (6) are the same as before.
- Not run: a docker build (the owner's step with the deploy), a browser walk (nothing visible changes).
- The grep for `@my-olx/core` and `backend/core` finds only this brief's predecessor todo, which describes the change.
- Owner step: deploy `piataro`, phase `server` for this alone; briefs 10 to 17 still wait for phase `all`, which ships this too.
