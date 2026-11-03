---
summary: Locked calls future briefs must not relitigate — the project is a deployed demo with fake payments (Stripe removed, no live ANAF), only the owner signs in (own login plus Ward), a fake payout ledger at 2.5%, the /piataro address, sample listings that never expire.
updated: 2026-11-03
---

# Decisions

Settled at the owner's grill of 2026-11-03 ([log.md](../log.md)). Changing one needs an explicit
revisit and a `log.md` note.

## A deployed demo, not a live shop
_2026-11-03_ — PiațăRo runs as a working demo on the owner's server with **fake payments**; the live
ANAF e-Factura verification is dropped (the offline generator stays, see [invoicing](invoicing.md)).
Rejected: launching for real (it needs a company, a usable name, seller KYC and live PSP and ANAF
work) and fixing it locally only (the owner wants it visible).

## Only the owner signs in; the public browses read-only
_2026-11-03_ — Sign-up is closed. Rejected: open sign-up, because strangers' uploads would be served
from the owner's domain (malware, pirated files) and fake payments let anyone "buy" anything; and a
shared demo login, for the same upload risk.

## Two ways in: the app's own login and Ward
_2026-11-03_ — The owner keeps the email-and-password login (the account is created by a command at
deploy, the password from vps-deploy's secrets) **and** gets "Sign in with Ward", like the estate's
other apps. A Ward sign-in links to the local account with the same email. Rejected: Ward only
(the app stays usable without Ward) and own login only (the estate signs in through Ward).

## Stripe removed
_2026-11-03_ — The Stripe provider and its webhook (which marked orders paid without checking the
signature) are deleted; only the fake provider remains. Rejected: fixing the signature check (code
nothing would run) and leaving the hole documented.

## A fake payout ledger, 2.5% platform fee
_2026-11-03_ — Each paid order records a 2.5% platform fee; a seller sees their balance and requests
a payout, which settles at once, marked simulated. Changing the fee only affects new sales. Rejected:
parking payouts until a real launch (the owner wants the whole money loop visible), and 10% (the
owner's first pick, changed the same day).

## Served at `<domain>/piataro`, the API at `/piataro-api`
_2026-11-03_ — A path on the main domain, like Shelfmark and Almanac, with the API on its own route
as brief-board does. Rejected: a `piataro.` subdomain (no base path needed, but a new DNS name).

## Sample listings never expire
_2026-11-03_ — The first deploy seeds sample listings under seller profiles that cannot sign in;
samples are marked so the 30-day expiry skips them, and the owner's own listings expire normally.
Rejected: renewing samples on each deploy (a quiet month empties the site) and no seed (the public
would see an empty site).
