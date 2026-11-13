# Task 17: The house-style warnings, to zero where it is mechanical

**Depends on:** brief 11 (left them as warnings), brief 13 (the typed stores and schemas), brief 16 (the knip ignore list is already cleared) and the todo [house-style-warnings](../../todos/house-style-warnings.md). The owner's answer (2026-11-13, answer 4): do this after the password form, re-measured.

## Context

The todo's counts are old. Re-measured on 2026-11-13 (`npx eslint . -f json` in each project): `no-explicit-any` 35 in the backend (34 in source: `users/routes.ts` 17, `listings-store.ts` 6, `favorites/routes.ts` 4, `images/routes.ts` 2, `messaging/routes.ts` 2, one each in `assets`, `invoices`, `orders`; 1 in `reviews-store.test.ts`), `no-console` 6 (`reminders/service.ts` 4, `assets/routes.ts` 1, `messaging/routes.ts` 1), `no-non-null-assertion` 19 (not in the todo; mostly tests), and in the frontend `no-misused-promises` 49, `react-hooks/exhaustive-deps` 4 and `incompatible-library` 5. The `n/no-process-env` bullet is already done (commit 8cd963c). Brief 16 removes the knip file exceptions; the three dependency exceptions (`pino`, `@tanstack/router-devtools`, `@fastify/multipart`) stay.

## Files you OWN

- the files the measurement names, under `backend/app/src/` and `frontend/src/`
- `backend/eslint.config.js`, `frontend/eslint.config.js` (the warning blocks come off as each rule reaches zero)
- `backend/knip.config.js`, `frontend/knip.config.js`, and `backend/core/package.json`, `frontend/package.json` only to drop an unused dependency (and not their lockfiles: report it as an owner step if one must change)
- `corpus/` bookkeeping for this brief

## Files you must NOT touch

Migrations, `backend/core`'s source, `backend/app/vendor/`, `vendor/`, deploy files, lockfiles, behaviour: no reply or screen changes.

## What to do

1. Re-measure first and put the table in the outcome note.
2. `no-misused-promises` (frontend): wrap each async handler as `() => void handler()` (a form's `handleSubmit(onSubmit)` the same way). Then delete the warning block; the rule is an error again.
3. `no-explicit-any` (backend): type each from the Kysely row types or the route schemas (`z.infer`). Delete the block when it reaches zero. A site that cannot be typed without a design call stays as a line-level `eslint-disable-next-line` with its reason, and is listed.
4. `no-console`: the reminders service and the two routes log through the app's logger (`request.log` in a route; the context's logger in the service, passed in where it is built). Delete the block.
5. `exhaustive-deps` and `incompatible-library`: fix each the way the rule asks when it is mechanical; the react-hook-form `watch()` sites may stay warnings with a one-line reason each (the compiler cannot memoize them), listed in the note.
6. `no-non-null-assertion` in tests: replace with a checked value (`expect(x).toBeDefined()` then a narrowing guard) where it is short; otherwise leave and list.
7. Knip: `@fastify/multipart` (list it in app's package.json only if the lockfile need not change, else leave), `pino` and `@tanstack/router-devtools` are removed from their `package.json` only if it needs no lockfile change; otherwise leave them and list them as owner steps.
8. Update `CLAUDE.md`'s "Several lint rules are warnings" bullet and the log, mark the todo promoted.

## Acceptance

- `npm run check` at the root exits 0 and `bash corpus/lint.sh` exits 0.
- Each rule that reached zero has no config block; the rest are listed with a reason and a count.
- No behaviour change: the backend tests and frontend tests pass untouched except where a type changed.
- Owner step, if shipped code changed: deploy with vps-deploy's `piataro` stack, phase `all`.

## Outcome (2026-11-13)

Built. Commit d89617a. Re-measured first (2026-11-13): backend `no-explicit-any` 35, `no-console` 6, `no-non-null-assertion` 19; frontend `no-misused-promises` 49, `exhaustive-deps` 4, `incompatible-library` 5.

- **`no-misused-promises` (49):** every async handler wrapped as `() => void handler()` (a form's `handleSubmit(onSubmit)` as `(e) => void handleSubmit(onSubmit)(e)`). The warning block is gone; the rule is an error.
- **`no-explicit-any` (35):** typed from the Kysely table types (`Selectable`, `Updateable`, `SelectQueryBuilder`), `MultipartValue`, `Config` and `string | Date`. `countQuery` in `listings-store.ts` uses `$if` for the verified-seller join. Three reads that took `executeTakeFirst()` and passed the row to a mapper now use `executeTakeFirstOrThrow()` (invoice and order creation, mark-paid). The block is gone.
- **`no-console` (6):** `AppContext` has `log` (the app's logger); the reminder job, the first-download email and the new-message email log through it (the reminder log no longer prints the owner's email). The block is gone.
- **Hook warnings (9):** `watch()` became `useWatch` in five forms; `useListingImages` returns its object without a `useMemo` that never held; `licenseLabels` is a module constant; `EmailVerifyPage` depends on the stable `mutate`; `PhoneVerifyModal` reads its handler through `useEffectEvent`.
- **Left:** `no-non-null-assertion` in 19 backend test lines (not in the todo; they are warnings as the house sets them). knip's three dependency exceptions (`pino`, `@tanstack/router-devtools`, `@fastify/multipart`): dropping or listing them changes a lockfile, so they stay (owner step for a later brief).
- `CLAUDE.md`'s warning bullet is updated. `npm run check` and `bash corpus/lint.sh` exit 0.
- Not walked in a browser: the phone-verify auto-submit and the email-verify page (no spec covers them).
- Owner step: deploy phase `all`, with brief 16; briefs 10 to 15 also wait.
