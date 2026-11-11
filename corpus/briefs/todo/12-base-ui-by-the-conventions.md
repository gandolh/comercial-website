# Task 12: Base UI by the conventions, and a theme switch

**Depends on:**

- In comercial-website: brief 10 (Base UI at 1.9.0) and brief 11 (the gate, the formatter, `.claude/rules/web.md`).
- In the owner's skills library:
  - brief 02, *A base-ui skill, styled with Tailwind*: rules 1-13, the references and `check-base-ui.mjs`;
  - brief 15, *Enforce the base-ui and code-structure skills in every repo*: the checker runs `--warn-only` until this brief is done.
- The owner's answers of 2026-11-10: Q18 (dark mode), Q19 (visual parity), Q40 (phone menu), Q58 (form dialogs and confirms). Its technical calls: Q15 (Base UI only under `ui/`), Q16 (where native controls stay), Q41 and Q57 (always-one-chosen controls), Q59 (where wrappers live), Q60 and Q62 (tests). The questions left open are in "Decisions".

**Runs before:** nothing in this repo. The repo is already on Tailwind v4, so there is no migration brief: the styling findings are in step 9 of this one.

## Context

The owner's call of 2026-11-09 is Base UI everywhere at 1.9.0, styled with Tailwind, with the base-ui skill's conventions enforced in each repo. comercial-website is already on Tailwind v4 (`@import "tailwindcss"` and an `@theme` block in `frontend/src/index.css`, with Material 3 colour roles). This brief closes the gaps the audit below found. On 2026-11-10 the owner also decided two things that shape it:

- **Visual parity is "close enough" (Q19).** Screenshots at 1280 and 390 px, before and after, must show no visible change to layout or colour in the light theme. A few pixels of drift in spacing or rounding need not be fixed or listed.
- **Every app gets a Light / Dark / System switch (Q18).** It is kept where the app keeps its other settings, which here is the device (`localStorage`). A first visit shows the light theme and does not follow the system. `dark:` keys off a `data-theme` attribute through `@custom-variant` (Postern's method), not `prefers-color-scheme`. Step 10 adds it.

### What the repo has today for dark mode (read 2026-11-10)

Nothing. `grep -rniE "dark:|prefers-color-scheme|data-theme|color-scheme" frontend/src frontend/index.html` finds only the Vite starter logo's own `<style>` (`frontend/src/assets/vite.svg`). The `@theme` block in `frontend/src/index.css:6-76` has light values only, as Material 3 roles (`surface`, `on-surface`, `primary`, `inverse-surface` and the rest). The design mockups in `design/code/*.html` use `darkMode: "class"` with `dark:bg-slate-900` classes, which the app never took. The design system file has no dark scheme (`design/design-system/carpathian-clear.json`), and [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md) lists "Dark mode planned?" as an open question. So dark values are a taste call, not something to copy from the repo (decision 3).

Because the colours are semantic roles, a dark theme can redefine the roles and leave most class names alone. What blocks it are the hard-coded colours (step 9).

### The pin (verified 2026-11-10, after brief 10)

`frontend/package.json` pins `@base-ui/react` at 1.9.0 exactly once brief 10 is done. This brief does not touch the pin.

### The audit against rules 1-13 (2026-11-10)

| Rule | Violations | Where |
|---|---|---|
| 1. Exact pin | 1, fixed by brief 10 | `frontend/package.json:13` |
| 2. Subpath imports | 0 | All 7 imports are subpaths: `alert-dialog` (`frontend/src/core/components/ui/ConfirmDialog/ConfirmDialog.tsx:1`), `slider` (`Slider/Slider.tsx:2`), `tooltip` (`Tooltip/Tooltip.tsx:1`), `menu` (`Dropdown/Dropdown.tsx:1`), `autocomplete` (`SearchAutocomplete/SearchAutocomplete.tsx:2`, `CityAutocomplete/CityAutocomplete.tsx:2`), `tabs` (`Tabs/Tabs.tsx:1`). Command: `grep -rn "@base-ui" frontend/src`. |
| 3. Base UI only under a `ui/` folder | 0 | All 7 sit under `frontend/src/core/components/ui/<Name>/`. The layout is one folder per wrapper with an `index.ts` and a barrel `ui/index.ts`. The skill's example path is `ui/<Name>.tsx`, but its checker tests only for a `ui/` directory, so the layout passes. Q59 is about feature folders and doesn't apply. See decision 1. One caller bypasses the barrel: `frontend/src/app/modules/categories/components/FilterSidebar.tsx:1` (`@core/components/ui/Slider`). |
| 4. Tailwind on the parts, no class selector at a part | 0 | There is no CSS aimed at a part. `index.css` has 5 rules, none of them for Base UI markup. State attributes are used as variants: `data-[highlighted]` (`Dropdown.tsx:26`), `data-[active]` and `group-data-[active]` (`Tabs.tsx:30, 41`). The positioner variables (`--anchor-width`, `--available-height`) are not used yet. |
| 5. One stylesheet, no inline `style` except computed geometry | **87 inline `style={}`** | `frontend/src/index.css` is the one stylesheet. `frontend/src/App.css` is an empty stub nothing imports (brief 11 deletes it). The 87 `style` props: 47 set `fontFamily: var(--font-headline)`, 31 set `fontSize` (`"48px"`, `"28px"`, `"20px"`, `"18px"`), 3 are computed bar widths (`width: ${progress}%`, which rule 5 allows), 6 are `fontVariationSettings` and other one-offs (for example `ReviewsSection.tsx:44`). Commands: `grep -rn "style={" frontend/src --include=*.tsx`, then the same with `fontFamily` and `fontSize`. |
| 6. Semantic tokens only | **23 + 4 + 13** | 23 `bg-white`, `text-white`, `border-white` and black classes (`grep -rnoE "\b(bg|text|border)-(white\|black)\b" frontend/src`), among them `ConfirmDialog.tsx:30-31`. 4 raw palette classes (`grep -rnoE "\b(bg\|text\|border\|ring)-(yellow\|red\|green\|blue\|gray\|slate\|amber)-[0-9]+" frontend/src`), for example the rating star's `hover:text-yellow-400` (`ReviewsSection.tsx:40`). 13 lines with `rgba(` shadows or focus rings, for example `Input.tsx:47, 49`, `Select.tsx:53, 55`, `Textarea.tsx:34, 36`, `PriceInput.tsx:48, 50`, `CityAutocomplete.tsx:90`, `SearchAutocomplete.tsx:101`, `PricingCard.tsx:63`, `HomePage.tsx:59`, `ListingGrid.tsx:76` (`grep -rnE "rgba\(" frontend/src --include=*.tsx`). |
| 7. Motion through the state attributes | all popups | No wrapper uses `data-starting-style` or `data-ending-style`. The hand-built toast animates with `transition-all` on an `open` prop (`Toast.tsx`). |
| 8. Floating parts portalled, z from tokens | 0 portal, 9 raw z | Every Base UI popup goes through its `Portal`. The z-indexes are raw `z-50` ×9 and `z-10` ×3 with no token scale. `Tooltip.tsx:15` puts `z-50` on the popup instead of the positioner. The navbar is `z-50` too (`frontend/src/core/components/layout/Navbar.tsx:49`). |
| 9. A trigger around a component uses `render` | **2** | `Dropdown.tsx:37` renders a `<span>` as the menu trigger and puts the caller's own `<button>` inside it (the profile button, `Navbar.tsx:103-114`). The span gets the menu's ARIA and handlers and the button gets none, so the trigger is a non-button with a button in it. `Tooltip.tsx:15` does the same with a span. The fix is `render={<button …/>}`, with the caller's node as the `render` element. |
| 10. `Select.Root` with `items` | 0 | There is no Base UI `Select`. See rule 13. |
| 11. No `window.confirm`, `alert` or `prompt` | **1** | `frontend/src/app/modules/settings/components/PasswordSection.tsx:29` calls `alert("Parola a fost schimbată cu succes!")`. |
| 12. Dialogs | **2 hand-built, 1 with a defect** | `ConfirmDialog` (`ConfirmDialog.tsx`) has a `Title` and a `Description`, and its Esc and outside press call `onClose` even while `loading` is true (line 28, no guard). Its Cancel button runs `onClose` twice, once through `onOpenChange` and once through its own `onClick` (line 41). Its one caller passes no `loading` (`MyListingsPage.tsx:334-350`), so nothing breaks today. **`Modal`** is hand-built (rule 13) and has none of the dialog behaviours: no focus trap, no focus return, no portal, a document-level Escape listener (`Modal.tsx:19-30`) that closes the modal even when a control inside already used the key, a fixed `id="modal-title"` (line 57) that clashes if two are ever mounted, a `document.body.style.overflow` write (line 25). Both its callers hold a form: `frontend/src/app/modules/messaging/components/ContactSellerModal.tsx:48` and `frontend/src/app/modules/auth/components/PhoneVerifyModal.tsx:70`. Under Q58 a form dialog sets `disablePointerDismissal`. |
| 13. Base UI over hand-built widgets | **6 groups** | See below. |

**Rule 13's groups**, with what stays and why:

1. **`Modal`**, `frontend/src/core/components/ui/Modal/Modal.tsx`: becomes Base UI `Dialog`, as the skill's `dialog.md` has it. Two callers.
2. **The toast.** Two systems exist. `sonner` does the real work: 10 files and 27 `toast.*` calls, mounted at `frontend/src/App.tsx:19` (`<Toaster position="top-center" richColors />`), plus one `toast.custom` for `AuthRequiredToast` (`FavoriteToggle.tsx:40`). The hand-built `Toast.tsx` has no caller at all (`grep -rn "<Toast" frontend/src` finds only `AuthRequiredToast`). See decision 2.
3. **The switch** in `frontend/src/app/modules/bundles/components/BundleManagerSection.tsx:128-131`: a `<button role="switch">` with `aria-checked`, styled by hand. It becomes Base UI `Switch`.
4. **Native checkboxes and radios**: 6 checkboxes (`PriceInput.tsx:63`, `BundleManagerSection.tsx:196`, `PriceStep.tsx:92`, `LocationPriceStep.tsx:92`, `FilterSidebar.tsx:144`, `ReviewStep.tsx:240`) and 3 radios (`FilterSidebar.tsx:59, 85, 122`). Command: `grep -rn 'type="checkbox"\|type="radio"' frontend/src`. No decision keeps them native, and the skill lists checkbox among the widgets that start from Base UI. They become `Checkbox` and `RadioGroup`.
5. **The star rating** in `frontend/src/app/modules/reviews/components/ReviewsSection.tsx:28-60`: spans with `role="radio"`, `aria-checked` and an Enter/Space handler, in a `role="radiogroup"`. It has no arrow keys. It becomes `RadioGroup`.
6. **The FAQ accordion** in `frontend/src/app/modules/legal/pages/AjutorPage.tsx:126`: buttons with `aria-expanded`. It becomes Base UI `Accordion`.
7. **The two native `<select>`s**, through the `Select` wrapper (`Select/Select.tsx:45`): `frontend/src/app/modules/categories/components/SortBar.tsx:50` and `frontend/src/app/modules/invoices/components/CreateInvoiceForm.tsx:335`. They stay native on phones (decision 4), so this group needs no work.

**Considered and left:**

- **`CookieConsent`** (`frontend/src/core/components/ui/CookieConsent.tsx:34`): a non-modal banner with `role="dialog"` and `aria-modal="false"`. Base UI has no banner part, and a modal `Dialog` would be wrong. Left, and recorded as an exception.
- **`Pagination`, `Alert` (`role="alert"`), `ProgressBar` (`role="progressbar"`), `Skeleton`, `Card`, `Badge`, `Avatar`, `Divider`, `EmptyState`**: not interactive widgets that Base UI covers, or static.
- **`Chip`** (`Chip/Chip.tsx:25`, `aria-pressed`): no caller (`grep -rn "<Chip" frontend/src` finds none). If knip in brief 11 flags it, delete it there. Otherwise leave it.
- **Unused wrappers**: `Toast`, `Tooltip` and `CityAutocomplete` have no callers either. They get the rule fixes (rule 9, the `z` token) so they are right when used, or are deleted if brief 11's knip run lists them and the owner agrees.
  _2026-11-11:_ brief 11 wired knip. The unused files (a dozen, none of them wrappers) and the unused `@tanstack/router-devtools` dependency sit in `frontend/knip.config.js`'s `ignore` and `ignoreDependencies`, each with a dated note. The unused wrappers (`Toast`, `Tooltip`, `CityAutocomplete`, `Chip`) are only warnings (unused exports), so deleting one needs no config change. `check-base-ui` reports 2 errors and 1 warning today (rule 5 `frontend/src/index.css`, rule 11 `alert()` at `PasswordSection.tsx:29`, rule 9 `Dropdown.tsx:37`); it runs `--warn-only` until this brief drops the flag.
- **Phone menu (Q40, decided 2026-11-10, owner).** Phone navigation panels move to Base UI's `Drawer`, closed by a swipe too. The navbar hides its links below `md` (`Navbar.tsx:58`, `hidden md:flex`) and has no phone panel, so there is no panel to move. Adding one is a feature, not part of this brief, and if it is ever built it is a `Drawer`.
- **Confirms (Q58, decided 2026-11-10, owner).** Inline "Delete? Yes / No" confirms stay inline in Satchel and Shelfmark. This repo's confirm is already an `AlertDialog`, and stays one.

## Decisions

Items marked "decided" are final. The rest are defaults this brief builds.

1. **The wrapper folder layout** (decided 2026-11-10, technical call, Q59, Q15). The folder-per-wrapper layout stays: `frontend/src/core/components/ui/<Name>/<Name>.tsx` with an `index.ts` per folder. The checker's rule 3 passes on it, and moving 26 folders would only churn imports. New wrappers follow the same layout. Base UI is imported only under `ui/`.
2. **The toast system** (decided 2026-11-10, technical call, Q15 and rule 13). The third-party `sonner` toasts move to Base UI `Toast`, behind a small `toast` object in `ui/Toast/` that keeps the call shape the 27 sites use (`toast.success(message)`, `.error`, `.info`, `.warning`, and `.custom`). Then only the import line changes at each site, and `sonner` leaves `package.json`. Keeping `sonner` is rejected: it injects its own CSS at run time, which rule 5's one stylesheet can't hold.
3. **Dark palette values.** Default: derive them from the existing roles, anchored on the `inverse-surface` (`#2e3038`), `inverse-on-surface` (`#f0f0fb`) and `inverse-primary` (`#b2c5ff`) tokens, with the surface ladder inverted and `primary`, `secondary`, `tertiary` and `error` lightened for contrast. Check each text and surface pair against WCAG AA (4.5:1). *Question for the owner: dark values are taste, and the repo holds none. Look at the screenshots from step 10 and say what to change.*
4. **The two `<select>`s** (decided 2026-11-10, technical call, Q16). A native `<select>` stays native on phones, and both of these are used on phones (Android is the main phone). `SortBar.tsx:50` and `CreateInvoiceForm.tsx:335` keep the native `Select` wrapper; no Base UI `Select` is added. The decision is recorded in [wiki/decisions.md](../../wiki/decisions.md) and `scripts/conventions.json`, and rule 10 has nothing to check.
5. **The theme control** (decided 2026-11-10, technical call, Q41 and Q57). A `RadioGroup` with three options (Light, Dark, System), always one chosen, placed in the footer so it is reachable signed out. The choice is kept on the device only, with no save request per pick, so it is a radio group and not the guarded `ToggleGroup` that a choice saved to a server uses. The public site is browsed read-only without signing in, and only the owner has an account. It is not in the navbar's profile menu.
6. **An `Icon` wrapper for Material Symbols.** Default: no. `frontend/src/index.css:102-107` sets `font-size: 24px` on `.material-symbols-outlined` outside any layer, so an unlayered rule beats every `text-*` utility on an icon. That is why 31 sites carry an inline `fontSize`. Moving the rule into a layer would change the size of every icon that today carries a `text-*` class that loses, which breaks parity. So the rule stays, with a comment, and the 31 `fontSize` styles stay as a recorded exception. An `Icon` component with a `size` prop would fix both, but it touches 66 files. The owner can ask for it as a brief.
7. **Native controls** (decided 2026-11-10, technical call, Q16). Native text, number, date and file inputs, and the native `<select>` on phones, stay native.
8. **Form dialogs and confirms** (decided 2026-11-10, owner, Q58). A dialog that holds a form sets `disablePointerDismissal` and closes with Cancel, the X or Esc: `Modal` does, for its two form callers. `ConfirmDialog` stays an `AlertDialog`; no inline confirm exists here to change.

## The wrapper set: `frontend/src/core/components/ui/`

| Folder | What it is | From |
|---|---|---|
| `Modal/` | Base UI `Dialog`: `open`, `onClose`, `title`, `size`, `className`, `children` as today; the Escape guard, `initialFocus` in the skill's order, `disablePointerDismissal` on, a `Title`, a close button with `aria-label` | `Modal/Modal.tsx`, rebuilt |
| `ConfirmDialog/` | Base UI `AlertDialog`, same props; one close path; cannot be dismissed while `loading` | `ConfirmDialog/ConfirmDialog.tsx`, fixed |
| `Dropdown/` | Base UI `Menu`, same props; the trigger uses `render={<button …/>}` | `Dropdown/Dropdown.tsx`, fixed |
| `Tooltip/` | Base UI `Tooltip`; `render` on the trigger; `z` on the positioner | `Tooltip/Tooltip.tsx`, fixed |
| `Switch/` | Base UI `Switch`: `checked`, `onCheckedChange`, `disabled`, ARIA props | new, from `BundleManagerSection.tsx:128-155` |
| `Checkbox/` | Base UI `Checkbox` with a label | new |
| `RadioGroup/` | Base UI `RadioGroup` + `Radio`; used by the filter radios, the star rating and the theme control | new |
| `Accordion/` | Base UI `Accordion` | new, from `AjutorPage.tsx` |
| `Select/` | stays a native `<select>`, unchanged (decision 4) | `Select/Select.tsx`, kept |
| `Toast/` | Base UI `Toast` with `createToastManager()` and the `toast` object (decision 2); `AuthRequiredToast` kept | `Toast/Toast.tsx` and `sonner`, replaced |
| `ThemeSwitch/` | the Light / Dark / System control (step 10) | new |
| `lib/cn.ts` | `cn()` from `clsx` and `tailwind-merge`, with `extendTailwindMerge` for the theme's custom names | new, in `frontend/src/core/lib/` |

`Tabs`, `Slider`, `SearchAutocomplete` and `CityAutocomplete` keep their folders. They need no rule fix, except the unused `CityAutocomplete`, which stays as it is.

## Files you OWN

- `frontend/src/core/components/ui/**`: the wrappers above and every import of them.
- `frontend/src/app/modules/**` files that use a hand-built widget: `bundles/components/BundleManagerSection.tsx`, `reviews/components/ReviewsSection.tsx`, `legal/pages/AjutorPage.tsx`, `categories/components/FilterSidebar.tsx` and `SortBar.tsx`, `invoices/components/CreateInvoiceForm.tsx`, `create-listing/steps/PriceStep.tsx`, `LocationPriceStep.tsx` and `ReviewStep.tsx`, `messaging/components/ContactSellerModal.tsx`, `auth/components/PhoneVerifyModal.tsx`, `settings/components/PasswordSection.tsx`, `favorites/components/FavoriteToggle.tsx`, and the ten files that import `sonner`.
- `frontend/src/App.tsx` (the `Toaster`), `frontend/src/core/components/layout/Footer.tsx` (the theme control), `frontend/index.html` (the pre-paint theme script).
- `frontend/src/index.css`: the layers, the dark tokens, the `@custom-variant`, the new tokens (z scale, shadows, rating colour).
- `frontend/package.json` and `frontend/package-lock.json`: add `clsx`, `tailwind-merge` and `vitest` (pinned exactly), remove `sonner` (decision 2).
- `frontend/eslint.config.js`: add `eslint-plugin-better-tailwindcss` (correctness rules as errors, class order as an error once step 9 is done).
- `scripts/conventions.json`: the exceptions below.
- `.claude/rules/web.md`: the theme and wrapper lines.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md) (a Base UI entry, a theme entry, the revisited "dark mode planned?" question in [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md)), [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, and `frontend/public/locales/` except to add the theme control's labels in both `ro` and `en`.
- Behaviour beyond the fixes listed. The delete-listing confirm, the contact-seller send, the phone-verify flow, the bundle toggle, the review submit and the FAQ open state work as today.
- The `@theme` values of the light theme. They keep their hex values exactly.

## What to do

One commit per numbered step. After each, `npm run check` passes with `check-base-ui` `--warn-only` until step 11.

1. **Before.** Run `check-base-ui` strict and record the counts by rule. Take Playwright screenshots (the `ui-test-plans` skill has the bring-up: API in `backend/` with `npm run seed:samples`, then `npm run dev` in `frontend/`; keep them out of git) at 1280 and 390 px, of:
   - the home page;
   - a category page with the filter sidebar open (sliders, checkboxes, radios);
   - a listing detail page;
   - the review form, with a star chosen;
   - the FAQ page with one answer open;
   - My listings with the delete confirm open;
   - the contact-seller modal and the phone-verify modal;
   - the bundle manager with the switch on;
   - Settings with the password form;
   - the navbar profile menu open;
   - a toast (save a favourite while signed out gives the `AuthRequiredToast`).
2. **`cn()`.** Add `clsx` and `tailwind-merge`, and `frontend/src/core/lib/cn.ts` with `extendTailwindMerge`, so classes from the theme's custom names (`text-on-surface`, `bg-surface-container-high`, `shadow-ambient`, `font-headline`) are recognised as conflicts. Use it in the wrappers in place of `.join(' ')` as each is touched below. Add `vitest` (pinned, node environment, no jsdom) to the frontend for one test of the merge for two custom colour names (Q27, Q60). jsdom tests are only for wrappers that hold logic, and the flow checks in the steps below are Playwright, selecting by role, with `data-testid` only where no role fits (Q62).
3. **`Modal` on `Dialog`.** Rebuild it as the skill's `dialog.md` has it: controlled `open`, the Escape guard (`details.reason === "escape-key" && details.event.defaultPrevented`), `initialFocus` (first `[data-autofocus]`, else the first field, else the first button), `disablePointerDismissal` on, a `Title`, the close button's `aria-label="Închide"`, a `Portal`, and `finalFocus` back to the opener. Drop the document listener, the fixed id and the `body.style.overflow` write. Keep the props and the `size` classes. `ContactSellerModal.tsx` keeps its `autoFocus` textarea working through the `[data-autofocus]` rule.
4. **`ConfirmDialog`.** One close path: remove the extra `onClick={onClose}` (`ConfirmDialog.tsx:41`). While `loading`, ignore `onOpenChange(false)`. Keep the labels, `variant` and the `Portal`.
5. **Rule 9.** `Dropdown` and `Tooltip` take `render={<button …/>}` or the caller's element, not a wrapping span. For `Dropdown`, the caller's `trigger` node becomes the `render` element, so `Navbar.tsx` passes the button once. Keep keyboard behaviour: Enter and Space open the menu, arrows move, Esc closes.
6. **The form widgets.** `Switch` for `BundleManagerSection.tsx:128-155`; `Checkbox` for the six checkboxes; `RadioGroup` for the three filter radios in `FilterSidebar.tsx`; `RadioGroup` for the star rating (keep the hover preview through `onMouseEnter` state on the wrapper, keep `aria-label` "N stele", and expect arrow-key support as a gain); `Accordion` for `AjutorPage.tsx` (keep one open at a time, as `openItem` does today). The native `<input type="checkbox">` that forms read with `FormData` or `register()` needs the Base UI `name` and hidden input wired, so check each site's form handling.
7. **`Select` stays native** (decision 4). Add the entry to `scripts/conventions.json` and the decision to [wiki/decisions.md](../../wiki/decisions.md), and check both callers still work after the `cn()` change.
8. **Toasts, and the `alert`.** Build `ui/Toast/` per decision 2: a module-level `Toast.createToastManager()`, `<Toaster/>` rendering `Toast.Provider`, `Portal` and `Viewport` (mounted where `App.tsx:19` mounts `sonner`'s), and the `toast` object with `success`, `error`, `info`, `warning` and `custom`. Keep the 4 s default, one message visible at a time, a labelled dismiss, and a live region that exists before the first toast. Move the ten files' `import { toast } from "sonner"` to the wrapper, and remove `sonner`. Replace `alert(...)` at `PasswordSection.tsx:29` with `toast.success(...)` and the same Romanian text. Delete the unused hand-built `Toast.tsx` component, or fold it into this wrapper.
9. **Tailwind leftovers (rules 5-8).**
   - In `frontend/src/index.css`, wrap `*`, `body`, `h1-h6` and `#root` in `@layer base`. Leave `.material-symbols-outlined` where it is, with a comment saying why (decision 6). Check the screenshots for heading and body type.
   - Replace the 47 inline `fontFamily: var(--font-headline)` with the `font-headline` utility. Keep the 31 `fontSize` styles and the 3 computed widths, and list the 31 in `scripts/conventions.json` with the reason.
   - Replace the 23 white and black classes with roles: `bg-white` becomes `bg-surface-container-lowest` (also `#ffffff`, so the light theme is identical), `text-white` becomes `text-on-primary` or `text-on-error` by context, a white backdrop at 80% becomes `bg-surface/80`. Add `--color-rating` for the star yellow (the 4 raw palette classes) and `--shadow-focus` and `--shadow-focus-error` for the 13 `rgba(` rings, with the same values.
   - Add a z scale to `@theme` (`--z-nav`, `--z-overlay`, `--z-popup`, `--z-toast`) and use it for the 9 `z-50` and 3 `z-10`. Put the popup `z` on each `Positioner`.
   - Add `eslint-plugin-better-tailwindcss` correctness rules, and its class-order rule as an error once the repo passes.
10. **The theme switch** (Q18).
    1. In `index.css`: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`. Redefine the colour roles under `[data-theme="dark"]`, outside `@theme`, with the values from decision 3. Set `color-scheme: light` on `:root` and `color-scheme: dark` under `[data-theme="dark"]`. Use no `prefers-color-scheme` media query for the app's colours.
    2. A theme store (the repo has `zustand`): `light`, `dark` or `system`, kept in `localStorage` under one key. First visit with no stored value is `light`. `system` resolves through `matchMedia("(prefers-color-scheme: dark)")` and listens for changes. Wrap every `localStorage` access in `try/catch`, because it can throw.
    3. A small inline script in `frontend/index.html`, before the app, that sets `document.documentElement.dataset.theme` from the stored value so a dark visitor never sees a light flash. If the deploy's Caddy snippet sets a CSP that forbids inline scripts, move it to a file in `frontend/public/` and load it with the base path.
    4. `ThemeSwitch/` (a `RadioGroup`), in `Footer.tsx`, with Romanian and English labels in `frontend/public/locales/{ro,en}/`.
    5. Give the colours of the third-party and generated bits a dark pair: the `Toast` colours (they are roles, so they follow), the `material-symbols-outlined` icons (they inherit), and the page `<meta name="theme-color">` if present.
    6. Screenshot every page of step 1 in dark at 1280 and 390 px, and check each text and surface pair for 4.5:1 contrast. Hand the owner the dark screenshots (decision 3).
11. **Strict and after.**
    - Take the step 1 screenshots again in the light theme. The new markup may move a pixel, and that is fine under Q19. Anything visible in layout or colour is fixed.
    - Run `check-base-ui` strict: rules 1-3, 5, 6, 8-11 report 0, with the exceptions in `scripts/conventions.json` named. Drop `--warn-only`.
    - Add the theme and wrapper lines to `.claude/rules/web.md`.
    - Update [wiki/decisions.md](../../wiki/decisions.md), [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md) (answer its dark-mode question), [wiki/status.md](../../wiki/status.md) and [log.md](../../log.md). Run `bash corpus/lint.sh`.

## Acceptance

- [ ] `grep -rn "@base-ui/react" frontend/src --include=*.tsx --include=*.ts | grep -v "core/components/ui/"` prints nothing.
- [ ] `check-base-ui` strict reports 0 for rules 1, 2, 3, 5, 6, 8, 9, 10 and 11, with each exception named in `scripts/conventions.json` and its reason. Counts before and after are in the outcome note.
- [ ] `grep -rn "alert(" frontend/src` prints nothing, and `grep -rn "from \"sonner\"" frontend/src` prints nothing (decision 2's default).
- [ ] `grep -rnE "role=\"(switch|radio|radiogroup)\"|aria-expanded|type=\"(checkbox|radio)\"" frontend/src | grep -v "core/components/ui/"` prints nothing, apart from `CookieConsent`'s exception.
- [ ] `grep -rnE "\b(bg|text|border)-(white|black)\b" frontend/src` prints nothing, and `grep -rn "fontFamily" frontend/src` prints nothing.
- [ ] A Playwright run (outcome note) shows, for `Modal`: Esc closes it, a click outside does not, Tab stays inside, focus returns to the button that opened it, and the page does not scroll behind it. For `ConfirmDialog`: Esc does nothing while `loading`. For `Dropdown`: Enter opens it from the keyboard. For the star rating: the arrow keys change the value.
- [ ] `grep -rn "prefers-color-scheme" frontend/src` prints nothing. `grep -n "custom-variant dark" frontend/src/index.css` finds the `data-theme` variant.
- [ ] A Playwright run shows: a first visit (empty storage, system set to dark) is light; choosing Dark sets `data-theme="dark"` and survives a reload with no light flash; choosing System follows the browser's colour scheme.
- [ ] The light-theme screenshots at 1280 and 390 px match the step 1 set, with no visible change in layout or colour (Q19).
- [ ] `npm run check` passes, and `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 11's knip run lists the unused wrappers (`Toast`, `Tooltip`, `CityAutocomplete`, `Chip`). Delete or keep them there; this brief fixes the ones that stay.
- Brief 13 touches `backend/` only, so it can run before or after this one, but never in the same hour as brief 11.
- The skills library's `check-base-ui` heuristic for rule 9 may flag a `render` function that returns a `<span>`. That is a false positive only where the span is the element, which it no longer is after step 5.
- The owner's phone has no navigation links: the navbar hides them below `md` (`Navbar.tsx:58`). Q40 moves phone menu panels to `Drawer`, but this repo has none. Adding one is a feature, so it stays out of this brief, and the redesign (brief 14) may propose it on the board.
