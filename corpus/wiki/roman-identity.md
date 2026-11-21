---
summary: The Roman identity since 2026-11-21 (briefs 21-25) — colour roles in both themes (porphyry shell, vexillum red, gold and bronze), the two faces (Cinzel capitals, Alegreya Sans), lining figures, stone-cut radii, porphyry shadows, the primitives' looks, and where the tokens live.
updated: 2026-11-21
---

# The Roman identity

The look of the marketplace since 2026-11-21: the owner asked for an alternative "in the style of the Roman empire",
liked the first sketch on the estate redesign board on 2026-11-20 and approved the refined row on 2026-11-21. It keeps
"The filter band" (brief 14): its layout, places, Romanian copy and the Material 3 role names. Only the values and
the faces changed. The comps are in [design/roman-rebrand/](../../design/roman-rebrand/). Brief 21 laid the tokens
and type; 22 the shell, 23 Home, 24 category and search, 25 detail and the undrawn screens. The identity it
replaced is history on [carpathian-clear.md](carpathian-clear.md).

The tokens live in `frontend/src/index.css`: the `@theme` block (light) and `:root[data-theme="dark"]`.

## Colour roles

| Role | Light | Dark | What it does |
|---|---|---|---|
| `nav-band` | `#2d1026` | `#2b0f24` | Porphyry: the top bar, the sell band; `tertiary-container` is the same porphyry (the verified chip, a switch that is on) |
| `on-nav-band` / `-variant` | `#f7efe2` / `#d8b35c` | same | Text on porphyry / gold on porphyry (the current place's underline, the bar's outlines, the chip's check) |
| `primary` | `#9a2617` | `#f0937c` | Vexillum red: links, the current place, the selected state's outline, a control in use. Dark keeps a light salmon for text and outlines |
| `primary-fixed` / `on-primary-fixed` | `#f5e1d9` / `#6a180c` | `#4b1c14` / `#ffd9cf` | The selected state's tint (segments, chips, sheet options) |
| `action-fill` / `on-action-fill` | `#9a2617` / `#fdf8f0` | `#c24a36` / `#ffffff` | NEW: the one filled action per screen (Button `primary`); `action-fill-hover` `#7c1c0f` / `#a93d2b` |
| `secondary-container` / `on-` | `#ece2e8` / `#2d1026` | `#3d2735` / `#f3e3ec` | The tonal button: a porphyry tint, never gold; `secondary-fixed-dim` is its hover |
| `gold` | `#b8892e` | `#b8964d` | NEW: lines and ornament only, never text |
| `gold-ink` | `#6f5216` | `#dcbb6c` | NEW: bronze, gold's text-safe shade: prices, category icons, small words in gold. `secondary` and `tertiary` hold the same bronze |
| `niche` | `#efe7d8` | `#2c2324` | NEW: the category niche's fill (brief 23) |
| `background` = `surface` | `#f1ece2` | `#161112` | Travertine / basalt ground; also the browser-bar colour (`THEME_COLORS`, `index.html`) |
| `surface-container-lowest` | `#fdfbf6` | `#231b1c` | Marble: cards, the band, panels. In dark it is the lightest container, on purpose, as in brief 14 |
| `surface-container-low` / `surface-container` | `#eae3d5` / `#e5ddcd` | `#2c2324` / `#1c1617` | Tufa: tracks, fields, the hero band / the footer |
| `on-surface` / `on-surface-variant` | `#241b17` / `#5a4e46` | `#f2e9dd` / `#c5b8aa` | Ink / muted text |
| `outline` / `outline-variant` | `#85786c` / `#d6cab7` | `#968a7f` / `#41363a` | Field and switch edges / card edges |

**What red does,** and nothing else: one filled action per screen; the selected state as an outline and a tint;
links and the current place; a control in use (the slider, an active heart). Errors keep `error` (`#b3261e`).
`rating` stays `#facc15` for now.

Contrast is tested over the stylesheet itself in `frontend/src/contrast.test.ts` (50 pairs per theme): text at
4.5:1 or more, large text and UI parts at 3:1. Minimums on 2026-11-21: light text 5.37 (bronze on
`surface-container`), UI 3.36; dark text 4.85 (white on `action-fill`), UI 4.54.

## Type

- **Cinzel** (`--font-cap`, `font-cap`), 600 and 700: the wordmark, fixed page titles and section titles only.
  Never user content, labels, buttons, prices or body text. Its text gets `font-size-adjust: none`.
- **Alegreya Sans** for everything else: `--font-headline`, `--font-body` and `--font-label` are all Alegreya Sans,
  because `font-headline` is on listing titles (user content). Weights 400, 500, 700 and 800; a `font-semibold`
  (600) draws 700, the nearest weight loaded.
- Both are self-hosted from `@fontsource/cinzel` and `@fontsource/alegreya-sans` (5.3.0, exact), only their
  `latin` and `latin-ext` subsets (ș and ț are in latin-ext). The Material Symbols link stays on Google Fonts.
- **Figures.** Alegreya Sans defaults to old-style figures, so `body` sets `font-variant-numeric: lining-nums`.
  Prices, counts, IDs and stats add `tabular-nums`; a base rule gives every `.tabular-nums` the lining figure too
  (Tailwind writes `font-variant-numeric` whole, so `tabular-nums` alone would drop it).
- **Size.** Alegreya Sans has a small x-height, so `body` sets `font-size-adjust: 0.5`; the icon font and Cinzel set
  `none`. Brief 14's `--text-*` sizes stay.

`frontend/e2e/identity.spec.ts` checks that ă â î ș ț render in each face with no fallback glyphs (Chromium's
`CSS.getPlatformFontsForNode`), that each font file loads once from the app's origin, and that a price, a count and
an ID compute lining figures.

## Shape and depth

- Stone-cut radii: `rounded-control` and `rounded-xl` 6px (controls, cards, panels), `rounded-2xl` 6px (the sell
  band, sheets, search), segments `rounded-lg` 4px.
- Shadows are tinted with porphyry (`rgba(45, 16, 38, …)`) in light; dark keeps black.

## The primitives

- `Button` `primary` is `action-fill` with `on-action-fill`; `secondary` is the tonal tint; all buttons are bold
  with a little tracking.
- `Badge` `verified` is the Verificat chip: porphyry, a gold check, a 1px gold inset ring, 4px corners. The laurel
  marks the brand only, never a seller.
- `Chip`, the segments and `ThemeSwitch` take their selected state from `primary-fixed` and a `primary` outline;
  `Card` takes the 6px radius from the token.

## The shell (brief 22)

- `frontend/src/core/components/brand/`: `BRAND` (`name` for sentences and accessible names, `lettering` for the
  wordmark), `Wordmark` (`tone="bar"` gold, `tone="ink"` ink with a gold laurel), `Laurel` (the comps' path, not
  redrawn) and `Frieze` (`place="bar"` or `"footer"`, a unique pattern id per instance). All ornament is
  `aria-hidden`, unfocusable and without a hit area.
- The wordmark: Cinzel 700 at 26px, .12em; 18px at .07em with a 20px laurel under 768px; on the bar the laurel hides
  under 380px, so the signed-in bar (bell, Adaugă Anunț) fits at 360px.
- The bar: porphyry, the current place underlined 3px in gold with square ends, Conectare and the account button
  outlined in gold. Focus rings on the bar are gold (8.7:1 on porphyry); places draw theirs inset.
- The frieze sits under the bar (it scrolls away; the bar stays) and over the footer, never inside content.
- The footer: `© <year> {footer.copyright}`, the year as `toRoman(year)` (`core/lib/roman.ts`) `aria-hidden`, with a
  visually hidden Arabic year beside it; the locale string no longer holds the year.
- The phone bottom bar keeps brief 14's five places; the current place is red text on a red tint, its pill round.

## Home (brief 23)

- The hero: the tufa band (`surface-container-low`, no shadow), the search in `Tabula` (brand/: a 1px gold border, a
  5px marble gap and a second gold rule, 4px on phones; dovetail handles 30 × 84, 19 × 54 under 768px, gone under
  600px) between two `Column`s at the band's edges from 1000px. The tablet is `min(1080px, 100% - 236px)` wide from
  1000px, `100% - 64px` from 768px, `100% - 40px` from 600px and full width below. The title is Cinzel 600 at 36/42
  (22/28 and one line on phones).
- The first screen is brief 14's: at 1280 × 800 the hero ends at y 337 and all 13 tiles and Vezi toate categoriile
  are whole; at 390 × 844 six tiles are whole above the bottom bar. The ornament gives way, never the content.
- Category tiles: brief 14's raised card with an arched niche (40 × 48, 44px tall under 600px; a round top over 3px
  corners, `niche` fill, a gold ring, a bronze icon). The Material Symbols stay in the niches.
- Section heads: Cinzel 600 at 26/32 (21/28 on phones) over one 1px gold rule.
- Cards (`ListingCard`, shared by the category grid, the profile, related listings and the dashboard): `CardPrice`,
  bronze 800 with lining tabular figures and a smaller RON; `Badge variant="verified"`.
- The sell band: porphyry with a 1px gold inset ring, a Cinzel title, the laurel at 200px on the right (gone under
  768px, as the comps draw it); Postează un Anunț Acum is the marble fill, Cum funcționează? the gold outline, both
  with the bar's gold focus ring. Caută is the page's one red fill.

## Category and search (brief 24)

- The band (`categories/components/ResultsBand.tsx`, shared by the category page and the search results) keeps
  brief 14's behaviour and gets a 1px gold rule along its bottom under its shadow. The title is Cinzel 600, .03em, at
  30/36 (24/30 on phones), `text-balance` and never truncated; a title that repeats the query is user text and stays
  Alegreya Sans (`titleIsUserText`).
- Selected states (segments, the view toggle, the sheet's chips, the active chips) are the red outline and tint;
  the slider's track and thumbs are red as a control in use; Autor Verificat is porphyry when on. The filter-count
  badge is the tint too, so on desktop nothing in the band is filled red; on phones Filtre is the one red fill.
- The readout is "0 RON – 100.000+ RON", a spaced en dash (U+2013), in lining figures like every figure in the band.
- The count uses the locale's plural keys (`search.count`): "1 anunț găsit", "2 anunțuri găsite", "20 de anunțuri
  găsite" (Romanian's `other` form, from 20). It was hard-coded with "de" on the category page and without it on the
  search page.
- The band's small controls live in `BandControls.tsx`.

