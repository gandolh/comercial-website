# The board's notes: PiațăRo

The estate redesign board is a private canvas. This file copies what its page for this app said beside the screens: the owner's asks, the decisions, the rules the design reopened, the open questions and the Floor. The owner's answers are in [README.md](../README.md#the-owners-decisions).

## Asks to the owner

- 1. Reopened: the Carpathian Clear identity (Manrope and Inter become Schibsted Grotesk; the blue becomes Voroneț azure with a navy shell; teal leaves; the two-tone wordmark's colours change). Is a new look on the table? 2. Reopened: phone navigation as a five-place bottom bar (Acasă, Categorii, Favorite, Mesaje, Conectare or Contul meu) instead of brief 14's menu Drawer. OK? 3. Approve The filter band as PiațăRo's direction? (beside `comercial-website-direction`)

## Decisions

- Rarer facets go behind Mai multe filtre, drawn on the sheet as a state with illustrative groups; active filters show as a count on Filtre and beside Resetează Filtre, and as removable chips under the band; the phone sheet holds every group with several picks per visit (ruling 2 and 3). (beside `comercial-website-direction`)
- Phone: the chip row ends in an edge fade so the cut chip reads as scrollable; the Conectare cell fits at 390 and 360 without an ellipsis; the chips follow the band's order (Tip Licență, Format Fișier, Data Publicării, Preț, Autor Verificat), two lines each, so no label is shortened; the Filtre count is a badge on the button's corner so the sort select keeps its width. (beside `comercial-website-proposed-category-390`)
- Scrolled to the end, the footer's last row sits 24 px clear of the bottom bar; the real page pads by the bar's 64 px plus the gesture inset (drawn here as 16 px). (beside `comercial-website-proposed-category-scrolled-390`)
- Detail: the broken image (alt text spilling over the media) becomes the no-preview tile; the ID wraps instead of running off the card; the cyan pill becomes a tonal button; tracked caps are gone. The ID moves under the specs as a meta line. (beside `comercial-website-proposed-detail-1280`)
- Home keeps today's order (hero with a raised white search field, Categorii Populare, Anunțuri Recomandate, CTA) on the same band and card surfaces. The CTA band is the navy shell colour, its dotted pattern dropped; România in the head is no longer a second colour (Hallmark 38iii). (beside `comercial-website-proposed-home-1280`)

## Reopened rules

- Recorded (wiki/carpathian-clear.md, type table: Headlines Manrope, Body Inter; brief 14, Decisions: "A different brand identity is a reopened decision, flagged on the board"). Proposed: one face, Schibsted Grotesk; primary #1a5f9e, a navy nav-band, teal only gone from the UI. (beside `comercial-website-direction`)
- Recorded (brief 14, step 5: decide "the missing phone navigation panel ... proposed, as a Drawer"). Proposed: a bottom bar of five places instead, the estate's default for phones; Adaugă Anunț stays in the top bar when signed in. (beside `comercial-website-proposed-category-390`)
- Copy: sentence case for Verificat, Vânzător verificat, Resetează Filtre and Autor Verificat (today VERIFICAT and VÂNZĂTOR VERIFICAT are CSS-uppercased tracked caps; locale key listing.verified holds "VERIFICAT"). New strings: Filtre, Aplică filtrele, Mai multe filtre, Fără previzualizare. Meaning unchanged. (beside `comercial-website-proposed-category-1280`)

## Open questions

- The app prints a free listing as "0 RON" on Home and Detail (the seed stores price_ron 0; only null prints Gratuit). The comps draw 0 RON. Product question for the owner: show 0 as Gratuit? (beside `comercial-website-proposed-home-1280`)
- Contactează autorul appears twice on Detail (the price card and the seller card), as today. Keep both, or one? The comp keeps both. (beside `comercial-website-proposed-detail-1280`)

## The Floor

- Contrast is scripted over 42 pairs in both themes: text min 5.30 light and 5.38 dark, UI parts 3.40 and 4.08, every surface-on-ground pair at or over 1.09 or carrying a 1 px edge of 1.34 or more (cards 1.12 light, 1.20 dark). No page overflow at 1280, 1100, 1024, 768, 390 or 360 in either theme; no control spills its box (the Filtre count badge sits on the button's corner on purpose); the sort text fits at 360. Phone targets are 44 px or more and the last row clears the bottom bar. Sloplint --scope app --render: 0 FAIL on all four Proposed twins in both themes. Reflexes left on the record: 24b (half steps of 6, 10, 14 px so 20 px icons centre in 44 px targets) and 3 (a listing grid is cards, not feature tiles); the linter rejected those waivers. The phone chip rail shows 58% (390) and 40% (360) of the third chip under a 32 px fade. (beside `comercial-website-direction`)

## Other notes

- Navy top bar: the three places sit left beside the wordmark, the current one underlined 3 px, Conectare outlined at the right. Signed in (detail) the bell, the account button with the display name and a filled Adaugă Anunț join it.
- The raised filter band: the title and count share a line with the view toggle and sort; every option of Tip Licență, Format Fișier and Data Publicării shows, then the price range, Autor Verificat and Resetează Filtre share one row. Nothing is truncated, groups wrap before they scroll.
- First screen at 1280 by 800: today's first card starts at y 192 and ends at 587 (the filter column runs past the fold, Resetează Filtre ends at 843). The build's first card starts at y 310 and ends at 639 (Home tiles whole in the first screen: 14 of 14 at 1280, 6 of 14 at 390, 4 of 14 at 360), above the middle of the viewport with the whole band showing.
- The range is set with U+2012 (figure dash) between the two ends, as almanac did; it renders like the app's dash and passes Hallmark gate 19.
- Footer share and email buttons do nothing today; they are kept in the comps as drawn. Not in the app: Mai multe filtre's extra group (stamped "Exemplu: nu există în aplicație" on the sheet), the search field's error text and Aplică filtrele. Derived from the seed: the seller's two facts (member since noiembrie 2026, 3 active listings: seed rows 001, 002, 004). Detail shows no Anunțuri Similare section: the seed has one sabloane listing, so the app renders none. The signed-in account button shows the display name (Andrei Popescu, as today's shot); Contul meu stays on the phone tab bar.
- Handoff: manifests/comercial-website.tokens.css and comercial-website.tokens-map.md carry the tokens in the app's own Material 3 names. Dark keeps surface-container-lowest as the lightest container on purpose.

## Contrast, as measured

| Pair | Light | Dark | Needs |
|---|---|---|---|
| on-surface on ground (title, body) | 15.18 | 15 | 4.5 |
| on-surface on card and band | 16.87 | 12.49 | 4.5 |
| on-surface-variant on card (count, labels) | 7.86 | 7.52 | 4.5 |
| on-surface-variant on well (segments, chips, sort) | 6.46 | 6.47 | 4.5 |
| on-surface-variant on ground | 7.07 | 9.03 | 4.5 |
| on-surface-variant on footer | 6.45 | 8.34 | 4.5 |
| on-surface on well | 13.88 | 10.75 | 4.5 |
| primary on card (price, Resetează, current tab) | 6.55 | 8.19 | 4.5 |
| primary on ground (România, links) | 5.89 | 9.84 | 4.5 |
| on-primary-fixed on primary-fixed (chosen segment) | 9.32 | 9.36 | 4.5 |
| primary on primary-fixed | 5.3 | 6.27 | 4.5 |
| on-primary on primary (Filtre, Descarcă Asset, Caută) | 6.55 | 7.87 | 4.5 |
| on-primary on primary-container (button hover) | 8.36 | 11.48 | 4.5 |
| on-primary-container on primary-container | 6.73 | 11.48 | 4.5 |
| on-fill on tertiary-container (Verificat, Vânzător verificat) | 6.5 | 6.37 | 4.5 |
| on-nav-band on nav-band (nav, CTA band) | 11.52 | 13.66 | 4.5 |
| on-nav-band-variant on nav-band (Ro, bell) | 7.3 | 8.52 | 4.5 |
| nav-band on on-nav-band (Adaugă Anunț, inverted button) | 11.52 | 13.66 | 4.5 |
| secondary on footer (footer Ro) | 5.83 | 9.64 | 4.5 |
| on-secondary-container on secondary-container (Contactează Autorul) | 10.03 | 8.9 | 4.5 |
| error on card (filled heart, form error) | 6.47 | 9.04 | 4.5 |
| on-error-container on error-container (load error) | 7.17 | 10.51 | 4.5 |
| on-surface-variant on card-tinted ground (placeholder) | 6.46 | 6.47 | 4.5 |
| inverse-on-surface on inverse-surface (toast) | 11.65 | 10.74 | 4.5 |
| inverse-primary on inverse-surface (toast action) | 7.04 | 5.38 | 4.5 |
| outline on card (switch off, share and email edge) | 4.13 | 4.74 | 3 |
| outline on well (switch thumb) | 3.4 | 4.08 | 3 |
| primary on well (range thumbs, ring) | 5.39 | 7.05 | 3 |
| primary ring on primary-fixed (chosen segment) | 5.3 | 6.27 | 3 |
| on-nav-band-variant on nav-band (Conectare edge) | 7.3 | 8.52 | 3 |
| focus on card | 6.55 | 8.19 | 3 |
| focus on ground | 5.89 | 9.84 | 3 |
| focus on nav-band | 7.3 | 8.52 | 3 |
| icon on-surface-variant on well (no-image tile) | 6.46 | 6.47 | 3 |
| tertiary on card (switch on) | 6.5 | 8.54 | 3 |
| card on ground | 1.11 | 1.2 | 1.09 |
| band on ground | 1.11 | 1.2 | 1.09 |
| well on card (tracks, chips) | 1.22 | 1.16 | 1.09 |
| footer on ground (dark carries a top edge) | 1.1 | 1.08 | 1 |
| nav-band on ground | 10.36 | 1.16 | 1.09 |
| outline-variant edge on ground (needs 1.3) | 1.34 | 1.7 | 1.3 |
| outline-variant edge on card (needs 1.3) | 1.49 | 1.41 | 1.3 |

## The runner-up

**Runner-up: A, Carpathian Clear, settled (sketch only, not built)**

Note: how this direction was picked. Two directions were sketched (A evolve today, B the filter band) and two judges compared every pair against today, in both orders, at 1280 light and 390 dark. All 12 verdicts agreed: B won 4 of 4, A 2, today 0 (today's phone has no filters and no navigation, and its second card shows a broken image). A lost to B on structure: B's navy bar, raised filter band and grey results field read as three zones, and every filter shows at once. Say so here if you'd rather keep Carpathian Clear's look and the filter sidebar (A).

## The artboards on the board

- Direction · The filter band
- Category · 1280 · light · today
- Category · 390 · light · today
- Listing detail · 1280 · light · today
- Listing detail · 390 · light · today
- Home · 1280 · light · today
- Home · 390 · light · today
- Category · 1280 · light · proposed
- Category · 390 · dark · proposed
- Listing detail · 1280 · light · proposed
- Listing detail · 390 · dark · proposed
- Home · 1280 · light · proposed
- Home · 390 · dark · proposed
- Category · 390 · dark · scrolled to the end · proposed (fixed 390 x 844 frame, not a fluid page)
- Runner-up A, Carpathian Clear, settled · light 1280 (sketch)
- Runner-up A, Carpathian Clear, settled · dark 390 (sketch)
