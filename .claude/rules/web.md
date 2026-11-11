---
paths:
  - "frontend/src/**"
---

# The frontend (`frontend/src`)

- Read the `base-ui` skill before you add or change a component.
- Base UI is imported only by the wrappers in `frontend/src/core/components/ui/<Name>/`, from subpaths
  (`@base-ui/react/slider`). Pages import the wrapper, never `@base-ui/react`.
- Styling is Tailwind utilities, with the tokens from `@theme` in `frontend/src/index.css`. Add no new `.css`
  file.
- The UI is Romanian with correct diacritics (ă, â, î, ș, ț). Copy goes through i18next, in
  `frontend/public/locales/{ro,en}/`.
- Pages live in `src/app/modules/<feature>/` (`pages/`, `components/`, `hooks/`, `services/`), and shared code in
  `src/core/`. Aliases: `@/`, `@core/`, `@app/`.
- Components use named exports. A page the router loads with `React.lazy` maps its name:
  `import("../pages/X").then((m) => ({ default: m.X }))`.
- A handler that returns a promise goes on an attribute as `() => void handler()`. Many pages still pass it
  bare (an ESLint warning for now); add no new ones.
- A type-only import is `import type { X }`. `noUncheckedIndexedAccess` is on: narrow an indexed read, never `!`.
- The frontend has no tests; flows are checked in Playwright, and the build is `tsc -b && vite build`.
- `npm run check:conventions` runs `check-base-ui` over this folder, `--warn-only` for now.
