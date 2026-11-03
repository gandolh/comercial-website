# Task 06 — The fake payout ledger at 2.5%

## Context
Decisions.md → *A fake payout ledger, 2.5% platform fee*. `orders` records the gross only today.
Replaces the former todo `creator-payouts` with its simulated version.

## Files you OWN
A new migration, `backend/app/src/modules/orders.ts`, a new `payouts` module and repository with
tests, a dashboard "Câștiguri" (earnings) section in the frontend, `corpus/wiki/business-rules.md`.

## What to do
1. **Fee on the order:** a paid order records `platform_fee_ron` (2.5% of the gross, rounded to the ban)
   and `seller_net_ron` at the moment it is paid. The rate is one constant; changing it never touches
   past orders. Existing paid orders get the fee backfilled by the migration.
2. **Ledger:** a `payouts` table (seller, amount, created_at, `simulated = 1`). Available balance =
   sum of the seller's net on paid orders − sum of payouts.
3. **API:** `GET /me/earnings` (balance, totals, recent sales with fee and net, payouts) and
   `POST /me/payouts` (pays out the whole available balance, at once, simulated; idempotent per
   request id; refuses a zero balance).
4. **UI:** a dashboard section with the balance, the per-sale fee and net, and a "Retrage (simulat)"
   button; copy says plainly that no money moves.
5. Update [business-rules](../../wiki/business-rules.md): the fee is 2.5%.

## Acceptance
- Buying a 100 RON listing shows 97.50 RON net and 2.50 RON fee in the seller's earnings; a payout
  empties the balance and records a simulated payout.
- Tests cover the fee rounding, the balance and payout idempotency; builds and tests pass.

---

**Outcome (2026-11-03).** Done (`4a9a4d8`).
- **The fee:** the fee and the net are recorded on `mark-paid`, and the migration backfills orders paid
  before it. The rate is the constant `PLATFORM_FEE_RATE = 0.025` in `app/src/payout-fee.ts`, rounded
  half up on whole bani (49 RON → 1.23 fee).
- **The ledger:** `payouts` (request_id unique, `simulated = 1`). `GET /me/earnings` and
  `POST /me/payouts` (201 new, 200 repeat, 422 empty) run in one transaction. The dashboard has a
  "Câștiguri" section with "Retrage (simulat)".
- **A fourth broken flow:** the dashboard itself never loaded, because it called `/me/stats` and the API
  serves `/users/me/stats`. Fixed. A sweep of every path the frontend calls against the backend's routes
  found only one other: `/locations/counties`, called by a city picker that no page uses (a pre-pivot
  leftover, left alone).
- **Checked:** in the browser as the seeded seller, the sale made in brief 04's check showed
  49 − 1.23 = 47.77, and the payout emptied the balance. Tests cover the fee rounding, the
  balance, payout idempotency and the backfill. Backend tests: 156.
