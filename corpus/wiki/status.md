---
summary: Dated snapshot (2026-11-03) — PiațăRo is being turned into a deployed demo; briefs 01-08 are done and 09 is queued, one line each.
updated: 2026-11-03
---

# Status — 2026-11-03

Built in April-May 2026 and paused since 2026-05-29; README and docs added 2026-10-16; security
updates 2026-10-23. Not deployed. On 2026-11-03 the owner decided it becomes a deployed demo
([decisions.md](decisions.md)).

## Briefs

- 01 (done): the corpus moved to the corpus-flow layout.
- 02 (done): the add-listing flow, `GET /me/listings`, 401 on a bad token, the safety tip, `.env`, the docs.
- 03 (done): no seeded accounts outside `npm run seed:dev`; paid files in `ASSETS_DIR`, off `/uploads/`.
- 04 (done): Stripe and the payment webhook removed; payments are simulated only.
- 05 (done): sign-up closed, `npm run create-owner`, Sign in with Ward linked by subject from Settings.
- 06 (done): the simulated payout ledger at 2.5%, the Câștiguri section; the dashboard loads again.
- 07 (done): `npm run seed:samples`, nine sample listings that never expire.
- 08 (done): `PIATARO_BASE`, the frontend at `/piataro/` and the API at `/piataro-api` (`apiUrl()`).
- 09: the vps-deploy stack (in that repo).

## Owed by the owner

- Register the app at Ward and deploy, once 09 lands.
