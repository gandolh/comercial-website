# Orchestration Plan — Parallel Todo Swarm

Goal: burn down all 15 todos in `corpus/todo/` using a swarm of **Sonnet** subagents, each
working in its **own git worktree** and merging back to `main` with **zero merge conflicts**.

## The core problem: shared-file conflicts

Several todos edit the *same files / same functions*. Running those in parallel guarantees
merge conflicts. The fix is **waves**: within a wave, every agent owns a **disjoint set of files**.
Waves run sequentially; agents inside a wave run in parallel. After each wave, all branches are
merged to `main` before the next wave starts (so the next wave branches from up-to-date `main`).

### Identified conflict hotspots (files >1 todo wants)

| File | Todos that touch it |
|---|---|
| `backend/app/src/listings-helpers.ts` (CATEGORY_LABELS + DTO builders w/ `city`/`is_negotiable`) | categories-update, remove-physical-goods, download-all-assets, seller-profile |
| `backend/core/src/db/schema.ts` (Kysely table interfaces) | seller-profile, invoice-generator, payment-processing, email-notifications |
| `backend/app/src/server.ts` (route registration) | cui-lookup, invoice-generator, payment-processing, download-all-assets, remove-physical-goods |
| `backend/app/src/modules/listings.ts` + `listings.repo.ts` | remove-physical-goods, search-improvements, download-all-assets, payment-processing |
| `backend/app/src/modules/assets.ts` | download-all-assets, payment-processing |
| `frontend .../home/pages/HomePage.tsx` (CATEGORIES) | categories-update, remove-physical-goods |
| `frontend src/app/routes/index.tsx` (router) | static-pages, invoice-generator, payment-processing |
| `frontend .../layout/Footer.tsx` | static-pages, gdpr-cookie-consent |
| `frontend public/locales/ro/common.json` | categories-update, static-pages, gdpr, seller-profile, listing-renewal, download-all, payment |
| `frontend create-listing/` wizard + steps | remove-physical-goods (city step), listing-preview, categories (CategoryStep), fix-upload (assets.ts) |

`migrations/*.sql` are **additive** (new uniquely-timestamped files) → no conflict as long as each
agent names its migration with a distinct, late timestamp.

`public/locales/ro/common.json` is the nastiest: JSON, many writers. **Mitigation:** agents only ever
**append new keys** under a unique top-level namespace they own (e.g. `categories.*`, `legal.*`,
`cookies.*`, `seller.*`). Appending disjoint keys to a JSON object still conflicts textually if two
edits land on adjacent lines. So translation-touching todos are **spread across different waves**
wherever they'd collide, and the merge driver below makes the rest painless.

## Wave design (disjoint file ownership within each wave)

### Wave 0 — Foundation (run FIRST, alone, merge before anything else)
These rewrite the files everyone else depends on. Doing them first means later waves branch from a
clean, digital-native baseline and never re-touch these decisions.

- **A0a · remove-physical-goods-remnants** — owns `listings-helpers.ts` (removes `city`/`is_negotiable`
  from DTOs), `listings.ts`, `listings.repo.ts`, `locations.ts` (delete), `server.ts` (drop locations
  route), `data/cities-by-counties.json` (delete), frontend create-listing city step, ListingCard/Detail
  city display, seed SQL. **Also does categories-update** (merged into this agent — they both edit
  `listings-helpers.ts` CATEGORY_LABELS + HomePage CATEGORIES + create-listing CategoryStep, so they
  CANNOT be parallel). One agent, two todos.

> Wave 0 is a single agent owning both `remove-physical-goods-remnants.md` **and**
> `categories-update.md`. Merge to main. This unblocks everyone.

### Wave 1 — Backend-heavy, additive (parallel; disjoint files)
Branch from post-Wave-0 main.

- **A1a · search-improvements** — `listings.repo.ts` search method + new FTS migration. (Owns repo
  search path. No frontend.)
- **A1b · email-notifications** — `core/src/email/index.ts` (templates), `messaging.ts`, `assets.ts`
  (first-download hook), `schema.ts` (add `email_notifications` col) + migration.
- **A1c · cui-lookup** — new `modules/anaf.ts`, `server.ts` route add. Self-contained.
- **A1d · password-reset-ui** — verify/fix `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, auth
  service. Frontend auth module only. (Pure frontend, isolated.)

> Conflict check: A1a owns `listings.repo.ts`; A1b owns `assets.ts`+`messaging.ts`+`schema.ts`+`email`;
> A1c owns `anaf.ts`; A1d owns auth frontend. `server.ts` is touched only by A1c in this wave.
> `schema.ts` only by A1b. **Disjoint. ✅**

### Wave 2 — Feature pages (parallel; disjoint files)
Branch from post-Wave-1 main.

- **A2a · download-all-assets** — `assets.ts` (new per-asset endpoint), `assets.repo.ts`,
  `ListingDetailPage.tsx` file list. (assets.ts now free — A1b merged.)
- **A2b · seller-profile** — `schema.ts` (bio/website/social cols) + migration, `users.ts`,
  `users-auth.repo.ts`, `PublicProfilePage.tsx`, `SettingsPage.tsx`/ProfileSection.
- **A2c · listing-renewal-and-expiry-ui** — `MyListingsPage.tsx`, `DashboardPage.tsx`,
  dashboard components, `RenewButton.tsx`. Frontend-only, backend already done.
- **A2d · gdpr-cookie-consent** — new `CookieConsent` component, mount in `MainLayout.tsx`.
  Does NOT touch Footer (that's static-pages in Wave 3).

> Conflict check: A2a owns assets; A2b owns schema.ts+users; A2c owns dashboard; A2d owns a new
> component + MainLayout. `ListingDetailPage.tsx` only A2a. `SettingsPage` only A2b. **Disjoint. ✅**

### Wave 3 — Cross-cutting UI + heavy features (parallel; disjoint files)
Branch from post-Wave-2 main.

- **A3a · static-pages** — 6 new page files, `routes/index.tsx` (add routes), `Footer.tsx` (links).
- **A3b · listing-preview-before-publish** — new `ReviewStep`/preview in create-listing wizard.
  (create-listing now free — Wave 0's remove-physical city-step work is merged.)
- **A3c · fix-frontend-upload-flow** — `listings/services/images.ts`,
  `create-listing/services/assets.ts`, `settings/services/profile.ts`. (Wave-3 isolation: A3b touches
  wizard *steps/components*, A3c touches *services* — keep them on separate files; coordinate that A3b
  does not edit `create-listing/services/assets.ts`.)

> Conflict check: A3a owns routes+Footer+new pages; A3b owns wizard step/component files; A3c owns 3
> service files. Watch the create-listing boundary between A3b/A3c — assign explicitly. **Disjoint. ✅**

### Wave 4 — The big one (sequential or careful parallel)
Branch from post-Wave-3 main.

- **A4a · invoice-generator** — new `invoices` tables + migration, `modules/invoices.ts`, `server.ts`
  route, new frontend `/facturi` route + page. Depends on cui-lookup (Wave 1, done).
- **A4b · payment-processing** — `orders` table + migration, `modules/orders.ts`, `server.ts` route,
  gate `assets.ts` download, frontend Buy button on `ListingDetailPage.tsx`.

> Both touch `server.ts` and `schema.ts`. To stay conflict-free run them as **two sub-waves** (4a then
> 4b), OR have one agent do both. Recommended: **sequential** — A4a merges, then A4b branches from it.
> Payment also re-touches `assets.ts` and `ListingDetailPage.tsx` which Wave 2 changed — fine, Wave 2
> is merged by now.

## Why this guarantees clean merges

1. **Disjoint file ownership within a wave** — no two concurrently-running agents edit the same file.
2. **Sequential waves** — each wave branches from a `main` that already contains prior waves, so a
   later agent that legitimately needs an earlier change *gets it from main*, never via merge.
3. **Additive migrations** — every new migration gets a unique timestamp > all existing ones, namespaced
   per agent (see naming rule below), so no two migration files collide.
4. **i18n JSON discipline** — each agent appends keys only under its own namespace; a `.gitattributes`
   union-merge driver on `common.json` resolves any residual adjacency automatically.
5. **Merge order is fixed** — orchestrator merges branches in a deterministic order per wave.

## Mechanics for each agent

- Create worktree: `git worktree add ../wt-<slug> -b feat/<slug> main`
- Work ONLY inside that worktree. Touch ONLY files in your assigned ownership list.
- Migration filename rule: `2026{WAVE}{NN}_<slug>.sql`, e.g. Wave 1 search →
  `20260610010000_listings_fts.sql`; always later than `20260601000100`. Pick a timestamp unique to
  your slug from the table in PROMPT.md.
- Run the wave's build/test gate before declaring done (`cd backend && npm run build`,
  `cd frontend && npm run build`).
- Report back: branch name, files changed, migrations added, test status.

Orchestrator then, per wave: `git merge --no-ff feat/<slug>` for each branch in order, run full build,
remove worktrees, proceed to next wave.

## .gitattributes safety net (set up once, in Wave 0)

```
frontend/public/locales/*/common.json merge=union
backend/app/src/server.ts                merge=union
```
(union driver concatenates both sides instead of conflicting — safe for append-only files and route
registration lists; orchestrator eyeballs the result after.)

## Sequencing summary

```
Wave 0  [1 agent ]  remove-physical+categories          → merge → build gate
Wave 1  [4 agents]  search, email, cui, password-reset  → merge → build gate
Wave 2  [4 agents]  download-all, seller, renewal, gdpr  → merge → build gate
Wave 3  [3 agents]  static-pages, preview, fix-upload    → merge → build gate
Wave 4  [2 agents]  invoice → (merge) → payment          → merge → build gate
```

Total: 15 todos, 14 agent-runs across 5 waves, all Sonnet, all worktrees.
