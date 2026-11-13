# Fresh-session orchestrator prompt

Paste everything between the lines below into a new Claude Code session in this repo.

---

You are the **orchestrator** for a parallel todo-burndown swarm on the `my-olx` monorepo. Run
**fully autonomously** — do not stop to ask me questions; make the obvious call and keep going.

## Mission

Implement all 15 todos in `corpus/todo/*.md`. Each is implemented by a **Sonnet** subagent running
in its **own git worktree** on its **own branch**, then merged to `main`. Work proceeds in **waves**:
agents within a wave run in parallel; waves run sequentially. The wave grouping below guarantees that
**no two concurrent agents touch the same file**, so merges never conflict. Read
`corpus/orchestration/PLAN.md` for the full rationale and the conflict-hotspot analysis before starting.

## Setup (do once, before Wave 0)

1. Confirm `main` is clean (`git status`). If not, stop and tell me.
2. Add a merge safety net so append-only shared files never block a merge:
   create/append `.gitattributes` at repo root with:
   ```
   frontend/public/locales/*/common.json merge=union
   backend/app/src/server.ts merge=union
   ```
   Commit it to `main` with message `chore: union merge driver for append-only files`.

## Per-agent contract (put this in every subagent prompt)

Each subagent gets, verbatim:
- Its assigned todo file path(s) under `corpus/todo/`.
- Its **exact file-ownership list** (below). It may ONLY edit files in that list (plus brand-new files
  it creates inside the listed directories, plus its own migration file).
- Worktree setup it must run first:
  `git worktree add ../wt-<slug> -b feat/<slug> main` then work inside `../wt-<slug>`.
- Migration naming: if it adds a migration, name it with the **unique timestamp** assigned in the wave
  table — always later than the newest existing migration `20260601000100`.
- i18n rule: only **append** new keys to `frontend/public/locales/ro/common.json` (and `en/common.json`)
  under the namespace assigned to it; never reorder or edit existing keys.
- Build gate before "done": `cd backend && npm run build` and/or `cd frontend && npm run build`
  (whichever it touched). Fix its own errors. Backend tests: `cd backend && npm test` if it changed
  backend logic.
- Romanian UI text with correct diacritics (ă, â, î, ș, ț) per `CLAUDE.md`.
- Final report (its returned message): branch name, bullet list of files changed, migration filename if
  any, build/test result, and anything the orchestrator should know before merging.
- Spawn each subagent with **model: sonnet** and **isolation: worktree** is NOT needed at the Agent-tool
  level because the agent creates its own named worktree per above — but you MAY instead use the Agent
  tool's `isolation: "worktree"` and have the agent just `git checkout -b feat/<slug>` inside it. Pick
  one approach and be consistent. (Recommended: let the agent run the explicit `git worktree add`
  commands so branch names are predictable for merging.)

## After each wave (orchestrator does this, NOT the agents)

1. Wait for all agents in the wave to report done.
2. For each branch **in the listed order**: `git merge --no-ff feat/<slug> -m "merge <slug>"`.
   If `common.json` or `server.ts` show union-merge duplication, dedupe by hand and `git add`.
   Any other conflict = a planning miss; resolve minimally, note it, continue.
3. Run the full build gate on `main`: `cd backend && npm run build && npm test` and
   `cd frontend && npm run build`. Fix breakage before proceeding.
4. Clean up: `git worktree remove ../wt-<slug>` for each, delete merged branches.
5. Commit any merge fixups. Then start the next wave (agents branch from the now-updated `main`).
6. Update `corpus/todo/<slug>.md` frontmatter `status: pending` → `status: done` for each completed
   todo, and tick its acceptance-criteria checkboxes. Update `corpus/pages/index.md` if needed.

Use a TodoWrite list to track the 5 waves and report progress to me after each merge.

## Wave table — assignments, ownership, migration timestamps

### Wave 0 — Foundation (1 agent, run alone first)
- **`remove-physical-goods-remnants.md` + `categories-update.md`** (ONE agent, both todos — they edit
  the same files so cannot be split). Namespace: i18n `categories.*`.
  - Owns: `backend/app/src/listings-helpers.ts`, `backend/app/src/modules/listings.ts`,
    `backend/app/src/repositories/listings.repo.ts`, `backend/app/src/modules/locations.ts` (delete),
    `backend/app/src/data/cities-by-counties.json` (delete), `backend/app/src/server.ts` (drop
    locations route registration), seed SQL files `20260428010000_seed_data.sql` /
    `20260429010000_seed_locations.sql` (update/remove), `frontend .../home/pages/HomePage.tsx`
    (CATEGORIES), `frontend .../create-listing/steps/CategoryStep.tsx` + `LocationPriceStep.tsx`
    (remove city), `frontend .../listings/components/SpecsBento.tsx`/ListingCard/ListingDetailPage city
    display, `frontend .../categories/` pages, `frontend public/locales/{ro,en}/common.json`.
  - Migration (if needed for re-seed): `20260605010000_reseed_digital.sql`.

### Wave 1 — Backend additive + isolated frontend (4 agents)
| Agent | Todo | Owns (files) | Migration ts | i18n ns |
|---|---|---|---|---|
| A1a | `search-improvements.md` | `backend/app/src/repositories/listings.repo.ts` (search method only), new FTS migration, `backend/app/src/modules/listings.ts` (search route wiring) | `20260610010000_listings_fts.sql` | — |
| A1b | `email-notifications.md` | `backend/core/src/email/index.ts`, `backend/app/src/modules/messaging.ts`, `backend/app/src/modules/assets.ts`, `backend/core/src/db/schema.ts` (+`email_notifications` col on users), `backend/app/src/modules/users.ts` (opt-out setting) | `20260610020000_email_notifications_pref.sql` | `settings.*` |
| A1c | `cui-lookup.md` | new `backend/app/src/modules/anaf.ts`, `backend/app/src/server.ts` (add route) | — | — |
| A1d | `password-reset-ui.md` | `frontend .../auth/pages/ForgotPasswordPage.tsx`, `.../auth/pages/ResetPasswordPage.tsx`, `.../auth/services/auth.ts`, `.../auth/hooks/useForgotPasswordMutation.ts`, `useResetPasswordMutation.ts` | — | `auth.*` |

> A1a owns `listings.ts`/`listings.repo.ts`; A1b owns `assets.ts`/`messaging.ts`/`schema.ts`/`users.ts`;
> A1c owns `anaf.ts` + `server.ts`; A1d is frontend-auth. Disjoint.

### Wave 2 — Feature pages (4 agents)
| Agent | Todo | Owns | Migration ts | i18n ns |
|---|---|---|---|---|
| A2a | `download-all-assets.md` | `backend/app/src/modules/assets.ts`, `backend/app/src/repositories/assets.repo.ts`, `frontend .../listings/pages/ListingDetailPage.tsx`, `.../listings/services/listings.ts` | — | `listing.files.*` |
| A2b | `seller-profile.md` | `backend/core/src/db/schema.ts` (bio/website/social cols), `backend/app/src/modules/users.ts`, `backend/app/src/repositories/users-auth.repo.ts`, `frontend .../public-profile/pages/PublicProfilePage.tsx`, `.../settings/components/ProfileSection.tsx`, `.../settings/pages/SettingsPage.tsx` | `20260615010000_user_profile_fields.sql` | `seller.*`, `settings.profile.*` |
| A2c | `listing-renewal-and-expiry-ui.md` | `frontend .../dashboard/pages/MyListingsPage.tsx`, `DashboardPage.tsx`, `.../dashboard/components/ExpiringSection.tsx`, `.../listings/components/RenewButton.tsx`, `.../dashboard/services/dashboard.ts` | — | `dashboard.*` |
| A2d | `gdpr-cookie-consent.md` | new `frontend .../core/components/ui/CookieConsent.tsx`, `frontend .../core/components/layout/MainLayout.tsx` (mount it) | — | `cookies.*` |

> A2a=assets+ListingDetail; A2b=schema+users+settings+profile; A2c=dashboard; A2d=new component+MainLayout.
> Note A2a and A2b both *could* touch SettingsPage — they don't: A2a stays in listings module, A2b owns
> settings. Disjoint.

### Wave 3 — Cross-cutting UI + upload fix (3 agents)
| Agent | Todo | Owns | i18n ns |
|---|---|---|---|
| A3a | `static-pages.md` | 6 new pages under `frontend .../core/pages/legal/` (or a new `legal` module), `frontend .../app/routes/index.tsx` (add routes), `frontend .../core/components/layout/Footer.tsx` (links) | `legal.*` |
| A3b | `listing-preview-before-publish.md` | `frontend .../create-listing/steps/ReviewStep.tsx`, `.../create-listing/components/CreateListingWizard.tsx` | `createListing.preview.*` |
| A3c | `fix-frontend-upload-flow.md` | `frontend .../listings/services/images.ts`, `.../create-listing/services/assets.ts`, `.../settings/services/profile.ts` | — |

> Boundary rule: A3b edits wizard **steps/components**, A3c edits **services** only. Explicitly tell A3b
> NOT to touch `create-listing/services/assets.ts` (that's A3c). A3a owns routes+Footer. Disjoint.

### Wave 4 — Heavy features (sequential: A4a, then A4b)
| Agent | Todo | Owns | Migration ts |
|---|---|---|---|
| A4a | `invoice-generator.md` (v1: PDF+XML download, no ANAF OAuth) | new `backend/app/src/modules/invoices.ts`, `backend/core/src/db/schema.ts` (invoices + user_invoice_profiles tables), `backend/app/src/server.ts` (routes), new `frontend .../app/modules/invoices/` (page `/facturi` + history + routes), uses A1c's `/anaf/company/:cui` | `20260620010000_invoices.sql` |
| A4b | `payment-processing.md` (Netopia test mode OR Stripe test mode — pick Stripe for DX, gate downloads) | new `backend/app/src/modules/orders.ts`, `backend/core/src/db/schema.ts` (orders table), `backend/app/src/server.ts` (routes + webhook), `backend/app/src/modules/assets.ts` (gate download behind paid order), `frontend .../listings/pages/ListingDetailPage.tsx` (Buy button), new `frontend .../app/modules/orders/` | `20260620020000_orders.sql` |

> A4a and A4b both touch `schema.ts` + `server.ts` → run **sequentially**: A4a → merge → A4b branches
> from updated `main`. Do NOT run them in parallel.

## Decisions already made for you (don't ask)
- Invoice generator: **v1 only** — PDF + UBL XML download, no direct ANAF OAuth submission.
- Payments: use **Stripe test mode**, storefront model (platform collects), free listings
  (`price_ron` null/0) skip payment. If Stripe keys absent, stub the PSP behind an interface and wire a
  fake "mark as paid" in test mode so the flow is end-to-end testable; note this in the report.
- Search: **FTS5** (Option A) with `unicode61 remove_diacritics 2`.
- Download-all: **Option A** (per-asset endpoint), keep legacy `/download` working.
- Don't add a job queue for emails — fire-and-forget async with error logging.

## Go
Set up the safety net, then launch Wave 0. After it merges and the build is green, launch Wave 1's 4
agents in parallel, and so on through Wave 4. Report to me after every wave merge. Keep going until all
15 todos are `status: done` and `main` builds + tests green.
