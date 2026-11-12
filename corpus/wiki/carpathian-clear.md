---
summary: The Carpathian Clear design system: colour roles, type, radii and where the tokens live.
updated: 2026-11-12
---

# Carpathian Clear Design System

The visual language of my-olx. Follows Material Design 3 conventions. Token file: `design/design-system/carpathian-clear.json`.

## Color tokens

| Role | Hex | Usage |
|---|---|---|
| Primary | `#0056D2` | CTAs, links, active states |
| Secondary | `#008B8B` | Accents, badges, secondary actions |
| Tertiary | `#2E7D32` | Success, positive indicators |

## Typography

| Role | Font |
|---|---|
| Headlines | Manrope |
| Body | Inter |

## Shape

- Border radius: **8px** (`rounded-xl` in Tailwind v4)

## Reference files

- Token JSON: `design/design-system/carpathian-clear.json`
- HTML mockups: `design/screens/` and `design/code/`

## Romanian design conventions (from market research)

- Warm, direct palettes preferred over cold minimalism
- Red-and-white (Mărțișor) has deep cultural resonance — use seasonally
- Traditional geometric patterns (from ie, covor) are in fashion revival
- Blue (`#0056D2`) is trusted for professional/B2B contexts
- Romanian-language CTAs outperform English in domestic campaigns

## Dark theme

Brief 12 (2026-11-12) added a Light / Dark / System switch in the footer. The roles keep their names and
`frontend/src/index.css` redefines them under `:root[data-theme="dark"]`; a first visit is light. The dark values
are the brief's default, taste calls the owner can change: `primary` `#b2c5ff`, `surface` `#11131a`,
the surface ladder from `#0c0e14` (lowest) to `#33353c` (highest), `error` `#ffb4ab`, `inverse-surface`
`#e1e2ec`. Two choices differ from stock Material 3, because the app's classes pair roles in ways M3 does
not: `primary-container` is the *lighter* blue `#d9e2ff` (the buttons' hover and the hero block sit on it with
`on-primary` text), and `tertiary-container` keeps `#1c6d24`. `scrim` and `on-fill` are roles of their own so a
dialog's dim is black in dark and white-on-badge text stays white. Every text/surface pair the app uses is
tested at 4.5:1 in `frontend/src/index.css.test.ts`.

## Open questions

- ~~Dark mode planned?~~ Answered 2026-11-12: yes, shipped by brief 12. See "Dark theme" below.
- Motion / animation tokens?
- Should seasonal color variants (Mărțișor red-white, Crăciun palette) be defined as token overrides?

## See also

- [stack](stack.md) — frontend tooling that consumes these tokens
- [social-media-templates](social-media-templates.md) — design conventions for Romanian SMB content
