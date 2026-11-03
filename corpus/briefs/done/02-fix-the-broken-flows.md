# Task 02 — Fix the flows found broken on 2026-10-16, and the stale docs

## Context
The readme-docs run of 2026-10-16 ([log.md](../../log.md)) found these in the current build, none fixed.
A demo has to work end to end, so they come first.

## Files you OWN
`frontend/src/app/modules/create-listing/`, `frontend/src/app/modules/dashboard/`, the listing page's
safety tip, `backend/app/src/modules/` (the new `GET /me/listings`), `backend/core/src/errors/`,
`backend/core/src/config/`, `.gitignore`, the root `CLAUDE.md`, `backend/app/CONTRACT.md`,
`docs/getting-started.md`.

## What to do
1. **Add-listing page:** `/adauga-anunt` never loads for a new listing. `useDraft(null)` is a disabled
   query that stays `pending` in React Query v5, and the page waits on it. Treat "no draft id" as ready.
2. **"Anunțurile mele":** the dashboard calls `GET /me/listings`, which the API lacks. Add it
   (the signed-in user's listings, with the same filters and paging the dashboard sends), with tests.
3. **Bad token → 401:** a missing or invalid bearer token returns 500. Auth throws a plain `Error` with
   `statusCode` 401, and `core/src/errors/index.ts` only honours `AppError`. Throw or map an `AppError`.
   Add a test.
4. **Safety tip:** the listing page's safety tip is physical-goods copy (meeting a seller, checking the
   item). Rewrite it for digital files, in Romanian.
5. **Config:** nothing reads `backend/.env`; load it at startup (Node's `--env-file` or `process.loadEnvFile`,
   no new dependency), and document `JWT_SECRET`. Make `npm run dev` work on a fresh clone without a
   prior `npm run build` (or document the one command that does). Gitignore `backend/app/data/`.
6. **Stale docs:** the root `CLAUDE.md` names React Router (it is TanStack Router), `backend/data`
   (the data is under `backend/app/data`), the physical-goods API and a 9-category list.
   `backend/app/CONTRACT.md` is the pre-pivot API: rewrite it from the routes, or delete it and point
   at the routes. Verify each claim against the code.

## Acceptance
- A new listing can be created from `/adauga-anunt` in the browser; "Anunțurile mele" lists it.
- A request with a bad token gets 401; tests for it and for `GET /me/listings` pass.
- `npm run build` and `npm test` in `backend/`, `npm run build` and `npm run lint` in `frontend/` pass.

---

**Outcome (2026-11-03).** Done (`6d87ef4`), with one more fault found on the way.
- **The draft fault:** past the endless wait, the wizard could never create its draft. `POST /listings`
  required a 5-character title and a 10-character description from the empty inactive draft the wizard
  sends. A draft may now start empty, and publishing still checks both and the assets.
- **The rest:**
  - `GET /me/listings` filters live, switched off or expired, paged, in `GET /listings`'s shape, and the
    dashboard maps it.
  - The auth hook throws `AppError.unauthorized()`.
  - The safety tip is about paying through the platform, licences and scanning archives.
  - `backend/.env` is read when present; `npm run dev` builds core first.
  - The root CLAUDE.md is rewritten and `CONTRACT.md` removed.
- **Checked in the browser** (the API on a scratch database, the demo account): picked a category, filled
  the details, uploaded a file, set 49 RON, ticked the terms and published. The listing showed in
  "Anunțurile mele".
- **Tests:** backend 161 → 168 (the owner's-listings query, the 401 behind the error handler, the draft
  schema).
- **Lint:** the frontend lint still reports the 9 errors it reported before this brief, all React-hooks
  rules in files this brief does not touch.
