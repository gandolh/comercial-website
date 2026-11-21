# Romania Classifieds Platform — Design Assets

Stitch Project ID: `5209956150192006015`

## Directory Structure

```
design/
├── screenshots/          # Screen preview images (PNG)
├── code/                 # Generated HTML code for each screen
├── design-system/        # Design system tokens and documentation
├── estate-redesign/      # The approved redesign "The filter band" (brief 14): a copy of the estate board's page, see its README.md
└── roman-rebrand/        # Comps for the Roman rebrand (briefs 21-26, approved 2026-11-21), rendered HTML, light and dark; board-notes.md, critique.md and shots/ copy the board's row. What shipped: corpus/wiki/roman-identity.md
```

## Screens

| Screen | Screenshot | HTML Code |
|--------|-----------|-----------|
| Homepage - Editorial Marketplace | `screenshots/homepage-editorial-marketplace.png` | `code/homepage-editorial-marketplace.html` |
| Listing Detail Page | `screenshots/listing-detail-page.png` | `code/listing-detail-page.html` |
| Category Browsing & Filters | `screenshots/category-browsing-filters.png` | `code/category-browsing-filters.html` |
| Editorial Marketplace Navigation | _(no screenshot)_ | `code/editorial-marketplace-navigation.html` |
| Design Brief: Romanian Marketplace | _(no screenshot)_ | `code/design-brief-romanian-marketplace.html` |

## Design System — the Roman identity (since 2026-11-21)

| Token | Value |
|-------|-------|
| Color Mode | Light, Dark and System (dark values in `frontend/src/index.css`) |
| Capitals Font | Cinzel 600/700: the wordmark, fixed page titles and section titles only |
| Headline / Body / Label Font | Alegreya Sans 400/500/700/800, lining figures, size adjust 0.5 |
| Roundness | 6px (controls, cards, panels), 4px (segments) |
| Primary (vexillum red) | `#9A2617`: links, the current place, the selected state, a control in use; `action-fill` is the one filled action |
| Shell (porphyry, `nav-band`) | `#2D1026` |
| Gold / Bronze (`gold-ink`) | `#B8892E` for lines and ornament only / `#6F5216` for prices and small words |
| Ground / Card | `#F1ECE2` travertine / `#FDFBF6` marble |

Full token reference: [`design-system/roman-identity.json`](design-system/roman-identity.json) (light values, recorded
from the code). Comps: [`roman-rebrand/`](roman-rebrand/). What shipped: `corpus/wiki/roman-identity.md`.

## Design System — Carpathian Clear (history)

Replaced by the Roman identity on 2026-11-21; kept as history. Asset ID: `assets/d828a36af45c4a7aa1fd71d45bf95404`

| Token | Value |
|-------|-------|
| Color Mode | Light |
| Headline Font | Manrope |
| Body Font | Inter |
| Label Font | Inter |
| Roundness | Round Eight (8px) |
| Primary Color | `#0056D2` |
| Secondary Color | `#008B8B` |
| Tertiary Color | `#2E7D32` |
| Color Variant | Fidelity |

Full token reference: [`design-system/carpathian-clear.json`](design-system/carpathian-clear.json)  
Design guidelines: [`design-system/carpathian-clear.md`](design-system/carpathian-clear.md)
