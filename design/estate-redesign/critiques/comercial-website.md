fix

# comercial-website (PiațăRo), B "The filter band": design critique, 2026-11-12

Read from the images first (today `shots-existing/comercial-12/after-*`, the build's twins rendered in `work/comercial-website/shots/`), then the manifest, the direction, RESULT.md and the app source (read only). Today has no 360 shot and no dev server was run, so today at 360 is unmeasured; today's shots are 900 tall, cut at 800/844 below.

## First-screen density (today against the build)

| Screen, viewport | Today | Build | Verdict |
|---|---|---|---|
| Category 1280x800 | 3 columns. Card 1 y 192-587, whole. Filters: 3 of 4 groups + switch; `Resetează Filtre` 799-843 is cut. Row 2 would show 181 px. | 4 columns. Band 64-286, card 1 y 310-639, whole. Every option of every group visible, reset at y 229. Row 2 would show 137 px. | **Fair trade, a net win.** The card drops 118 px, but 4 whole cards against 3 (+33%), and no filter is cut. Keep. |
| Category 390x844 | Card 1 262-657 whole, card 2 peeks 155 px. No filters, no navigation. | Card 1 285-672 whole above the 80 px tab bar (top 764); card 2 peeks 76 px. `Filtre` + 2 value chips visible. | Cost 23 px of card top and 79 px of peek, paid for filters and nav. Fair. |
| Category 360x800 | (no shot) | Card 1 285-650 whole (bar top 720), 54 px peek; chip 2 cut mid-value. | Fine. |
| Detail 1280x800 | `Descarcă Asset` y 424-484; seller card starts 689, cut. | `Descarcă Asset` 285-333; seller card whole (500-745). | Win. |
| Detail 390x844 | Price at 730; no download button in the first 900 px. | `Descarcă Asset` 624-672 and `Contactează Autorul` 688-736 above the bar. | Win. |
| Home 1280x800 | Category tiles start at 720: 0 of 14 whole. | 14 of 14 tiles whole (incl. `Vezi toate`). | Big win. |
| Home 390 / 360 | Tiles start at 744: 0 whole. | 4/14 whole at 390, 2/14 at 360. | Win, with ~50 px still to take back (issue 6). |

No density regression. Nothing is truncated; the card title's 2-line wrap is natural, not a clamp.

## Regressions against today

1. **Detail and every signed-in page, top bar: who is signed in.** Today's account button prints the user's name (`Andrei Popescu`, `Navbar.tsx` line 103: `display_name` or the email's local part). The build prints `Contul meu`, which in the source is a menu item label (line 22), not the trigger. Fix: put `display_name` back in the outlined account button (person icon + name, 15/20 at 500); the bar has ~450 px free between `Mesaje` and the bell, so the button grows, never ellipsizes. Keep `Contul meu` on the phone tab bar, where a name won't fit a 78 px cell.
2. **Home 1280/390, hero: the search lost its lead.** Today the search is a raised white pill with a shadow, the one loud thing in the hero. The build sets it as a grey `surface-container-low` well with a 1 px edge inside a white band, so it reads as an inset field, not the page's main control. Fix: the field on `surface-container-lowest` (white / `#232529`) with a 1 px `outline` edge and the card shadow, 56 px tall, `Caută` at 48 px; keep the left-aligned head (it bought the tiles their place on the first screen).

Nothing else regressed: islands, grouping and depth are stronger than today in both themes (cards lift off a darker ground; dark cards are lighter than the page, today's sank).

## Priority issues

1. **Invented or misstated data on the comps (the board must not show it as real).**
   - `Gratuit` on Home's audio pack **goes**: the seed stores `price_ron = 0`, and every formatter (`ListingCard.tsx` 53, `ListingGrid.tsx` 73, `PricingCard.tsx` 34, `ListingDetailPage.tsx` 247) prints `Gratuit` only for `null`; nothing maps 0 to null. The app prints `0 RON`, Detail included, so the sticky's "as the detail page's code already does" is wrong. Draw `0 RON`; keep the open sticky as the owner's product question (0 shown as `Gratuit`).
   - The three `Anunțuri Similare` cards **go**: `getRelated` (`listings-store.ts` 503) returns same-category, active, unexpired rows, and the seed has one `sabloane` listing, so the app renders no section (`RelatedListings` returns null on empty). Drop the section from Detail; the card is already shown on Category and Home.
   - The seller's two facts **stay**: both fields are real (`SellerCard.tsx`, API `member_since` / `active_listings_count`), Maria Ionescu owns seed listings 001, 002 and 004 (3), and `noiembrie 2026` matches the seed date in the app's `ro-RO` format. Re-word the sticky from "illustrative" to "derived from the seed".
   - `Mai multe filtre`'s `Dimensiune fișier` group: the API has no size facet (the query schema takes licence, format, price, date, verified, sort) and no category has a fourth facet today. **Clash with ruling 2**, which requires the state: keep the control and the open panel, but stamp the group "example facet, not in the app" inside the panel (not only in the section caption), or draw the panel with a neutral placeholder group name.
2. **Direction sheet, Active filters, phone: the chips contradict the state.** `Comercială` and `ZIP` are chosen and `Filtre` shows 2, but the chips still read `Format Fișier: Toate` and `Tip Licență: Toate`. Fix: `Tip Licență: Comercială` and `Format Fișier: ZIP`, chosen chips filled `primary-fixed` with `on-primary-fixed` text and a 1 px `primary` edge, unchanged chips stay on the well.
3. **Direction sheet, phone `Filtre` sheet: two groups missing.** It holds Tip Licență, Format Fișier and Data Publicării; `Preț (RON)` and `Autor Verificat` are absent, though the brief says the sheet holds every group. Fix: add the range (full width, value under it) and the switch row above the sticky `Resetează Filtre` / `Aplică filtrele` footer; the sheet body scrolls.
4. **Direction sheet, More filters at 1280: `Preț (RON)` vanished.** In that state row 2 is `Autor Verificat` + `Mai multe filtre`; the range is gone, so "every option stays visible" breaks. Fix: row 2 = range, switch, `Mai multe filtre`, reset, as on the main comp.
5. **Category 390: the chip rail barely signals that it scrolls.** At 390 chip 2 ends at x 374 and chip 3 starts at 382, so only an 8 px sliver sits under the fade; 3 of 5 filters (`Preț`, `Data Publicării`, `Autor Verificat`) are invisible with no cue (360 is fine: chip 2 is cut mid-value). The phone order (Format, Tip) also differs from the band's (Tip, Format). Fix: use the band's order (Tip Licență, Format Fișier, Data Publicării, Preț, Autor Verificat) and a 10 px chip gap, then check that a chip is cut 40-60% of its width at 390 and 360 under a 32 px fade. Never shorten a label.
6. **Home 390/360: `Vezi toate categoriile` costs a line.** At 390 the link drops under `Categorii Populare` (heading y 350, link 381-425, tiles 446), ~50 px of air, and the dashed `Vezi toate categoriile` tile repeats it at the end of the grid (today's `HomePage.tsx` has both, so not invented). Fix at phone widths: keep the heading and link on one row (link 14/20, right-aligned, wrapping the heading if needed) and drop the header link below 640 px where the tile does the job. That returns one tile row at 360 (2 → 4 whole).
7. **Detail: noise beside the heading.** `ID: 10000…0002` (32 digits, mono) sits on the `Descriere` heading line, and `Contactează autorul` appears twice (pricing card tonal, seller card outlined; kept by the builder's decision, as today). Fix: move the ID under the format/size/licence facts as a 12/16 `on-surface-variant` meta line, whole, never cut; the second contact button is the owner's call, raise it on the board rather than keep it silently. Also `Fără previzualizare` is new copy, in neither locale; add it to the copy sticky with `Filtre`, `Aplică filtrele`, `Mai multe filtre`.

## Strengths to keep

- The raised filter band at 1280: every option visible in three labelled segmented groups plus one control row, 222 px tall, buys a 4-column grid. It answers today's longest-standing fault (no filters on the phone) without hiding desktop options.
- The navy shell with the 3 px current-place underline and the `Favorite` count badge: conventional, clearly the app's own surface, and set off from the white band in both themes.
- Real islands: white / `#232529` cards with a 1 px edge on a `#f2f2ee` / `#131416` ground, the preview well with the heart and `Verificat` docked, and the category-icon placeholder instead of spilled alt text.
- The phone: one column, `Filtre` at 48 px in thumb reach, a five-place bottom bar, the last row clearing the bar.

## Heuristic scores (Nielsen, 0-4)

1. Visibility of system status 3: current place, chosen segments, counts; the signed-in name is lost (regression 1).
2. Match with the real world 3: Romanian with diacritics, RON; `Gratuit` misstates the app.
3. User control and freedom 3: reset with a count, removable chips, sheet close.
4. Consistency and standards 3: chip order differs between phone and desktop; two contact buttons.
5. Error prevention 3: single-choice radios can't conflict; the range has no typed entry to get wrong.
6. Recognition over recall 3: everything visible at 1280; 3 of 5 values hidden off-screen at 390.
7. Flexibility and efficiency 3: grid/list, sort, one-tap segments; no saved searches (not in scope).
8. Aesthetic and minimalist design 3: calm and grouped; the ID line and the duplicate `Vezi toate` are noise.
9. Error recovery 3: load error with `Încearcă din nou`, no-results with reset, search error text.
10. Help and documentation 2: nothing explains `Extinsă` vs `Comercială` licence; a one-line hint on the sheet would do.

Total 29/40.

## Detector

The default run was degraded (`[]`: parser modules not found through `NODE_PATH` for an ES module). Re-run from a scratch copy with presentation-sites' `node_modules` linked beside it: 24 findings over 8 twins, all dismissed.
- `cramped-padding` on `.pr` (page root), `.band` (full-bleed band, inner container carries the padding), `.big` (the preview well, inset by the card), the specimen `.frame`/`.phf`: expected false positives.
- `gray-on-color` x2 on home-dark: `#e8eef5` on `#0e2338` is near-white at 13.7:1, the `on-nav-band` token.
- `gpt-thin-border-wide-shadow` x3 on the Direction sheet: the `shadow-popup` elevation specimens and the menu, i.e. overlays, where a wide blur is correct.
- `em-dash-overuse` (48): the `--color-*` token names on the palette specimens, no em-dash in product copy.

Keep the filter band with every option visible and the 4-column grid of raised cards; fix the data and the states around it, don't trade the band back for a column.
