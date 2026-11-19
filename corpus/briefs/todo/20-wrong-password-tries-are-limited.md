# Task 20: Wrong password tries are limited

**Depends on:** nothing. **Runs after:** brief 19 (the Ward link ticket takes the password).

**Before you start:** run `brief-board guide` ([CLAUDE.md](../../../CLAUDE.md)).

Promoted 2026-11-19 from the todo [password-checks-have-no-attempt-limit](../../todos/password-checks-have-no-attempt-limit.md), in the owner's grill: "Limit all three".

## Context

Three routes check the owner account's local password: `POST /auth/login` (`features/auth/routes.ts`), `PATCH /users/me/password` (`features/users/routes.ts`) and `POST /auth/ward/link-ticket` (`features/ward/routes.ts`). None limits wrong tries. The site is public; the one account controls everything on it. `AppError.rateLimit()` (`lib/api-error.ts`) exists for the weekly listings limit; there is no request limiter.

## Decisions

- **One limiter for the three routes**, in memory (the API is one process; a restart clears it, as the Ward flows already do), in `lib/` (no Fastify) with a thin use in each route.
- **Per address:** 10 wrong tries in 15 minutes. **Per account:** 20 wrong tries in an hour, across addresses. A wrong try is a wrong password, or (login only) an unknown email, which counts per address only.
- **While over either limit the route refuses even the right password**, with 429 and a `Retry-After` header in seconds (the existing rate-limit error, plus the header). A right password under the limits clears that address's count.
- The address is `request.ip` (Fastify's `trustProxy` is already `config.trustedProxies`).
- **The frontend** shows, on the sign-in page, the change-password form and the Ward section: "Prea multe încercări. Încearcă din nou peste N minute." (N from `Retry-After`, rounded up; "peste un minut" under 60 s).

## Files you OWN

- `backend/app/src/lib/` (the limiter and its test), the three routes above and their tests.
- `frontend/src/app/modules/auth/`, `frontend/src/app/modules/settings/components/` (the three messages).
- Corpus: `corpus/wiki/accounts-and-profiles.md`, `corpus/wiki/status.md`, `corpus/log.md`.

## Files you must NOT touch

`backend/app/vendor/`, `vendor/`, migrations, other features, lockfiles, deploy files.

## What to do

1. The limiter with fake-clock tests (window edges, the per-account cap across addresses, a success clearing the address).
2. Route tests: 10 wrong logins then the right one answers 429 with `Retry-After`; the same for change password and the link ticket; after the window the right password works; different addresses count apart; each fails on today's code.
3. The three frontend messages; one Playwright check (stub a 429 with `Retry-After: 300`: "peste 5 minute").

## Acceptance

- [ ] The tests above pass; `npm run check` exit 0; `bash corpus/lint.sh` exit 0.
- [ ] End move `ready_for_deploy`, owner step: vps-deploy's `piataro` stack, phase `all`.
