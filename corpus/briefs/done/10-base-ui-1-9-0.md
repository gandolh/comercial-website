# Task 10: Base UI 1.9.0

**Depends on:**

- In comercial-website: nothing. This brief runs first, so a visual or behavioural change in the later briefs is never blamed on the bump.
- In the owner's skills library: nothing is needed to build it. It is this repo's row of the brief *Every repo on Base UI 1.9.0*, and replaces it for this repo.

**Runs before:** 11, 12 and 13.

## Context

On 2026-11-09 the owner decided that every web app they own runs `@base-ui/react` at the latest stable release, **1.9.0**, pinned exactly. On 2026-11-10, `npm view @base-ui/react dist-tags --json` printed only `"latest": "1.9.0"`. The frontend is on 1.4.1, behind a `^` range.

### The pin today (read 2026-11-10)

Command: `grep -rn "base-ui" --include=package.json . | grep -v node_modules`.

| File | Spec |
|---|---|
| `frontend/package.json:13` | `"^1.4.1"`, a caret range |
| `backend/package.json`, `backend/core/package.json`, `backend/app/package.json`, root `package.json` | none |

The frontend lockfile resolves `node_modules/@base-ui/react` at 1.4.1 (`frontend/package-lock.json:298-299`), with `@base-ui/utils` 0.2.8 (`frontend/package-lock.json:336-337`). There is one copy, hoisted. The rest of `frontend/package.json` is on carets too (32 of its 33 entries, `grep -cE '": "\^' frontend/package.json`), which breaks the corpus invariant "exact version pins in every `package.json`" ([corpus/CLAUDE.md](../../CLAUDE.md)). This brief pins Base UI only. Brief 11 pins the rest.

### The two breaking changes do not touch this repo

1.9.0 renamed `OTPFieldPreview` to `OTPField` (`@base-ui/react/otp-field`) and `sanitizeValue()` to `normalizeValue()`. Command: `grep -rnE "OTPFieldPreview|otp-field|sanitizeValue" frontend/src` printed nothing on 2026-11-10.

### Measured on a scratch copy, 2026-11-10

On a scratch copy of the repo (`npm ci --ignore-scripts` in `frontend/`, then `npm install @base-ui/react@1.9.0 --save-exact --ignore-scripts`), npm 11.19.1, Node 24.22.1:

- `frontend/package.json` changed on one line: `"@base-ui/react": "1.9.0"`. Nothing else in the file moved.
- **The lockfile nests two copies of `@babel/runtime`.** 1.9.0 asks for `^7.29.7 || ^8.0.0`. The hoisted `@babel/runtime` is 7.29.2, so npm put 8.1.0 under `node_modules/@base-ui/react/node_modules/` and under `node_modules/@base-ui/utils/node_modules/`. The package count went from 314 to 316. `@base-ui/react` itself stays hoisted at `node_modules/@base-ui/react`. A step 3 check that reads that key still works.
- Versions that changed in the lockfile:

  | Package | Before | After |
  |---|---|---|
  | `@base-ui/react` | 1.4.1 | 1.9.0 |
  | `@base-ui/utils` | 0.2.8 | 0.5.0 |
  | `@floating-ui/core` | 1.7.5 | 1.8.0 |
  | `@floating-ui/dom` | 1.7.6 | 1.8.0 |
  | `@floating-ui/react-dom` | 2.1.8 | 2.1.9 |
  | `@floating-ui/utils` | 0.2.11 | 0.2.12 |
  | `reselect` | 5.1.1 | 5.3.0 |
  | `use-sync-external-store` | 1.6.0 | 1.7.0 |

- `npx tsc -b`: 0 errors before and after.
- `npx eslint .`: 28 problems (9 errors, 19 warnings) before and after. They are the old errors brief 11 fixes; the bump adds none.
- `npx vite build`: succeeds after the bump (642 ms).
- Peer dependencies of 1.9.0 (`npm view @base-ui/react@1.9.0 peerDependenciesMeta --json`): `date-fns`, `@date-fns/tz` and `@types/react` are all optional, so nothing new is required. `react` and `react-dom` ask for `^17 || ^18 || ^19`, and the repo is on 19.2.5 or later.

**Not measured here, so step 1 measures it:**

- The 1.4.1 to 1.9.0 changelog. GitHub was not read in the session that wrote this brief.
- Behaviour in a browser.
- A build baseline from before the bump, for the size comparison in step 4.

### What the frontend uses

Seven wrappers in `frontend/src/core/components/ui/<Name>/` import Base UI. They are the only importers (`grep -rn "@base-ui" frontend/src`):

| Wrapper | Import | What it uses | Callers |
|---|---|---|---|
| `ConfirmDialog/ConfirmDialog.tsx:1` | `@base-ui/react/alert-dialog` | `Root` (`open`, `onOpenChange`), `Portal`, `Backdrop`, `Popup`, `Title`, `Description`, `Close` with a `render` function | `frontend/src/app/modules/dashboard/pages/MyListingsPage.tsx:334` |
| `Dropdown/Dropdown.tsx:1` | `@base-ui/react/menu` | `Root`, `Trigger` with a `render` function, `Portal`, `Positioner` (`side`, `align`, `sideOffset`), `Popup`, `Item` with a `render` function, `Separator` | `frontend/src/core/components/layout/Navbar.tsx:101` |
| `Tabs/Tabs.tsx:1` | `@base-ui/react/tabs` | `Root`, `List`, `Tab`, `Panel`; the `data-[active]` attribute | `MyListingsPage.tsx` |
| `Slider/Slider.tsx:2` | `@base-ui/react/slider` | `Root` (`onValueChange`, `onValueCommitted`), `Control`, `Track`, `Indicator`, two `Thumb`s | `frontend/src/app/modules/categories/components/FilterSidebar.tsx:1` |
| `SearchAutocomplete/SearchAutocomplete.tsx:2` | `@base-ui/react/autocomplete` | `Root` (`items`), `InputGroup`, `Input`, `Clear`, `Portal`, `Positioner`, `Popup`, `Empty`, `List`, `Item` | one caller |
| `CityAutocomplete/CityAutocomplete.tsx:2` | `@base-ui/react/autocomplete` | the same parts | none today |
| `Tooltip/Tooltip.tsx:1` | `@base-ui/react/tooltip` | `Provider` (`delay`), `Root`, `Trigger` with a `render` function, `Portal`, `Positioner`, `Popup` | none today |

## Owner decisions (defaults this brief builds)

1. **Pin 1.9.0 exactly.** Default: yes, through `npm install ... --save-exact`. No range.
2. **Nothing else moves.** Default: no general `npm update`, no other dependency. The lockfile diff is Base UI's own tree and nothing else.
3. **A visual change the bump causes** is logged in the outcome note and left. It is not restyled here. Brief 12 owns the wrappers. Under the owner's call of 2026-11-10 (Q19, "close enough"), a drift of a few pixels is not a change to log.

## Files you OWN

- `frontend/package.json` (the one line) and `frontend/package-lock.json`.
- A source file only if a breaking or behavioural change forces it. Expect none: the typecheck passes on the scratch copy.
- [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).

## Files you must NOT touch

- Every other dependency in `frontend/package.json`. Brief 11 pins them.
- `backend/`, `infrastructure/` and the root `package.json`.
- The wrappers' props. A fix the bump forces keeps each wrapper's public API.
- Styling.

## What to do

One commit for the bump, `chore(deps): @base-ui/react 1.9.0`. You record the baseline first.

1. **Baseline and changelog.**
   - In `frontend/`, run `npm ci`, then `npx tsc -b`, `npm run lint` and `npm run build`. Record the results. Expect 0 type errors, 28 lint problems (9 errors, 19 warnings), and a green build. Record the size of the largest file in `dist/assets/`.
   - Read the `@base-ui/react` release notes from v1.4.1 to v1.9.0. Write one line per wrapper in the outcome note: either "nothing in these notes touches what the wrapper uses", or the note and what you checked. Look at focus, dismissal, animation and positioning changes in `AlertDialog`, `Menu`, `Tabs`, `Slider`, `Autocomplete` and `Tooltip`.
2. **Re-run the grep** for `OTPFieldPreview`, `otp-field` and `sanitizeValue`. Expect no hits.
3. **Install.** In `frontend/`: `npm install @base-ui/react@1.9.0 --save-exact`. Then check that the lockfile resolves 1.9.0 and that only the entries in the table above changed, plus the two nested `@babel/runtime` entries:

   ```
   node -e "const p=require('./package-lock.json').packages;console.log(Object.entries(p).filter(([k])=>/@base-ui\/(react|utils)$/.test(k)).map(([k,v])=>k+' '+v.version))"
   ```

4. **Scripts.** `npx tsc -b`, `npm run lint` and `npm run build` again. The lint count must equal the baseline. Fix only what the bump broke. Record the largest file in `dist/assets/` again.
5. **Behaviour in a browser.** Start the API (`npm run dev` in `backend/`, with sample data from `npm run seed:samples`) and the frontend (`npm run dev` in `frontend/`). Check each component at 1280 and 390 px wide, with the keyboard and with the pointer. Write down anything that differs from 1.4.1.

   | Component | Where to see it | Check |
   |---|---|---|
   | `ConfirmDialog` | the delete or deactivate action on a listing in My listings (`MyListingsPage.tsx:334`) | opens, Esc and Cancel close it, Tab stays inside, focus returns to the button, the confirm button shows its loading state |
   | `Dropdown` | the profile button in the navbar (`Navbar.tsx:101`) | opens on click and Enter, arrows move the highlight, Esc closes, a link item navigates, the popup sits under the button and does not clip at 390 px |
   | `Tabs` | My listings | arrows move between tabs, the active tab shows its underline (`data-[active]`), the panel changes |
   | `Slider` | the price filter on a category page (`FilterSidebar.tsx`) | both thumbs drag and move with the arrow keys, the debounced change fires once after a drag, a reset from the parent moves the thumbs |
   | `SearchAutocomplete` | the search box | suggestions open as you type, arrows and Enter choose, Clear empties the field, the empty message shows when nothing matches |
   | `CityAutocomplete`, `Tooltip` | not mounted anywhere | compile only; say so in the outcome note |

6. **Commit** with the message above. Then update [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md) in one corpus commit, and run `bash corpus/lint.sh`.

## Acceptance

- [ ] `node -p "require('./frontend/package.json').dependencies['@base-ui/react']"` prints `1.9.0`.
- [ ] The step 3 command prints `node_modules/@base-ui/react 1.9.0` and `node_modules/@base-ui/utils 0.5.0`, and no other `@base-ui` version.
- [ ] `grep -rnE "OTPFieldPreview|otp-field|sanitizeValue" frontend/src` prints nothing.
- [ ] `git diff --stat HEAD~1` for the bump commit lists only `frontend/package.json` and `frontend/package-lock.json`, unless a forced fix is named in the outcome note.
- [ ] In `frontend/`, `npx tsc -b` prints nothing, `npm run lint` reports the same 28 problems as the baseline, and `npm run build` succeeds.
- [ ] The outcome note has one changelog line per wrapper and the behaviour table's result, or "no difference found".
- [ ] `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 11 pins the other 32 dependencies of `frontend/package.json` and adds `.npmrc`. Run it after this one, so its lockfile diff holds no Base UI change.
- The deploy builds the frontend in this checkout's `frontend/` (`docs/deploy.md:48`), so the owner runs `npm install` there after pulling. The lockfile moves, so that is a reminder for the hand-over note.
- Brief 12 starts from a tree already on 1.9.0, so the `Dialog`, `Switch`, `Toast`, `RadioGroup` and `Accordion` APIs it needs are the 1.9.0 ones.

## Outcome (2026-11-10)

Pinned `@base-ui/react` at exactly 1.9.0 in `frontend/package.json` (commit c4dd42c); only that line changed. The lockfile resolves `@base-ui/react` 1.9.0 and `@base-ui/utils` 0.5.0, one copy each. Baseline and after: `npx tsc -b` clean, lint 28 problems (9 errors, 19 warnings), build green. Largest asset 599,488 bytes before, 604,426 after. The OTPField and `sanitizeValue` grep prints nothing.

Changelog lines per wrapper: not read (GitHub not reachable). Browser behaviour table: not run. Both are left for the owner's smoke test after the deploy. `CityAutocomplete` and `Tooltip` are not mounted, so they are compile-checked only.
Owner reminder: run `npm install` in `frontend/` after pulling, since the lockfile moved.
