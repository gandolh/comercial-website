# Task 11: The house style and the quality harness

**Depends on:**

- In comercial-website: brief 10, so the lockfile diff of this brief holds no Base UI change.
- In the owner's skills library:
  - brief 27, *A house style, and a quality harness that enforces it*: the `house-style` package at `v1.0.0` (vendored here, decision 1), the `house-style` skill, and the plugin's `Stop` and `PostToolUse` hooks;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: how the convention checkers are wired and when they run `--warn-only`.
- The owner's grilling of 2026-11-10 and its technical calls: Q5-Q14, Q45-Q51. Every question is answered; the decisions below record each.

**Runs before:** 12 and 13. The reformat touches about 190 frontend files and 43 backend files, and those briefs rewrite or move most of them. Formatting first gives one clean reformat commit.

## Context

On 2026-11-09 the owner made three calls for every web app they own: Base UI 1.9.0 everywhere, the whole app on Tailwind v4, and the researched conventions enforced in each repo. The skills library's brief 27 sets a two-layer harness: the repo's own gate (`npm run check`, and its fast subset `npm run check:fast`), and the Claude Code layer (the plugin's `Stop` and `PostToolUse` hooks, `.claude/rules/`, a short `CLAUDE.md`). This brief adopts both in comercial-website. Briefs 12 and 13 then turn on their own checks inside it.

This repo differs from the house lineage in three ways that shape the brief:

- **Two npm projects, two lockfiles.** `backend/` (a workspace of `core` and `app`) and `frontend/` share nothing. The root `package.json` has no dependencies and only calls into them. So there are two ESLint configs, two TypeScript setups, and a root `check` that runs both.
- **The frontend is not red-green.** Its lint fails today, and it has no tests.
- **The root `lint` script lints only the frontend** (`package.json:8`), and the root `test` runs only the backend (`package.json:7`). Nothing runs lint on the backend, because it has no ESLint.

### What the repo has today (read 2026-11-10)

**TypeScript.**

- `frontend/tsconfig.app.json` has `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters` and `noFallthroughCasesInSwitch`, but **no `strict`**. Adding `strict` costs 0 errors (`npx tsc -p tsconfig.app.json --noEmit --tsBuildInfoFile null --strict`, scratch copy, TypeScript 6.0.3). Adding `noUncheckedIndexedAccess` too costs 1: `frontend/src/app/modules/listings/components/ImageGalleryEditor.tsx:63`.
- `backend/tsconfig.base.json` has `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` and `NodeNext`. It lacks `noImplicitOverride`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, `isolatedModules` and `erasableSyntaxOnly`.
- **Backend TypeScript is 5.7.3** (`backend/package.json`, devDependencies), and `erasableSyntaxOnly` arrived in 5.8. The numbers below were measured with the frontend's TypeScript 6.0.3 on the backend sources (`tsc -b core app`, scratch copy, one flag at a time):

  | Flag | Errors | Where |
  |---|---|---|
  | `noImplicitOverride` | 1 | `core/src/errors/index.ts:12` |
  | `noUnusedLocals` | 24 | e.g. `core/src/auth/index.ts:1-2`, `core/src/errors/index.ts:1`, `app/src/modules/assets.ts:2` |
  | `noFallthroughCasesInSwitch` | 0 | |
  | `isolatedModules` | 0 | |
  | `erasableSyntaxOnly` | 9 | parameter properties: `core/src/errors/index.ts:10-12`, `core/src/storage/index.ts:14`, and the five repository classes (`app/src/repositories/assets.repo.ts:25`, `bundles.repo.ts:11`, `listings.repo.ts:58`, `reviews.repo.ts:24`, `users-auth.repo.ts:43`) |
  | `exactOptionalPropertyTypes` | 0 | not added now (brief 27 decision 3) |

  The backend compiles clean on 6.0.3 with no flag (`tsc -b core app`), so the TypeScript bump is a free step.

**ESLint.**

- Frontend: `frontend/eslint.config.js` with `@eslint/js` recommended, `typescript-eslint` recommended (untyped), `react-hooks` 7.1.1 `recommended`, and `react-refresh`. **`npm run lint` reports 28 problems, 9 of them errors** (`cd frontend && npx eslint .`, 2026-11-10):

  | Where | Rule |
  |---|---|
  | `src/app/modules/create-listing/components/CreateListingWizard.tsx:38` | `react-hooks/set-state-in-effect` |
  | `src/app/modules/orders/pages/OrderConfirmationPage.tsx:26` | `react-hooks/set-state-in-effect` |
  | `src/app/modules/settings/components/ProfileSection.tsx:50` | `react-hooks/set-state-in-effect` |
  | `src/core/components/ui/CookieConsent.tsx:16` | `react-hooks/set-state-in-effect` |
  | `src/core/components/ui/GlobalLoadingIndicator.tsx:13` | `react-hooks/set-state-in-effect` |
  | `src/core/components/ui/Slider/Slider.tsx:30` | `react-hooks/set-state-in-effect` |
  | `src/app/modules/listings/pages/ListingDetailPage.tsx:169` | `react-hooks/preserve-manual-memoization` |
  | `src/core/components/ui/Chip/Chip.tsx:14` | `@typescript-eslint/no-unused-vars` |
  | `src/core/components/ui/Dropdown/Dropdown.tsx:101` | `react-refresh/only-export-components` |

  The 19 warnings are 8 `exhaustive-deps`, 4 `incompatible-library`, 5 `no-explicit-any`, and 2 unused disable directives. So the root `lint` is red today, and a green `check` needs these nine fixed.
- `frontend/eslint.config.ts` is a **second config**, with `eslint-plugin-react` (not installed). ESLint 9 reads `eslint.config.js` first, so the `.ts` file is dead. Delete it.
- `frontend/package.json` lists `prettier`, `eslint-config-prettier` and `eslint-plugin-prettier` as devDependencies, and wires none of them: there is no Prettier config.
- Backend: **no ESLint at all**, no config and no dependency.

**Formatter.** No Prettier config in either project.

- Frontend (219 `.ts`/`.tsx` files): mixed. 48 files import with single quotes (90 imports), 68 import lines have no semicolon, and the rest is double quotes and semicolons.
- Backend (60 files): double quotes and semicolons, no trailing comma on function parameters, and a line length 95th percentile of 77-83 (`awk` over the files, 2026-11-10).

**Prettier churn** (Prettier 3.8.3 from the frontend's lockfile, `--trailing-comma all`, otherwise defaults, on scratch copies; "lines changed" is the `>` count of `diff -r`):

| `printWidth` | Frontend: lines changed (of 15,058) | files | Backend: lines changed (of 10,241) | files |
|---|---|---|---|---|
| 80 | 1,904 (12.6%) | 143 | 2,407 (23.5%) | 53 |
| 90 | 1,653 (11.0%) | 171 | 1,997 (19.5%) | 51 |
| 100 | 1,507 (10.0%) | 175 | 1,981 (19.3%) | 49 |
| 120 | 1,586 (10.5%) | 188 | 1,821 (17.8%) | 46 |
| 130 | 1,635 (10.9%) | 189 | 1,856 (18.1%) | 43 |
| 150 | 1,720 (11.4%) | 190 | 1,700 (16.6%) | 43 |

The width barely moves the churn here. What dominates is the normalisation: the frontend's single-quote, no-semicolon files, and `trailingComma: "all"` on the backend (function parameters). So the width is nearly free, and 120 sits within 0.5 points of the least churn in the frontend and within 1.2 of the backend's. The estate's one width is **120** (Q8 and Q51), and the reformat at 120, 1,586 changed frontend lines and 1,821 backend lines, is the one-off cost, in one commit that blame ignores.

**The six typed rules plus the house shapes**, `typescript-eslint` 8.58.2 on scratch copies, `projectService` for the frontend and `project` for the backend (lint time about 15 s and 11 s, cold):

| Rule | Frontend | Backend |
|---|---|---|
| `no-floating-promises` | 30 | 0 |
| `no-misused-promises` | 49 | 0 |
| `await-thenable` | 0 | 0 |
| `switch-exhaustiveness-check` | 0 | 0 |
| `no-unnecessary-type-assertion` | 13 | 8 (5 in tests) |
| `consistent-type-imports` | 0 (`verbatimModuleSyntax` is on) | 2 |
| `no-non-null-assertion` | 8 | 78 (58 in source, 20 in tests) |
| `no-explicit-any` | 5 | 65 (64 in source) |
| `no-restricted-syntax` on `enum` | 0 | 0 |
| `no-warning-comments` (`TODO`, `FIXME`) | 0 | 0 |
| `no-console` | 4 (all `console.error` in handlers) | 21 |
| default exports (`import-x/no-default-export`) | 4 | 0 |
| `n/no-process-env` | not run | 35 (21 in source, 14 in tests) |

Brief 27's rule is to bring the owner any rule that finds more than about 20 real problems. Four are over: `no-floating-promises` and `no-misused-promises` in the frontend (event handlers passed async functions, to be confirmed by step 1), `no-non-null-assertion` and `no-explicit-any` in the backend (Kysely result typing, to be confirmed by step 1). Step 1 characterises each before turning it on.

**House-shape counts** (`grep`, 2026-11-10): `enum` 0 in both projects, `TODO`/`FIXME` 0, `@ts-ignore`/`@ts-expect-error` 0, backend default exports 0, frontend default exports 4 (`frontend/src/App.tsx:9`, `frontend/src/core/lib/i18n.ts:20`, `frontend/src/app/modules/auth/components/PhoneVerifyModal.tsx:171`, `frontend/src/app/modules/public-profile/pages/PublicProfilePage.tsx:20`), backend classes 10 (all with parameter properties except the two email services and `FakePaymentProvider`).

**Exact pins.** `backend/` pins every dependency exactly. `frontend/package.json` has 32 caret ranges and 1 tilde (`typescript: "~6.0.2"`), against [corpus/CLAUDE.md](../../CLAUDE.md)'s "exact version pins in every `package.json`" (brief 10 fixed Base UI). There is no `.npmrc` anywhere in the repo.

**Tests.** The backend has 18 test files and 160 tests on vitest 4.1.12, all green once built (scratch copy, 2026-11-10). **`npm test` fails on a fresh clone without a prior build:** with no `core/dist` and no `app/dist`, 9 of 18 files fail to import `@my-olx/core` (`npx vitest run`). The frontend has no tests and no test script.

**Other.** `frontend/src/App.css` is one comment line that nothing imports (`grep -rn "App.css" frontend/src` finds nothing). There is no root `.claude/`. The root `CLAUDE.md` is 98 lines and holds the commands, but not `check`, and none of the hard rules a hand-back needs.

**The Docker image** (`infrastructure/Dockerfile:34-41`) runs `npm ci` in `node:24-alpine` with only `python3 make g++` added, so there is no `git`. A `github:` dependency in `backend/package.json` would break that stage.

## Decisions

Items marked "decided" are final. The rest are defaults this brief builds.

1. **Where the configs come from** (decided 2026-11-10, technical call, Q6). `house-style` is **vendored**: a copy under `vendor/house-style/` at the repo root with a version header (`v1.0.0`), refreshed by a `house-style:sync` script in the root `package.json` that finds the `house-style` checkout by name. No git, `github:` or tarball dependency in either project, so the `apk add` lines in the Dockerfile stay as they are: the image has no `git` and now never needs one. Both projects' ESLint configs import from the vendored copy, and `vendor/house-style/` is in `.prettierignore` and ESLint's ignores.
2. **Width** (decided 2026-11-10, technical call, Q8 and Q51). `printWidth` is **120**, with the measured table kept.
3. **The outliers' quotes and semicolons** (decided 2026-11-10, technical call, Q9). The 48 single-quote frontend files move to double quotes and semicolons in the one reformat commit.
4. **Markdown stays out of Prettier** (decided 2026-11-10, technical call, Q45). `.prettierignore` lists `*.md`.
5. **tsconfig** (decided 2026-11-10, technical call, Q11 and Q50). `strict` (missing from the frontend, 0 errors) and the lineage flags in both projects. The backend's TypeScript 5.7.3 is older than 5.8, so it is **bumped to 6.0.3 first** (step 4), and then `verbatimModuleSyntax` and `erasableSyntaxOnly` apply in the backend (the nine parameter properties become fields). `noUncheckedIndexedAccess` joins the frontend with its one fix, because it costs 1 error; the backend already has it. `exactOptionalPropertyTypes` waits for a count.
6. **Typed lint** (decided 2026-11-10, technical call, Q12 and Q48). The six rules, through `projectService` unless `project` measures faster, with `switch-exhaustiveness-check` at `considerDefaultExhaustiveForUnions: true`. `no-floating-promises` names `node:test`'s functions in `allowForKnownSafeCalls` in the preset; this repo uses vitest, so it never matters here.
7. **The house shapes as errors** (decided 2026-11-10, technical call, Q13, Q47 and Q49). `!` is an **error in source and a warning in tests**, so its 66 source sites (8 frontend, 58 backend) are fixed in step 5, not held as warnings. `console` is allowed in scripts and CLIs. A default export is allowed where a framework needs one (config files, route modules); components use named exports, so `App`, `PhoneVerifyModal` and `PublicProfilePage` move to named exports unless `React.lazy` needs the default, which step 1 checks. `no-process-env` starts as a **warning** in the backend, because its 21 source findings are brief 13's work, and brief 13 turns it into an error. For the other rules over 20 (`no-floating-promises` and `no-misused-promises` in the frontend, `no-explicit-any` in the backend), the brief 27 rule stands: fixed here if step 1 shows they are real, or held as warnings with the count in the outcome note and a follow-up brief.
8. **`check:fast`** (decided 2026-11-10, technical call, Q10). Typecheck plus ESLint on the changed files, in each project, built incrementally. Target about 15 s warm, accepted up to about 30 s where `tsc` alone is slower.
9. **The Claude Code layer** (decided 2026-11-10, technical call, Q7). The plugin's hooks: `Stop` runs `check:fast`, `PostToolUse` formats the saved file.
10. **A root `CLAUDE.md`** (decided 2026-11-10, technical call, Q46). It exists and it is short. It gains the `check` commands and the hard rules from [corpus/CLAUDE.md](../../CLAUDE.md)'s invariants, and stays under about 120 lines.
11. **The frontend's missing tests** (decided 2026-11-10, technical call, Q60). Not in this brief. `check` runs the backend tests, and the frontend has typecheck and lint only. jsdom tests are only for wrappers that hold logic (brief 12 adds a vitest setup for `cn()`), and flows stay in Playwright.

## Files you OWN

- `package.json` (root): the `lint`, `typecheck`, `test`, `check` and `check:fast` scripts.
- `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/eslint.config.js`, and the deletion of `frontend/eslint.config.ts` and `frontend/src/App.css`.
- `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.base.json`, `backend/core/package.json`, `backend/app/package.json` (the TypeScript pin and the `pretest`), and a new `backend/eslint.config.js`.
- New: `vendor/house-style/` (the vendored copy, refreshed by `house-style:sync`), the Prettier config, `.prettierignore`, `.git-blame-ignore-revs`, and `.npmrc` (`save-exact=true`, root plus each project if npm needs it there).
- The reformat itself: whitespace-only changes to every file Prettier covers.
- The fixes the new rules ask for:
  - the nine frontend lint errors above;
  - the backend's `noUnusedLocals` (24), `noImplicitOverride` (1) and parameter properties (9), and the frontend's one `noUncheckedIndexedAccess` error;
  - anything else a typed rule finds, fixed or listed in step 4.
- New: `.claude/rules/web.md`, `.claude/rules/server.md`, and the edit of the root `CLAUDE.md`.
- `scripts/conventions.json` (new), if an exception is needed.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md) (a new entry), [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).

## Files you must NOT touch

- Behaviour. Apart from the fixes listed above, every change is formatting or configuration. The `set-state-in-effect` fixes keep each component's behaviour, and the owner's screenshots at 1280 and 390 px (step 6) show no visible change.
- `backend/app/vendor/` and any generated copy of the Ward library. Both Prettier and ESLint ignore it.
- The layout of `backend/` and the frontend's styling. Those are briefs 13 and 12.
- The skills library and the `house-style` repo. A rule that seems wrong here is reported back, not patched locally.

## What to do

One commit per step, with `npm run typecheck`, `npm test`, `npm run lint` and `npm run build` green after it, apart from step 1 (the lint is red until step 4).

1. **Measure first.** Record these in the `log.md` entry:
   - the typed-rule counts above, re-run on the real tree;
   - for each rule over 20, the files and a one-line characterisation (the pattern, for example async `onClick` handlers or Kysely row typing), so the owner can judge it;
   - lint time with `projectService` against `project`, in both projects;
   - `npx knip` from the `house-style` preset, per project. Expect the unused wrappers `Toast`, `Tooltip`, `CityAutocomplete` and `Chip` (no importer outside their folders, `grep -rn "<Chip" frontend/src` finds none), and `@my-olx/core`'s eight `exports` entries (all 43 imports use the root);
   - `@vitest/eslint-plugin` recommended on the backend tests;
   - whether the router loads any page through `React.lazy` (which needs a default export), for decision 7.
2. **Pins and `.npmrc`.** Add `save-exact=true`. Pin every `frontend/package.json` entry to the version the lockfile resolves, with no version change (`npm ls --depth=0 --json` gives the list, then edit and `npm install`; `git diff frontend/package-lock.json` shows only the root spec lines). Fix the `typescript: "~6.0.2"` tilde the same way. One commit.
3. **Prettier, and the reformat.**
   1. Add `prettier` (pinned) to each project, one shared config at the repo root: `printWidth: 120` (decision 2), `trailingComma: "all"`, the rest default.
   2. Add `.prettierignore`: `*.md`, `backend/app/vendor/`, `package-lock.json`, `dist/`, `data/`, `design/`, `frontend/public/`, `seed-data/`.
   3. Add `format` and `format:check` scripts to both projects and the root, and commit this alone.
   4. Run `npm run format` and commit only that, as `style: format with Prettier`. Do it when no other work is uncommitted.
   5. Put that commit's full hash in `.git-blame-ignore-revs`, in its own commit.
   6. Hand the owner `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
   7. Remove the unwired `eslint-config-prettier` and `eslint-plugin-prettier` from `frontend/package.json`, unless the `house-style` config wants them.
4. **TypeScript.**
   - Backend: bump `typescript` to 6.0.3 in `backend/package.json` **before** adding `erasableSyntaxOnly` (5.7.3 predates it), which compiled clean in the scratch run. Add `noImplicitOverride`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, `isolatedModules` and `erasableSyntaxOnly` to `backend/tsconfig.base.json`. Remove the 24 unused names. Add `override` at `core/src/errors/index.ts:12`. Replace the nine parameter properties with a declared field assigned in the constructor, keeping the `readonly` and each class's behaviour.
   - Frontend: add `strict` and `noUncheckedIndexedAccess` to `frontend/tsconfig.app.json`, and fix `ImageGalleryEditor.tsx:63`.
   - `npm run build` in both projects, and the Dockerfile's `npm run build` stage, still pass.
5. **ESLint.**
   - Delete `frontend/eslint.config.ts` and `frontend/src/App.css`.
   - Extend the house config (decision 1) in both projects, passing each project's roots. Create `backend/eslint.config.js`.
   - The diff in effect:

     | Rule | Today | After |
     |---|---|---|
     | the six typed rules | off | error, through `projectService` |
     | `no-non-null-assertion` | off | error in source, warn in tests |
     | `no-explicit-any` | frontend warn, backend off | error |
     | `no-restricted-syntax` on `TSEnumDeclaration`, `no-warning-comments`, `ban-ts-comment` | off | error |
     | `no-console` outside the CLIs (`seed-dev.ts`, `seed-samples.ts`, `create-owner.ts`, `migrate.ts`, `server.ts`) | off | error |
     | `import-x/no-default-export` | off | error, except `*.config.*`, `i18n.ts`, and the router pages the router needs |
     | `n/no-process-env` in `backend/**` outside `config` and tests | off | **warn**; brief 13 makes it an error |
     | `@vitest/eslint-plugin` recommended on backend tests | off | error |
     | `react-hooks` recommended on `frontend/src` | on, 6 errors from `set-state-in-effect` | unchanged rule, the six sites fixed |

   - Fix the nine frontend errors, behaviour unchanged. The usual remedy for `set-state-in-effect` is to derive the value during render, or to move the setting into the event or subscription that causes it. Where a site cannot be fixed without a behaviour change, record it in `scripts/conventions.json` with the reason, and say so in the outcome note.
   - **The `!` in source** (8 frontend, 58 backend), per decision 7: its own commit per project. Delete a `!` the compiler already types as non-null; narrow a real one with a check or a named error. Behaviour stays. `no-non-null-assertion` is an error in source and a warning in tests at the end.
   - The three other over-20 rules (`no-floating-promises`, `no-misused-promises`, `no-explicit-any`): fix them if the characterisation in step 1 shows real bugs, which for `no-floating-promises` it may. Otherwise set the rule to `warn`, record the count, and write the follow-up as a brief or a todo.
6. **The gate.**
   - `backend/package.json` gains `typecheck` (it exists), `lint`, `format:check`, and `pretest` running `npm run build` (the Round 8 fix: a fresh clone's `npm test` fails without a build).
   - `frontend/package.json` gains `typecheck` (`tsc -b`), `format:check`.
   - The root `package.json`:
     - `lint` runs both projects' lint (today it runs only the frontend);
     - `typecheck` runs both;
     - `test` stays the backend's;
     - `check` runs `typecheck`, `lint`, `format:check`, `check:conventions` and `test`;
     - `check:fast` runs each project's `typecheck` and ESLint on the files changed against `HEAD` plus untracked ones.
   - `check:conventions` is knip, plus the two convention checkers from the vendored `house-style` copy, run `--warn-only` until briefs 12 and 13 are done. `scripts/conventions.json` sets the checkers' roots for this repo: web is `frontend/src`, server is `backend/app/src` and `backend/core/src` (the checkers read roots from the file, not from fixed `web/` and `server/` names). dependency-cruiser joins in brief 13.
   - No shell-only syntax: the owner works on Windows under WSL.
   - Time `check:fast` warm with one changed file, and `check` in full. Record both.
7. **`.claude/rules/`.** Keep each file under about 40 lines.
   - **`web.md`** (`paths: ["frontend/src/**"]`):
     - read the `base-ui` skill;
     - Base UI only through `frontend/src/core/components/ui/<Name>/`, from subpaths;
     - Tailwind utilities, tokens from `@theme` in `frontend/src/index.css`, no new `.css` file;
     - Romanian UI with correct diacritics, copy through i18next (`public/locales/{ro,en}/`);
     - pages in `src/app/modules/<feature>/`, shared code in `src/core/`.
     Brief 12 adds the theme lines.
   - **`server.md`** (`paths: ["backend/**/src/**"]`):
     - read the `code-structure` skill;
     - the core package is a plugin library: it knows nothing about listings or orders;
     - errors are `AppError`, which the one handler maps;
     - the API never serves a paid file from the public uploads folder;
     - dates and money rules are in [wiki/business-rules.md](../../wiki/business-rules.md).
     Brief 13 adds the structure lines.
8. **`CLAUDE.md`.** The root file is 98 lines already. Add, under Commands, `npm run check` before every hand-back, `npm run check:fast`, and `npx vitest run <file>` from `backend/`. Replace "`npm test` # vitest, both workspaces" with the `pretest` truth. Add the places that mislead: `backend/` and `frontend/` have separate lockfiles; the app imports `@my-olx/core` from `core/dist/`; the frontend has no tests. Keep the file under about 120 lines.
9. **Corpus.** Add the [wiki/decisions.md](../../wiki/decisions.md) entry "The house style, formatted and checked", with the width, the config source, and what was rejected. Update [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md). Run `bash corpus/lint.sh`.

## Acceptance

- [ ] `npm run check` passes at the repo root. Its run time and `check:fast`'s, warm with one changed file, are in the outcome note, and `check:fast` is under about 15 s per project or the owner has accepted the time.
- [ ] `npm run lint` at the root lints both projects: `npm run lint 2>&1 | grep -c "eslint"` shows two ESLint runs, or each project's `lint` is named in the output.
- [ ] `npx prettier --check .` passes at the root. The reformat is one commit, and `git diff -w <hash>^ <hash> -- '*.ts' '*.tsx'` shows only quote, semicolon and comma changes, which `-w` does not hide. The hash is in `.git-blame-ignore-revs`.
- [ ] `grep -c '"\^' frontend/package.json` prints `0`, and `grep -c '"~' frontend/package.json` prints `0`.
- [ ] `grep -n strict frontend/tsconfig.app.json` finds the flag. `backend/tsconfig.base.json` has `erasableSyntaxOnly`, and `npm ls typescript` in `backend/` shows 6.0.3 or later.
- [ ] `cd frontend && npx eslint .` reports 0 errors, and `no-non-null-assertion` reports 0 in source in both projects (the 8 and the 58 gone) and only warnings in tests. Every finding left is in the outcome note with its reason.
- [ ] A deliberate `enum`, a `!`, a `console.log` in `backend/app/src/modules/anaf.ts`, a `// TODO` and an `export default` each fail `npm run lint`. Revert them after.
- [ ] In `backend/`, with `core/dist` and `app/dist` deleted, `npm test` passes (18 files, 160 tests or more).
- [ ] `frontend/eslint.config.ts` and `frontend/src/App.css` are gone, and `npm run build` in both projects passes.
- [ ] `.claude/rules/web.md` and `server.md` exist with `paths:` frontmatter, and the root `CLAUDE.md` lists `npm run check`.
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 12 adds `better-tailwindcss` to the frontend config and drops `check-base-ui`'s `--warn-only`. Brief 13 adds dependency-cruiser, drops `check-structure`'s `--warn-only`, and turns `n/no-process-env` into an error.
- The deploy builds the frontend in this checkout (`docs/deploy.md:48`), so the owner reruns `npm install` in `frontend/` after the pins change. Say so in the hand-over note.
- Brief 12 deletes or moves several wrappers that this brief reformats. That is expected: the reformat comes first, so those diffs stay readable.

## Outcome (2026-11-11)

Built with house-style 1.1.0 on `main`, local commits, nothing pushed: vendor and pins `1f33e35`, frontend pins `be14bca`, Prettier config `16a912e`, the reformat `0553f6a`, blame ignore `cd1583f`, backend TypeScript 6.0.3 `124241d`, tsconfig flags and parameter properties `6f35f43`, backend lint `9a97534`, frontend lint `e77c4e2`, root lint `a599da5`, the gate `8c9c679`, `CLAUDE.md` and rules `2154bfd`, then this closeout.

**Layout.** As ro-housing: the root `package.json` holds `vendor/house-style/`, the twelve exact tool pins, `check`, `check:fast`, `check:conventions`, `format` and `house-style:sync`; `backend/` and `frontend/` keep their lockfiles, each with its own `eslint.config.js`, `knip.config.js`, `lint`, `knip` and `check:fast`; the root has its own `eslint.config.js` for `scripts/` and `docs/images`. `.npmrc` (`save-exact=true`) is in all three.

**The reformat.** 238 files, 3,494 lines added, 5,012 removed. Bundle compare (esbuild minify, 300 files: TS, TSX, JS, MJS, CSS through the `css` loader, JSON parsed): 296 identical, 4 differ. Three are JSX text Prettier splits with `{" "}` (`EarningsSection.tsx`, `TermeniPage.tsx`, `SettingsPage.tsx`: a trailing space before an element moved into the text), the same rendered text. One is `index.css`: `rgba(0,0,0,0.06)` became `rgba(0, 0, 0, 0.06)`, same value. `infrastructure/` and `docs/images/demo-previews.html` are in `.prettierignore` (Prettier rewrote a healthcheck's quoting, and the page is a capture helper).

**Rule counts, before then after** (frontend / backend):

| Rule | Before | After |
|---|---|---|
| `no-floating-promises` | 30 / 0 | 0 / 0 (`void` added) |
| `no-misused-promises` | 49 / 0 | 49 warnings / 0 |
| `await-thenable`, `switch-exhaustiveness-check` | 0 / 0 | 0 / 0 |
| `no-unnecessary-type-assertion` | 11 / 37 | 0 / 0 |
| `no-non-null-assertion`, source | 8 / 58 | 0 / 0 |
| `no-non-null-assertion`, tests | 0 / 20 | 0 / 19 warnings |
| `no-explicit-any` | 5 / 65 | 0 / 63 + 1 test, warnings |
| `no-console` outside CLIs | 4 / 10 | 0 (4 reasoned disables) / 6 warnings |
| `import-x/no-default-export` | 4 / 0 | 0 / 0 (`i18n.ts` allowed) |
| `n/no-process-env` | n/a / 21 | n/a / 11 warnings (the config module is the reader) |
| `react-hooks/set-state-in-effect` + `preserve-manual-memoization` | 7 / n/a | 0 (1 reasoned disable) |
| `exhaustive-deps`, `incompatible-library` | 8, 4 / n/a | 4, 4 warnings |
| other (`consistent-type-imports`, unused vars, `preserve-caught-error`, `no-useless-assignment`, `prefer-called-exactly-once-with`) | 3 / 9 | 0 / 0 |

**Held as warnings** (dated blocks in the ESLint configs, follow-up in [todos/house-style-warnings.md](../../todos/house-style-warnings.md)): frontend `no-misused-promises` 49, backend `no-explicit-any` 63 + 1, `n/no-process-env` 11, `no-console` 6 (three files that run outside a request and have no logger). The three rules over 20 characterised: floating promises were `invalidateQueries` and handler calls without `void` and are fixed; misused promises are async handlers on attributes; the backend `any` is untyped rows and bodies.

**The `!`** are fixed: 51 backend `request.userId!` became `requireUserId(request)` (`backend/app/src/auth-user.ts`, answers 401 where it would have run with an undefined id); the others narrow with a guard or a default. Frontend `id!` and the asserts the compiler already knew were deleted. One commit per project, not a separate commit for the `!`: they share the lint commit.

**The nine frontend errors.** `Dropdown.tsx`'s `react-refresh` error is gone because the house config has no `react-refresh`. `Chip.tsx` takes `variant: _variant`. The six `set-state-in-effect` sites: `CookieConsent` initialises from `localStorage`; `Slider`, `CreateListingWizard` and `ProfileSection` adjust state during render when their inputs change; `OrderConfirmationPage` derives the no-order-id error; `GlobalLoadingIndicator` keeps its effect with a reasoned `eslint-disable-next-line`, because the 200 ms exit animation outlives the router status. `ListingDetailPage`'s `useMemo` reads `expiresAt` into a local first. No behaviour is meant to change; no screenshots were taken at 1280 or 390 px, so that check is the owner's.

**Checkers.** `check-base-ui --warn-only`: 2 errors, 1 warning (rule 5 `frontend/src/index.css`, rule 11 `alert()` in `PasswordSection.tsx:29`, rule 9 `Dropdown.tsx:37`). `check-structure --warn-only`: 116 errors, 5 warnings (rule 2 ×2, rule 3 ×22, rule 6 ×92, rule 11 ×5). dependency-cruiser: 0 violations over 315 modules with `frontend/tsconfig.app.json` for the aliases; no rule lowered. knip: clean after dated exceptions for 12 unused frontend files, `@tanstack/router-devtools`, `pino` and `@fastify/multipart`; unused exports are warnings (3 + 4 backend, 58 + 19 frontend).

**Timings** (warm): `check:fast` with one file changed, 18 to 21 s for both projects (about 10 s each, over the 15 s per project target only in total); `npm run check`, 56 to 68 s.

**Checks run:** `npm run check` (exit 0, 160 backend tests in 18 files), `npx prettier --check .` (0), `npm run house-style:sync -- --check` (0), `npm run build` in both projects, the backend `npm test` with `core/dist` and `app/dist` deleted (160 pass), a scratch copy of what the Dockerfile copies (`npm ci --ignore-scripts`, `npm run build`: exit 0), `bash corpus/lint.sh` (ok). Deliberate violations, each making `npm run lint` exit 1 and reverted: `enum` (both projects), `!` (both), `console.log` in `backend/app/src/modules/anaf.ts` and in the frontend, `// TODO` and `// FIXME`, `export default` (both).

**Checks skipped:** the live-session hook check waits for the plugin update; no `docker build` (local Docker fails on I/O); no browser screenshots; a per-project `format:check` (Prettier reads `.prettierignore` from the folder it runs in, so formatting is checked once, from the root).

**Deviations:**

- The copy and the tool pins are at the root, not per project, because the vendored ESLint config resolves its plugins from where it sits (the skill's two-project rule). The frontend's own ESLint and Prettier packages are gone from `frontend/package.json`.
- `backend/tsconfig.base.json` holds the house flags itself instead of extending the vendored base (`backend/tsconfig.base.json:2`): the Dockerfile copies only `backend/`.
- `core` and `app` write their `tsBuildInfoFile` into `dist/` (`backend/core/tsconfig.json`, `backend/app/tsconfig.json`), so a deleted `dist/` forces a rebuild and `pretest` (`npm run build`) works on a tree that has built before. The file now ships in the image's `dist/`.
- `format` and `format:check` are root scripts only.
- The 24-name `noUnusedLocals` list included dead code, deleted: three auth schemas, `DownloadResponse`, `getFileExtension` and others; `validateUblInvoice` and `repo.upsert` kept as bare calls.
- The backend `console` globs add `create-server.ts` (it logs before the logger exists) and `core/src/email/index.ts` (the log-only email service prints by design).
- `CLAUDE.md` is 130 lines, over the "about 120" target.

**Owner steps:** `git config blame.ignoreRevsFile .git-blame-ignore-revs`; `npm install` in `frontend/` after pulling (the pins changed and the ESLint packages left); `node cli.ts piataro deploy` from the vps-deploy checkout.
