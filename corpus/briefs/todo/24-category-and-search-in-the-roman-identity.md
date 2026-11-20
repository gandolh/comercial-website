# Task 24: Category and search in the Roman identity

**Depends on:** [brief 21](21-the-roman-identity-tokens-and-type.md) and [brief 22](22-the-roman-shell.md).

**Runs before:** nothing. **Runs after:** 22. It is independent of 23.

## Context

The comps are [design/roman-rebrand/category-light.html](../../../design/roman-rebrand/category-light.html) and
`category-dark.html`. The category page and the search results share brief 14's filter band:
`categories/pages/CategoryPage.tsx`, `categories/components/ResultsBand.tsx` and
`search/pages/SearchResultsPage.tsx`. The phone `Filtre` sheet is `core/components/ui/Sheet`. The layout,
the facets, the band, the chips and the sheet keep their behaviour.

What changes:

- **The band.** It gets a 1 px gold rule along its bottom edge, under brief 14's shadow. The page title, the
  category's name, is Cinzel 600 with .03em tracking at brief 14's size: 30/36, and 24/30 on phones.
- **Selected states** are brief 21's red outline and tint: segments, the view toggle, the value chips and the
  sheet's options. The slider's track and thumbs are red, as a control in use. The `Autor Verificat` switch is
  porphyry when it is on.
- **The price range readout** is "0 RON – 100.000+ RON", with an en dash spaced on both sides; brief 14's
  figure dash read as a hyphen in Alegreya Sans.
- **The cards** are as on Home (brief 23): a bronze price with a smaller RON, the Verificat chip, and lining
  figures.
- **The phone `Filtre` button** is the screen's one red fill, using `action-fill` in dark.

## Decisions

Decided on the board, 2026-11-20:

- **Cinzel titles never truncate.** The longest category name, "Documente & Template-uri Legale", wraps
  balanced (`text-wrap: balance`) at 390 and 360 and is never cut. The search results' title, which repeats the
  query, is user text, so it stays in Alegreya Sans.
- **Every figure the band shows uses lining figures.** That covers the count, the price output and the chips'
  values.
- **The search results page uses the same band** and gets the same changes in the same commit.

## Files you OWN

- `frontend/src/app/modules/categories/`, `frontend/src/app/modules/search/`, and the Sheet's and chips' styling
  where the tokens don't carry it.
- `frontend/e2e/filters.spec.ts`, if a selector moves.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, `seed-data/`.
- The filters' behaviour: the band applies a pick at once; the sheet applies its picks together from
  `Aplică filtrele`.
- Copy, apart from the readout's dash.

## What to do

1. Band: the gold rule, the Cinzel title, the selected states, the slider and the switch.
2. The readout's dash, in the formatting code, not the locale strings, unless the dash lives there.
3. Cards and the phone controls.
4. Run the filters spec and the 390 and 360 overflow specs on `/categorii/documente-template-uri-legale`, or
   whatever slug the longest name has, and on `/anunturi?q=...`.

## Acceptance

- [ ] The longest category name shows whole at 390 and 360, in light and dark, with no ellipsis and no overflow.
- [ ] The filters spec passes. Selected states read as selected in both themes; the outline and tint is checked
      with the contrast table's UI pair.
- [ ] One filled red control per screen: Filtre on phones. On desktop nothing in the band is filled red.
- [ ] Focus is visible on every band control on the marble band. Reduced motion runs no animation.
- [ ] `npm run check` passes and `bash corpus/lint.sh` ends clean.
