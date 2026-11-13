---
summary: Dated snapshot (2026-11-13) — PiațăRo as a deployed demo; briefs 01-14 are done (one line each), briefs 10-14 wait for a deploy, and the owner's steps.
updated: 2026-11-13
---

# Status — 2026-11-13

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
- 11 (done, ready for deploy): the house style and its harness: vendored `vendor/house-style/` 1.1.0, Prettier at 120, `npm run check` and `check:fast`, ESLint with typed rules in both projects, TypeScript 6.0.3 in the backend, `.claude/rules/`. Warnings held for later were cleared by brief 17 ([todos/house-style-warnings.md](../todos/house-style-warnings.md)).
- 12 (done, ready for deploy): Base UI by the conventions, and a Light / Dark / System theme switch in the footer: wrappers for `Modal`, `ConfirmDialog`, `Dropdown`, `Tooltip`, `Switch`, `Checkbox`, `RadioGroup`, `Accordion` and a `Toast` behind sonner's call shape (sonner removed); role tokens for colour, shadow and z; `check-base-ui` 0 and strict; the first frontend tests. The dark values are the brief's default, for the owner to look at.
- 13 (done, ready for deploy): the server in the house code structure: zod 4.6.7, `config.ts` the one reader of the environment (`JWT_SECRET` required), `server.ts` / `app.ts` with close-with-grace, `core` as `plugins/` + `lib/` + `db/`, `features/<name>/`, a zod schema with a response schema on every JSON route, Fastify's own 4xx no longer 500, `check-structure` strict at 0.
- 14 (done, ready for deploy): the redesign "The filter band", approved on the estate board 2026-11-13: Schibsted Grotesk, Voroneț azure with a navy shell, a raised filter band on the category and search screens with a phone `Filtre` sheet (picks apply together from `Aplică filtrele`), a five-place bottom bar on phones, home, detail and every undrawn screen restyled; Playwright specs for focus, motion, 390 overflow, the theme, the filters and the overlays; contrast tested over both themes. `Mai multe filtre` waits for a fourth facet. [Brief 14](../briefs/done/14-a-redesign-with-hallmark-on-the-estate-board.md).
- 15 (done, ready for deploy): replies that say less: the conversation summary's counterparty is id, display name and avatar only, its flags booleans; the asset upload has no `s3_key`; the avatar upload's `public_url` carries `/uploads/`. [Brief 15](../briefs/done/15-replies-that-say-less.md).
- 16 (done, ready for deploy): the change-password form is on the account settings page (`Securitate`), the new password at least 12 characters, errors in Romanian; eleven never-wired frontend files deleted, knip's ignore list gone. [Brief 16](../briefs/done/16-wire-the-password-form-and-delete-the-dead-files.md).
- 17 (done, ready for deploy): the held house-style warnings cleared: `no-misused-promises`, `no-explicit-any`, `no-console` are errors again, the hook warnings fixed, `AppContext.log` added. Left: 19 test non-null assertions, knip's three dependency notes. [Brief 17](../briefs/done/17-the-house-style-warnings.md).

## Owed by the owner

1. Push this repo and vps-deploy.
2. `npm ci` in this checkout's `frontend/` (brief 14 added `@fontsource-variable/schibsted-grotesk` 5.3.0 and `@playwright/test` 1.63.0) (the deploy builds it there; brief 11 changed its pins, brief 12 added `clsx`, `tailwind-merge` and `vitest` and dropped `sonner`), and in `backend/` (brief 13 moved zod to 4.6.7 and added the type provider, `fastify-plugin` and `close-with-grace`).
   Once per clone: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
3. In vps-deploy, `npm run setup -- --stack piataro`. It makes `JWT_SECRET` and the Ward client key in
   `secrets/piataro.env`, registers the piataro app at Ward, and asks for `OWNER_EMAIL`, `OWNER_NAME`
   and `OWNER_PASSWORD` (at least 12 characters).
4. `node cli.ts piataro all`. The pre-deploy needs sudo for `/srv/piataro-api` and the Caddyfile. The
   server phase seeds the samples and creates the owner's account. Both steps rerun on every deploy
   and change nothing the second time.
5. Open `https://<domain>/piataro/`, sign in, link Ward under **Setări**, sign out, and check that
   **Intră cu Ward** signs you back in: the one round trip not tried against a real Ward.

6. After brief 13's deploy: the API container turns healthy, `docker stop` on it ends at once (close-with-grace),
   and `/piataro-api/listings`, `/piataro-api/listings/featured` and a listing page answer 200; signed in,
   open Comenzile mele, Facturi, Mesaje, Câștiguri and Setări once. A stored value outside a response schema
   would answer 500 there while `/health` stays green. If `JWT_SECRET` were ever missing,
   the container now exits at start with `JWT_SECRET environment variable is required`.

[docs/deploy.md](../../docs/deploy.md) has the details and a password reset.
