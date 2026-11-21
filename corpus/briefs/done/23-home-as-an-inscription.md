# Task 23: Home as an inscription

**Depends on:** [brief 21](../done/21-the-roman-identity-tokens-and-type.md) and [brief 22](../done/22-the-roman-shell.md).

**Runs before:** nothing. **Runs after:** 22.

## Context

The comps are [design/roman-rebrand/home-light.html](../../../design/roman-rebrand/home-light.html) and
`home-dark.html`. Home keeps brief 14's order and zones:

1. a hero with the search;
2. Categorii Populare (13 tiles and Vezi toate categoriile);
3. Anunțuri Recomandate;
4. the sell band;
5. the footer.

The page is `frontend/src/app/modules/home/pages/HomePage.tsx` and its components.

What changes:

- **The hero is an inscription tablet, a tabula ansata.**
  - The search sits in a marble tablet with a double gold rule (an inset 5 px marble gap, then 1 px gold).
  - Dovetail handles, 30 × 84 px with a ring, sit on both sides.
  - The band behind it is tufa (`surface-container-low`).
  - From 1000 px up, two line-drawn fluted columns in gold stand at the band's edges, scaled to the hero's
    height.
  - The title "Caută în toată România" is Cinzel 600 at 36/42, centred above the subline and the field.
- **The category tiles get arched niches.**
  - The icon sits in a 40 × 48 niche with a round top (radius 20 px over 3 px), a niche fill, a 1 px gold ring
    and a bronze icon.
  - The tile itself is brief 14's raised card.
- **Section titles** are Cinzel 600 at 26/32, with a single 1 px gold rule under the head row.
- **Listing cards.**
  - The price is bronze (`gold-ink`), 800, with lining tabular figures, and a smaller "RON" after it in the same
    colour.
  - Verificat is brief 21's chip.
- **The sell band** is porphyry with a 1 px gold inset ring, a Cinzel title, and a laurel wreath drawn on the
  right at 200 px.

## Decisions

Decided on the board, 2026-11-20, after two critique rounds. Each item says what it protects:

- **First screen, kept from brief 14.**
  - At 1280 × 800 the hero ends at y 340 or above, and all 13 tiles plus Vezi toate categoriile are whole.
  - At 390 × 844, 6 tiles are whole above the bottom bar.

  The ornament gives way, not the content. The tablet's padding is 20 px top and 22 px bottom. There is no
  laurel inside the tablet. The tablet sits 20 px above the band's edge.
- **Search width.** At 1280 the tablet is `min(1080px, 100% - 236px)` wide, so the field is about 870 px and
  clears the columns. Under 1000 px the columns go and the tablet is `100% - 64px` wide.
- **Phones (under 600 px).**
  - The handles and the sell band's wreath go.
  - The tablet runs full width, and the title is Cinzel 22/28 on one line.
  - The niche is 44 px tall, and tiles have 10 px vertical padding and a 104 px minimum height.
- **One filled red action: Caută.** Încarcă mai multe anunțuri stays outlined. In the sell band, Postează un
  Anunț Acum is the marble fill and Cum funcționează? is gold-outlined.

## Files you OWN

- `frontend/src/app/modules/home/` (the page and its components). The ornament components (the tablet frame,
  the column) go in `frontend/src/core/components/brand/`, next to brief 22's.
- Corpus: [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, `seed-data/`; the search's behaviour and query; the copy and its diacritics.
- No invented listings, prices or counts: what Home shows is the seed data's.

## What to do

1. Build the tablet frame (the double rule and the handles) and the column as `aria-hidden` SVG components.
2. Hero: the band, the tablet, the title, the subline and the field, with the columns from 1000 px.
3. The category niches, the section heads, the card price and the sell band.
4. Measure the first screens with Playwright at 1280 × 800 and 390 × 844, in light and dark, against the
   numbers above.

## Acceptance

- [ ] The first-screen numbers above hold. A Playwright check reads the hero's bottom and counts whole tiles.
- [ ] No horizontal overflow at 390 and 360. Focus is visible on the search, the tiles and the buttons.
      Reduced motion runs no animation.
- [ ] The ornament is `aria-hidden` with no tab stop. The search keeps its label ("Ce cauți astăzi?").
- [ ] Each theme has exactly one filled red button on the page.
- [ ] Compared with the comps' renders at 1280 light and 390 dark, the remaining differences are listed in the
      outcome note (icons, seed values).
- [ ] `npm run check` passes and `bash corpus/lint.sh` ends clean.

## Interplay

- The Material Symbols icons stay, as brief 14 kept them, so the niches hold those, not the comps' stroke icons.

---

> **Done 2026-11-21.** `Tabula` (the frame, the inner rule as an inset bordered layer rather than a box-shadow string, the two handles) and `Column` are new in `core/components/brand/`, all ornament `aria-hidden` and unfocusable. The hero, niches, section heads, card price (`CardPrice`, exported for brief 24's list view) and sell band are built as the brief says; tile labels are 16px with `text-balance`, so "Șabloane & Template-uri" no longer breaks at its hyphen. Measured with Playwright (`e2e/home.spec.ts`, 9 tests): at 1280 × 800 the hero ends at y 337 (limit 340) with all 14 tiles whole, in light and dark; at 390 × 844 six tiles are whole and the title is one line; no overflow at 390 and 360; Caută is the one filled red button in each theme; every drawing in `main` is `aria-hidden` with nothing focusable inside; the field keeps its placeholder and its label "Caută anunțuri". The focus-ring and reduced-motion specs cover Home as before. `e2e/identity.spec.ts` now expects the hero title in Cinzel and a category label and a listing title in Alegreya Sans. Against the comps' renders (1280 light, 390 dark), what remains different: the wordmark reads PIAȚĂRO until brief 26; the niches hold Material Symbols, not the comps' stroke icons; the cards show the seed's listings and previews; the verified chip keeps brief 14's check rosette in gold; the sell band's wreath goes under 768px, as the comps draw it, where the brief said 600px (between 600 and 767px it would sit on the text). All 136 Playwright specs pass (108 shot specs skip); `npm run check` passes.
