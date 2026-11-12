---
paths:
  - "frontend/src/**"
---

# The frontend (`frontend/src`)

- Read the `base-ui` skill before you add or change a component.
- Base UI is imported only by the wrappers in `frontend/src/core/components/ui/<Name>/`, from subpaths
  (`@base-ui/react/slider`). Pages import the wrapper, never `@base-ui/react`.
- Styling is Tailwind utilities, with the tokens from `@theme` in `frontend/src/index.css`. Add no new `.css`
  file. Merge classes with `cn()` from `@core/lib/cn`; a new theme token goes into its lists. Colours, shadows and
  z-indexes are role tokens (`bg-surface-container-lowest`, `shadow-popup`, `z-popup`), never `bg-white`, an
  `rgba(` shadow or a literal `z-50`.
- The theme is Light / Dark / System (`ThemeSwitch` in the footer): a `data-theme` attribute on `<html>`, `dark:`
  keyed off it, a first visit light. Redefine a role under `:root[data-theme="dark"]` in `index.css`; write no
  `prefers-color-scheme` query for colours. A new pair of text and surface roles needs 4.5:1 in both themes
  (`index.css.test.ts` lists the pairs).
- The wrappers: `Modal` (a form dialog: outside clicks do not close it), `ConfirmDialog`, `Dropdown`, `Tooltip`,
  `Switch`, `Checkbox`, `RadioGroup`, `Accordion`, `Toaster` with the `toast` object, `ThemeSwitch`. A trigger is
  the caller's element, passed through `render`. The two `<select>`s stay native on phones.
- The UI is Romanian with correct diacritics (ă, â, î, ș, ț). Copy goes through i18next, in
  `frontend/public/locales/{ro,en}/`.
- Pages live in `src/app/modules/<feature>/` (`pages/`, `components/`, `hooks/`, `services/`), and shared code in
  `src/core/`. Aliases: `@/`, `@core/`, `@app/`.
- Components use named exports. A page the router loads with `React.lazy` maps its name:
  `import("../pages/X").then((m) => ({ default: m.X }))`.
- A handler that returns a promise goes on an attribute as `() => void handler()`. Many pages still pass it
  bare (an ESLint warning for now); add no new ones.
- A type-only import is `import type { X }`. `noUncheckedIndexedAccess` is on: narrow an indexed read, never `!`.
- The frontend's tests are vitest in node (`npm test` in `frontend/`): the `cn()` merge and the stylesheet read as
  text. Flows are checked in Playwright, and the build is `tsc -b && vite build`.
- `npm run check:conventions` runs `check-base-ui` over this folder, strict. The icon-font sizes and the cookie
  banner are named exceptions in `scripts/conventions.json`.
