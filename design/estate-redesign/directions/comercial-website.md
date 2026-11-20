# comercial-website (PiațăRo): two directions

Written 2026-11-12 by the art director. Repo: comercial-website, brief 14. The design system is Carpathian Clear (`corpus/wiki/carpathian-clear.md`): Material 3 role names, a blue primary, a teal secondary, Manrope for headlines and Inter for the body. Both directions keep the M3 role names (brief 14's default), Romanian copy with its diacritics, prices in RON, the Light / Dark / System `RadioGroup` in the footer (decisions.md, light on a first visit), single-choice radio filters and the native sort `<select>` (decisions.md, Q16). Blue, teal and Manrope are today's, so the registry allows them.

## 1. Today's strengths (keep all of them)

1. A familiar marketplace top bar: wordmark left, the three places (`Categorii`, `Favorite`, `Mesaje`) in the middle, `Conectare` or the account and `Adaugă Anunț` on the right. It is its own surface, set off from the page.
2. On desktop the filters sit beside the results, one group per filter type, every option visible, the current one marked, with reset at the foot.
3. The page head says where you are and how much there is: the category name large, the result count under it, view toggle and sort on the same row at the right.
4. Listing cards are white islands. Preview on top, then the price first and large in the accent, then the title, then the age with a clock icon. The favourite heart sits on the preview, and the verified badge too. The verified badge is a dark green fill with white `on-fill` text.
5. At 390 the cards fold to one full-width column and keep the heart in reach.

Faults both directions fix:
- At 390 there is no navigation (only `Conectare`) and no filters at all: `FilterSidebar` is `hidden md:block`.
- Filter titles, the price label and `VERIFICAT` are tracked capitals (Floor 9). The uppercase comes from CSS; the source strings are `Tip Licență`, `Format Fișier`, `Preț (RON)`, `Data Publicării`.
- `Resetează Filtre` is a cyan pill (`#8cf3f3`), the loudest thing on the screen for the least important action.
- A preview that fails to load prints its alt text across the card. It needs a designed placeholder.
- In light, the white card on `#faf8ff` is about 1.05:1, so cards read as flat. In dark, cards sit on `surface-container-lowest`, darker than the page, so they sink instead of lifting.
- The filter column sits loose on the ground with no surface, so it doesn't group.
- The result count and filter titles use `outline` as text (under 4.5:1 on some grounds). Text moves to `on-surface-variant`; `outline` stays for boundaries.
- The footer's share and email buttons do nothing. Keep them in the sketch, flag them on the board.

## 2. The main screen

The category page with its shell, route `/categorii/grafica`, signed out, from `board/shots-existing/comercial-12/` (no `shots.md` exists for this app; the `after-*` files are today):
- **1280:** `after-light-1280-category.png`, dark `after-dark-1280-category.png`.
- **390:** `after-light-390-category.png`, dark `after-dark-390-category.png`.

All four are 1280×900 or 390×900 viewports, not full pages. The category page wins over Home because one viewport holds the whole screen, and it carries the shell, the filters and the listing card that search, favourites and Home's featured row all reuse. Home's shot is cut at the fold (featured listings, the call to action and 8 of the 13 category tiles are in no shot).

## 3. The content fixture (word for word from the shot and the frontend source)

Size: the top bar with 3 places and 1 action, the page head, 4 filter groups (16 options, 1 range, 1 switch, 1 reset), 2 listing cards, the footer (6 links, the 3-way theme switch, 2 icon buttons). Add no listings, counts or prices.

- **Top bar (signed out).** Wordmark `Piață` + `Ro` (two colours today). Links `Categorii`, `Favorite`, `Mesaje`. Action `Conectare`.
- **Filters**, in this order, the first option chosen in each:
  - `Tip Licență`: `Toate`, `Personală`, `Comercială`, `Extinsă`.
  - `Format Fișier`: `Toate`, `ZIP`, `PDF`, `PSD`, `MP4`, `WAV`, `OTF`.
  - `Preț (RON)`: a two-thumb range at both ends, value `0 RON – 100.000+ RON`.
  - `Data Publicării`: `Oricând`, `Ultimele 24 ore`, `Ultima săptămână`.
  - Switch `Autor Verificat`, off. Button `Resetează Filtre`.
- **Page head.** `Grafică & Ilustrații`, then `2 de anunțuri găsite`. View toggle `Vedere grilă` (on) and `Vedere listă`, icon-only. Sort select showing `Cele mai noi` (options `Preț: Mic la Mare`, `Preț: Mare la Mic`, `Relevanță`).
- **Card 1.** Preview: the seed's icon sheet, an 8×4 grid of small white tiles each holding one coloured glyph (dot, check, plus, star, triangle, square) in blue, orange, teal, purple and green, on a pale blue ground. Heart button, not favourited, `aria-label` `Adaugă la favorite`. `49 RON`, `Pachet 500 Iconițe SVG`, clock icon and `Acum 2 ore`.
- **Card 2.** Same price, title and age. Badge `VERIFICAT` on the preview; draw it as `Verificat` in sentence case, untracked, with a check icon (Floor 9), and note the locale change on the board. Its preview failed to load: draw the direction's no-preview placeholder, never alt text.
- **Footer** (below the fold, from the `ro` locale and `Footer.tsx`): wordmark, `© 2026 PiațăRo. Toate drepturile rezervate.`, links `Termeni și Condiții`, `Politică de Confidențialitate`, `Politică Cookies`, `Despre`, `Ajutor`, `Contact`, the theme switch `Tema` with `Luminos`, `Întunecat`, `Sistem` (Luminos chosen in light, Întunecat in dark), icon buttons `Distribuie` and `Email`.
- **New copy both directions need:** `Filtre` for the phone filter button and sheet title (in neither locale today). A also needs `Meniu` for the drawer button. B's bottom bar uses `Acasă` and `Contul meu`, which exist in the source.

States for the Direction sheet: no results (`Niciun anunț găsit`, `Încearcă să modifici filtrele pentru mai multe rezultate.`, button `Resetează Filtrele`), load error (`Nu am putut încărca anunțurile.`, button `Încearcă din nou`), loading (a skeleton bar for the count and six card skeletons, as `ListingGrid` draws, static).

Font check for both: render `Șabloane`, `Preț`, `Iconițe` and `Ultima săptămână` and confirm ș, ț and ă come from the chosen face, not a fallback.

## 4. Directions

### A. Carpathian Clear, settled (Evolve today)
- **Idea:** today's page with real islands: the filters become one raised card, the cards lift off a deeper ground in both themes, and the phone gets its menu and its filters back.
- **Skeleton:** today's.
  - **1280.** White top bar, full width, 64 px, with a 1 px `outline-variant` bottom edge and the soft shadow. Places stay centred. Container 1280, 32 px gutters. Left: the filter card, 280 px, sticky under the bar, `surface-container-lowest`, 1 px edge, radius 16, padding 24. Groups split by hairlines. Titles 14/20 at 600 in source case, untracked. `Resetează Filtre` becomes an outlined secondary button at the card's foot. Right: the page head on the ground (title and count left, toggle and sort right), then a 3-column grid (`minmax(min(240px,100%),1fr)`).
  - **Cards.** `surface-container-lowest`, 1 px edge, the L1 shadow, radius 16. A 4:3 preview well on `surface-container-low` with the heart top-right (40 px round, raised) and the verified badge bottom-left, a check icon plus the word, untracked. Body: price, title (2 lines max), age row.
  - **390.** Top bar: wordmark, `Conectare`, and a menu button (`Meniu`) that opens a left `Drawer` with `Categorii`, `Favorite`, `Mesaje` (brief 14 step 5). Page head, then one row: `Filtre` (48 px, opens a bottom sheet holding the same filter card) with the toggle and sort. Cards one column.
- **Type:** Manrope 700 for the title (32/40 at 1280, 26/32 at 390), prices (22/28, tabular) and the wordmark (24/28 at 800). Inter for the rest: card title 16/24 at 600, body 16/24, nav and buttons 15/20 at 500, filter options and meta 14/20, badge 12/16 at 600. No 800 or 900 headings. Inter stays because Carpathian Clear names it (stamp it as found in the project).
- **Palette** (light / dark), M3 roles:
  - Ground `surface`/`background` `#eef1f6` / `#10131a`; card `surface-container-lowest` `#ffffff` / `#1f232d` (dark cards now lighter than the page); well `surface-container-low` `#e4e9f2` / `#2a303c`; footer `surface-container` `#e6eaf1` / `#181c24` with a top edge.
  - Text `on-surface` `#191c24` / `#e3e5ed`; `on-surface-variant` `#474c5a` / `#b3b8c6`.
  - Edges `outline` `#737a8c` / `#8a90a0`; `outline-variant` `#cdd3df` / `#3a404d`.
  - `primary` `#0b47a4` / `#a9c3ff`, `on-primary` `#ffffff` / `#0a2a5e`; `primary-container` (hover, carries `on-primary`) `#1a5bc4` / `#d6e2ff`; tint `primary-fixed` `#dce5f9` / `#25385f` with `on-primary-fixed` `#0b2f6c` / `#dbe5ff`.
  - `secondary` (the wordmark's `Ro` only) `#006a6a` / `#6fd7d6`. `secondary-container` `#cfe9e8` / `#1d4a4a` with `on-secondary-container` `#0b4f4f` / `#b9ecea` (no more cyan pill). The verified badge and the checked switch keep a dark fill with white `on-fill`: `tertiary-container` `#1e6b2b` / `#1c6d24` (6.6 / 6.4); `tertiary` `#1e6b2b` / `#8fd58a`. `error` `#b3261e` / `#ffb4ab`.
  - Pre-checked (WCAG 2, light / dark): on-surface on ground 15.0 / 14.8; variant on the well 7.0 / 6.7; primary on card 8.6 / 8.9; on-primary on primary-container 6.3 / 10.8; on-primary-fixed on primary-fixed 10.2 / 9.2; outline on card 4.3 / 4.9 (boundary, 3:1 needed); card on ground 1.13 / 1.18; top bar on ground 1.13 / 1.18, both with the edge; line on ground 1.33 / 1.79. Re-run `contrast.mjs`.
- **Signature:** the preview well. Every card's preview sits in the same 4:3 tinted well with the heart and the verified mark docked on it, and a missing preview shows the category's icon (`palette`) centred in the well.
- **Reference:** `airbnb`, for photo-first listing cards with the price at modest weight and quiet chrome. Nothing of its palette.
- **Reopens:** none of the recorded decisions. New copy `Filtre` and `Meniu`.

### B. The filter band
- **Idea:** the filters leave the side column for a raised band across the top of the page, every option still in view, so the results take the whole width, and the phone gets a bottom bar and a filter sheet.
- **Skeleton:** the screen is divided top to bottom instead of left and right.
  - **1280.** A 64 px sticky top bar in the `nav-band` colour: wordmark, then the places left-aligned beside it, `Conectare` outlined on the right; the current place underlined 3 px. Under it, a full-width raised category band (`surface-container-lowest`, 1 px bottom edge), not sticky. Row 1: title and count left, toggle and sort right. Row 2 and 3, the filter band: every option stays visible, each group a labelled segmented control that is still a single-choice radio group (`Tip Licență` 4 segments, `Format Fișier` 7, `Data Publicării` 3), then the `Preț (RON)` range at 240 px, the `Autor Verificat` switch and `Resetează Filtre` as a text button at the end. The chosen segment fills with `primary-fixed`. Groups wrap; never scroll sideways at 1280. Below the band: a 4-column grid in a 1240 container, cards as in A but radius 12 and the price above the title at 24/28.
  - **390.** Sticky band top bar, 56 px: the wordmark only (signed in, the bell joins it). Category band, not sticky: title, count, then `Filtre` (48 px; it shows a count only when a filter is off its default, so none here) beside the toggle and sort; under it a row of chips naming each group's value (`Format Fișier: Toate`) that scrolls sideways, each opening the sheet. The sheet holds every group, several picks per visit. Cards one column. A bottom bar, 64 px plus the gesture inset: `Acasă`, `Categorii` (current), `Favorite`, `Mesaje`, and `Conectare` signed out (`Contul meu` signed in), icon over label. Pad the page by the bar's height.
  - Not lantern's one column of horizontal cards, and not the-board's lanes: a grid under a raised band of title and filters.
- **Type:** Schibsted Grotesk throughout. Wordmark 22/28 at 800. Title 30/36 at 700 (24/30 at 390). Price 24/28 at 800, tabular. Card title 16/22 at 600; segments and chips 14/20 at 500, the chosen one at 600; body 16/24; meta 14/20; bottom bar labels 12/16 at 500.
- **Palette** (light / dark), M3 roles plus three new tokens:
  - Ground `surface` `#f2f2ee` / `#131416`; card and band `surface-container-lowest` `#ffffff` / `#232529`; well `surface-container-low` `#e9e8e2` / `#2e3035`; footer `surface-container` `#e8e8e3` / `#1b1c1f` with a top edge.
  - Text `on-surface` `#1b1c1f` / `#e8e8e4`; `on-surface-variant` `#4f5157` / `#b5b6b0`. Edges `outline` `#7a7c83` / `#8d8f93`; `outline-variant` `#d3d3cc` / `#3b3d42`.
  - `primary`, Voroneț azure, `#1a5f9e` / `#8fc3ee`, `on-primary` `#ffffff` / `#06294a`; `primary-container` `#154f85` / `#cfe6fa`; `primary-fixed` `#d9e8f5` / `#1d3a55` with `on-primary-fixed` `#0e3a63` / `#d6e8f7`.
  - New: `nav-band` `#0f3a63` / `#0e2338`, `on-nav-band` `#ffffff` / `#e8eef5`, `on-nav-band-variant` (the wordmark's `Ro`) `#a9d2f2` / `#8fc3ee`.
  - `secondary` (footer wordmark `Ro`) `#375a7f` / `#a9c6e4`; `secondary-container` `#dfe7f0` / `#2a3a4c` with `on-secondary-container` `#1d3550` / `#d5e3f2`. Teal leaves the app. The verified badge keeps a dark fill with white `on-fill`: `tertiary-container` `#2a6a2f` / `#1c6d24` (6.6 / 6.4); `tertiary` `#2a6a2f` / `#8fd18f`. `error` as A.
  - Pre-checked (light / dark): on-surface on ground 15.2 / 15.0; variant on well 6.5 / 6.5; primary on card 6.6 / 8.2; on-primary on primary-container 8.4 / 11.5; primary on primary-fixed 5.3 / 6.3; on-nav-band on band 11.6 / 13.7; nav variant on band 7.3 / 8.5; band on ground 10.4 / 1.16 (dark band gets the edge); card on ground 1.12 / 1.20; outline on card 4.2 / 4.7. Re-run `contrast.mjs`.
- **Signature:** the filter band. Every option of every group sits in one raised band above the results, the chosen segment filled, so the whole search reads at a glance across the full width.
- **Reference:** `ibm`, for a solid shell band with the content's controls in a flush band right under it. Nothing of its palette or type.
- **Reopens:** Carpathian Clear's faces (Manrope + Inter become Schibsted Grotesk), its colours (azure primary, teal dropped, a navy band) and the two-tone wordmark's colours. The shell moves (filters to a band over the results, a phone bottom bar). Flag each on the board.

## 5. Owner questions

1. Which direction?
2. B reopens the Carpathian Clear identity (faces, azure for the blue, no teal, a navy top bar). Is a new look on the table, or does the blue-and-teal brand stay?
3. Phone navigation: a menu `Drawer` from the top bar (A, as brief 14 step 5 suggests) or a five-place bottom bar (B, the estate's default for phones)?

Note for the board, not a question: both add `Filtre` (and A `Meniu`) to both locale files, and both draw `VERIFICAT` as `Verificat`. `Resetează Filtre` and `Autor Verificat` stay as written in the sketch; sentence case for them is the owner's call. The meaning stays either way.

## 6. Registry lines

| comercial-website (A) | Carpathian Clear, settled | Manrope (today's) | Inter (today's) | Carpathian blue (today's), teal only in the wordmark | white top bar with centred places; a raised 280 px filter card on the left; head row over a 3-column grid of preview-well cards; phone menu drawer and a filter sheet |
| comercial-website (B) | The filter band | Schibsted Grotesk | Schibsted Grotesk | Voroneț azure (blue family, today's) with a navy band | navy top bar with left places; a raised band of title, sort and every filter as segmented radios; a full-width 4-column grid; phone bottom bar of five places, value chips and a filter sheet |
