---
summary: Dated snapshot (2026-11-11) — PiațăRo as a deployed demo; briefs 01-11 are done (one line each), briefs 10 and 11 wait for a deploy, and the owner's steps.
updated: 2026-11-11
---

# Status — 2026-11-11

Built in April-May 2026 and paused since 2026-05-29; README and docs added 2026-10-16; security
updates 2026-10-23. On 2026-11-03 the owner decided it becomes a deployed demo
([decisions.md](decisions.md)), and briefs 02-09 made it one. Not deployed yet: the steps are below.

## Briefs

- 01 (done): the corpus moved to the corpus-flow layout.
- 02 (done): the add-listing flow, `GET /me/listings`, 401 on a bad token, the safety tip, `.env`, the docs.
- 03 (done): no seeded accounts outside `npm run seed:dev`; paid files in `ASSETS_DIR`, off `/uploads/`.
- 04 (done): Stripe and the payment webhook removed; payments are simulated only.
- 05 (done): sign-up closed, `npm run create-owner`, Sign in with Ward linked by subject from Settings.
- 06 (done): the simulated payout ledger at 2.5%, the Câștiguri section; the dashboard loads again.
- 07 (done): `npm run seed:samples`, nine sample listings that never expire.
- 08 (done): `PIATARO_BASE`, the frontend at `/piataro/` and the API at `/piataro-api` (`apiUrl()`).
- 09 (done): the API's container (`infrastructure/`) and vps-deploy's `piataro` stack.
- 10 (done): Base UI 1.9.0, pinned exactly in `frontend/`.
- 11 (done, ready for deploy): the house style and its harness: vendored `vendor/house-style/` 1.1.0, Prettier at 120, `npm run check` and `check:fast`, ESLint with typed rules in both projects, TypeScript 6.0.3 in the backend, `.claude/rules/`. Warnings held for later: `no-explicit-any`, `n/no-process-env`, `no-console`, `no-misused-promises` ([todos/house-style-warnings.md](../todos/house-style-warnings.md)).

## Owed by the owner

1. Push this repo and vps-deploy.
2. `npm install` in this checkout's `frontend/` (the deploy builds it there; brief 11 changed its pins and dropped its ESLint packages).
   Once per clone: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
3. In vps-deploy, `npm run setup -- --stack piataro`. It makes `JWT_SECRET` and the Ward client key in
   `secrets/piataro.env`, registers the piataro app at Ward, and asks for `OWNER_EMAIL`, `OWNER_NAME`
   and `OWNER_PASSWORD` (at least 12 characters).
4. `node cli.ts piataro all`. The pre-deploy needs sudo for `/srv/piataro-api` and the Caddyfile. The
   server phase seeds the samples and creates the owner's account. Both steps rerun on every deploy
   and change nothing the second time.
5. Open `https://<domain>/piataro/`, sign in, link Ward under **Setări**, sign out, and check that
   **Intră cu Ward** signs you back in: the one round trip not tried against a real Ward.

[docs/deploy.md](../../docs/deploy.md) has the details and a password reset.
