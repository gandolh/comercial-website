---
summary: Locked calls future briefs must not relitigate — the project is a deployed demo with fake payments (Stripe removed, no live ANAF), only the owner signs in (own login plus Ward, linked by Ward subject), a fake payout ledger at 2.5%, the /piataro address, sample listings that never expire, the house style and its checks (vendored, width 120).
updated: 2026-11-12
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
_2026-11-03_ — The owner keeps the email-and-password login (the account is created by `npm run
create-owner` at deploy, the password from vps-deploy's secrets) **and** gets "Sign in with Ward",
like the estate's other apps. Rejected: Ward only (the app stays usable without Ward) and own login
only (the estate signs in through Ward).

**Linked by Ward subject, from Settings** (revised the same day, while building brief 05). The grill
assumed linking by email. Ward's verified ID token carries no email, only a stable subject, and the
vendored `ward-auth` library's rule is to link by subject only: matching by name or email is account
takeover on a shared origin. So the owner links Ward once from Settings while signed in with the
password (`users.ward_subject`); a Ward sign-in finds its user by that subject, and an unlinked Ward
account is refused. Nothing creates accounts from Ward.

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

## The house style, formatted and checked
_2026-11-11_ — The estate's `house-style` configs are **vendored** at `vendor/house-style/` (version 1.1.0),
refreshed by `npm run house-style:sync`. The tool pins (ESLint, Prettier, TypeScript, knip,
dependency-cruiser and the plugins) sit in the root `package.json`, because the vendored ESLint config
resolves its plugins from where it sits; the root has no workspaces, and `backend/` and `frontend/` keep
their own lockfiles and their own `eslint.config.js`, `knip.config.js` and `check:fast`. Prettier is one
config at the root, at width 120 with trailing commas, Markdown out. The 48 single-quote frontend files
moved to double quotes and semicolons in the one reformat commit, which `.git-blame-ignore-revs` hides.
The backend's TypeScript went from 5.7.3 to 6.0.3 so `erasableSyntaxOnly` applies, and the frontend gained
`strict` and `noUncheckedIndexedAccess`. `backend/tsconfig.base.json` writes the house flags out instead
of extending the vendored base, because the Docker build copies only `backend/`. `npm run check` is
typecheck, lint, format check, conventions (knip, dependency-cruiser and the two checkers) and the backend
tests. Rejected: a `github:` or tarball dependency on the library (the image has no `git`), npm
workspaces across the two projects (the Dockerfile and the deploy build them apart), and fixing every
finding at once (a dated warning in each ESLint config holds `no-explicit-any`, `n/no-process-env`,
`no-console` and `no-misused-promises` until a brief of their own).

## Base UI everywhere, and a theme switch
_2026-11-10, built 2026-11-12 (brief 12)_ — Every interactive widget starts from Base UI 1.9.0 behind a wrapper
in `frontend/src/core/components/ui/<Name>/` (the folder-per-wrapper layout stays; Base UI is imported only
there). `sonner` is gone: a `toast` object in `ui/Toast/` keeps its call shape over Base UI's Toast, and an
error toast stays until dismissed. The two native `<select>`s (the sort bar, the invoice form) **stay native**:
both are used on phones, where the native picker is the better control (Q16). The cookie banner stays
hand-built: it is non-modal and Base UI has no banner part. Rejected: keeping `sonner` (it injects its own CSS at
run time) and an `Icon` wrapper (66 files; the unlayered `.material-symbols-outlined` rule and the 31 inline
icon sizes stay as recorded exceptions).

## The theme: Light, Dark or System, on this device
_2026-11-10, built 2026-11-12 (brief 12)_ — A `data-theme` attribute on `<html>` carries the choice; `dark:` keys
off it, never off the system setting. A first visit is light; the choice lives in `localStorage` (no server
setting, since only the owner has an account); System is resolved in script and follows the browser live. The
control is a `RadioGroup` in the footer, reachable signed out. Rejected: following the system on a first visit
and a toggle in the profile menu.
