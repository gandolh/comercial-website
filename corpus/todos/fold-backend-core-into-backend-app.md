# Fold backend/core into backend/app

> Promoted to [brief 18](../briefs/todo/18-fold-backend-core-into-backend-app.md) on 2026-11-13.

The owner's answer to brief 13's board question (2026-11-13): fold the separate
`@my-olx/core` package into `@my-olx/app`. That matches the estate's other
Fastify servers (one package, `src/` with `plugins/`, `lib/` and `db/` beside
`features/`), and it drops the `core/dist` build step and the Dockerfile's
second workspace.

What it touches:

- `backend/core/src/` (18 files: `db/`, `lib/`, `plugins/`, `index.ts`) moves
  under `backend/app/src/`, into the folders the code-structure skill names.
  Where a target folder already exists, merge it, never overwrite a file.
- The 35 files under `backend/app/src/` that import `@my-olx/core` import the
  moved modules by relative path, with the `.js` suffix the repo uses. The
  barrel `core/src/index.ts` goes; nothing re-exports it.
- `core/package.json`'s dependencies move into `app/package.json` at the same
  exact versions (no version changes, no new packages), and the lockfile is
  regenerated with `npm install` in `backend/`.
- `backend/package.json`: the `core` workspace and every
  `npm run build --workspace @my-olx/core &&` prefix go, and `typecheck`
  becomes `tsc -b app`.
- `infrastructure/Dockerfile`: the core manifest copies, the core build and the
  `core/dist` copy go. The image must still hold `app/dist`, the migrations and
  the production dependencies, and `find ./app/dist ...` keeps stripping the
  test and seed files.
- `scripts/conventions.json`, `backend/knip.config.js`, the dependency-cruiser
  config and the ESLint config: drop the entries for `core/` and keep every
  rule passing.
- The docs that name `backend/core` (`CLAUDE.md`, `docs/`, the corpus wiki).

Done when `npm run check` passes with the same test count as before, the
backend builds with one `tsc -b`, and no file in the repo still names
`@my-olx/core` or `backend/core`. A docker build is the owner's step (local
Docker builds aren't run here). Deploy: the `piataro` stack's server phase.
