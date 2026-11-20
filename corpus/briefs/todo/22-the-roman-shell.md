# Task 22: The Roman shell: wordmark, frieze, footer and bottom bar

**Depends on:** [brief 21](21-the-roman-identity-tokens-and-type.md) (tokens, fonts, `--font-cap`, the gold and
porphyry roles).

**Runs before:** 23, 24, 25. **Runs after:** 21.

## Context

The shell is on every page: `core/components/layout/Navbar.tsx`, `Footer.tsx`, `BottomBar.tsx`, `MainLayout.tsx`
and `AuthLayout.tsx`. In the comps in [design/roman-rebrand/](../../../design/roman-rebrand/), the shell carries
most of the identity, and the screens below it stay as brief 14 laid them out.

- **The bar.** It is porphyry (`nav-band`), with the same places as today. The current place is underlined
  3 px in gold with square ends, and Conectare has a gold outline.
- **The wordmark.** A laurel wreath sits in front of the name, which is set in Cinzel 700 capitals, spaced
  .12em, in gold on the bar and in ink in the footer. The comps spell it MERCATVS, cutting U as V the way
  Roman inscriptions do. Until [brief 26](26-rename-the-product-to-mercatus.md) runs, the name is PiațăRo, set
  as PIAȚĂRO in the same lockup. Its accessible name stays the product name in normal case (today:
  "PiațăRo, acasă").
- **The frieze.** A Greek-key band, 12 px of pattern inside a 14 px strip, runs under the bar on the bar's
  colour with a 1 px gold rule over it. A second frieze in gold on the ground runs over the footer, with a
  1 px gold rule under it.
- **The footer.** The footer shows the year as a Roman numeral: "© MMXXVI PiațăRo. Toate drepturile rezervate."
  Everything else in it is unchanged.
- **The bottom bar on phones.** It keeps brief 14's five places, recoloured by the tokens: the current place is
  red text on a red tint.

## Decisions

Decided on the board, 2026-11-20:

- The frieze appears in those two places only, 14 px tall at most, and never inside content.
- The ornament is inline SVG with `aria-hidden="true"`, no tab stop and no hit area. That covers the frieze, the
  laurel, and later Home's columns and tablet handles. The laurel's path is in the comps' markup; reuse it, do
  not redraw it.
- The laurel marks the brand only. It never marks a verified seller; that chip keeps its check, from brief 21.
- The year comes from the date through a `toRoman(n)` helper, so the copy needs no yearly edit. Screen readers
  hear the Arabic year: render the numeral `aria-hidden` and a visually hidden "2026" beside it, in both locales.
- On phones the wordmark shrinks to 18 px at .07em with a 20 px laurel. Below 380 px the laurel hides, so the
  signed-in bar (bell and Adaugă Anunț) fits at 360 px.

## Files you OWN

- `frontend/src/core/components/layout/Navbar.tsx`, `Footer.tsx`, `BottomBar.tsx`, `MainLayout.tsx`, `AuthLayout.tsx`.
- New: a `Wordmark`, a `Laurel` and a `Frieze` component under `frontend/src/core/components/brand/`. The name
  comes from one constant there, so brief 26 changes one place.
- New: `frontend/src/core/lib/roman.ts` with `toRoman` and its vitest file.
- The `footer.copyright` string in both locale files: its `{{year}}` placeholder moves into the component, and its
  meaning stays the same.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, `seed-data/`.
- The places, their order and their labels; the theme switch's behaviour; the pages (briefs 23 to 25).

## What to do

1. Build `Laurel`, `Frieze` and `Wordmark` from the comps' SVG and CSS. Then build `toRoman`, with tests: 2026,
   1999, 4, 9, 14, 40, 90, 400, 900 and 3999.
2. Navbar: the porphyry bar, the gold current-place underline, Conectare outlined in gold, the wordmark, and the
   frieze under the bar.
3. Footer: the frieze over it, the ink wordmark, and the numeral year with its hidden Arabic year.
4. Bottom bar: check it on the new tokens, in light and dark.
5. Run the Playwright specs at 1280, 390 and 360. Run the signed-in bar at 360 too; brief 14's dev account
   gives one.

## Acceptance

- [ ] `toRoman` tests pass. The footer reads MMXXVI, and an accessibility-tree check finds "2026" in it.
- [ ] The frieze, the laurel and every other ornament are `aria-hidden` and not focusable. A Playwright check
      counts zero tab stops inside them.
- [ ] No horizontal overflow at 390 and 360, signed out and signed in, in light and dark.
- [ ] A visible focus ring on every bar link on porphyry, from brief 14's focus spec. The ring colour on the bar
      clears 3:1 against `nav-band`.
- [ ] Brief 14's theme spec passes. `npm run check` passes and `bash corpus/lint.sh` ends clean.

## Interplay

- Briefs 23 to 25 assume the shell is done and only touch page content.
- Brief 26 changes the name constant, the locale strings and the page `<title>`; this brief leaves them saying
  PiațăRo.
