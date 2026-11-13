---
summary: The Carpathian Clear design system as shipped by brief 14 ("The filter band"): colour roles in both themes, the one typeface, radii, shadows, the type scale, the navy shell and where the tokens live; the pre-redesign values are kept as history.
updated: 2026-11-13
---

# Carpathian Clear Design System

The visual language of PiațăRo (code name my-olx). It follows Material Design 3 role names. Brief 14 (2026-11-13)
changed the values and the layout and kept every role name. Token file for the design tool:
`design/design-system/carpathian-clear.json` (light values). The code's tokens: the `@theme` block and the
`:root[data-theme="dark"]` block of `frontend/src/index.css`.

## Color tokens (light)

| Role | Hex | Usage |
|---|---|---|
| Primary | `#1a5f9e` (Voroneț azure) | Buttons, prices, links, the chosen segment's edge, the focus ring |
| Secondary | `#375a7f` (slate blue) | The footer wordmark only; `secondary-container` is the tonal button (Contactează Autorul) |
| Tertiary | `#2a6a2f` | Verified badges and the on state of a switch |
| Nav band | `#0f3a63` | The navy shell: the top bar and the home call-to-action band |
| Ground | `#f2f2ee` (`background`, `surface`) | The page; a warm stone, not white |
| Card | `#fefefc` (`surface-container-lowest`) | Cards, the filter band, panels, sheets |
| Well | `#e9e8e2` (`surface-container-low`) | Segment tracks, field backgrounds, a missing preview |
| Footer | `#e8e8e3` (`surface-container`) | The footer |

Muted text is `on-surface-variant` (`#4f5157`); `outline` (`#7a7c83`) is for field and switch edges, never for
text. Dark (the owner reviewed it on the board): `primary` `#8fc3ee`, `background` `#131416`, `nav-band`
`#0e2338`. In dark, `surface-container-lowest` (`#232529`) is the *lightest* container so cards lift off the page,
the reverse of Material 3's order, on purpose. Do not "fix" it. Teal is gone from the UI.

New tokens: `nav-band`, `on-nav-band`, `on-nav-band-variant`, `radius-control`, `shadow-band`, `shadow-bar` and the
seven `--text-*` sizes. Contrast over the stylesheet's own values is tested in `frontend/src/contrast.test.ts`
and `frontend/src/index.css.test.ts`.

## Typography

One face, **Schibsted Grotesk**, self-hosted from `@fontsource-variable/schibsted-grotesk` (5.3.0, registered as
`"Schibsted Grotesk Variable"`), for `font-headline`, `font-body` and `font-label`. Three weights are used: 400, 600
and 800. Six sizes, as `--text-*` tokens: `hero` 40/46 (30/36 on a phone), `title` 30/36 (24/30), `price` 24/28,
`body` 16/24, `card-title` 16/22, `control` 14/20 and `label` 12/16. Sentence case everywhere; no CSS capitals and no
tracked small caps. The Material Symbols icon font keeps its Google Fonts link (the owner's call: moving it is out
of scope).

## Shape and depth

- Radii: `rounded-control` **10px** (buttons, fields, the sort select), `rounded-xl` **12px** (cards, tracks,
  panels), `rounded-2xl` **16px** (the call-to-action band, sheets), segments `rounded-lg` 8px.
- Cards and panels carry a 1px `outline-variant` edge and `shadow-card`; the filter band and home hero carry
  `shadow-band`; the phone bottom bar `shadow-bar`; popups `shadow-popup`. No glass blur.

## The shell and the layout

- A navy top bar in flow (sticky): the wordmark, three places (Categorii, Favorite, Mesaje) with the current one
  underlined 3px, Conectare outlined on the right. Signed in: the bell, the account button with the display name, and
  a filled Adaugă Anunț.
- Phones get a bottom bar of five places (Acasă, Categorii, Favorite, Mesaje, Conectare or Contul meu) instead of a
  menu drawer; Adaugă Anunț stays in the top bar.
- The category and search screens are one raised **filter band**: title, count, view toggle and sort on one line,
  every option of every group showing, then the price range, Autor Verificat and Resetează Filtre on one row, with
  removable chips under it. On a phone a `Filtre` button opens a bottom sheet that applies its picks together from
  `Aplică filtrele`.
- Content is 1240px wide (`max-w-310`), cards sit on the grey ground in a four-column grid at 1280.

## Reference files

- Token JSON: `design/design-system/carpathian-clear.json`
- HTML mockups from before the redesign: `design/screens/` and `design/code/`

## Romanian design conventions (from market research)

- Warm, direct palettes preferred over cold minimalism (the stone ground follows this)
- Red-and-white (Mărțișor) has deep cultural resonance — use seasonally
- Traditional geometric patterns (from ie, covor) are in fashion revival
- Romanian-language CTAs outperform English in domestic campaigns

## History: Carpathian Clear before brief 14

| | Before 2026-11-13 |
|---|---|
| Primary / Secondary / Tertiary | `#0056D2` / `#008B8B` / `#2E7D32` (the code's `primary` was `#0040a1`) |
| Headlines / Body | Manrope / Inter |
| Ground | `#faf8ff` (light), `#11131a` (dark) |
| Radius | 8px |

Brief 12 (2026-11-12) added the Light / Dark / System switch in the footer; a first visit is light. The dark values
were that brief's default. Every text/surface pair the app uses is tested at 4.5:1.

## Open questions

- Motion / animation tokens?
- Should seasonal color variants (Mărțișor red-white, Crăciun palette) be defined as token overrides?
- `Mai multe filtre` (rarer facets behind a control) is drawn on the board but not built: no category has a
  fourth facet yet, and the API takes none.

## See also

- [stack](stack.md) — frontend tooling that consumes these tokens
- [social-media-templates](social-media-templates.md) — design conventions for Romanian SMB content
