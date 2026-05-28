---
title: Carpathian Clear Design System
slug: carpathian-clear
category: tech
tags: [design, ui, tokens, tailwind, typography, color, material-design-3]
sources: 1
updated: 2026-05-28
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

## Open questions

- Dark mode planned?
- Motion / animation tokens?
- Should seasonal color variants (Mărțișor red-white, Crăciun palette) be defined as token overrides?

## See also

- [[stack]] — frontend tooling that consumes these tokens
- [[social-media-templates]] — design conventions for Romanian SMB content
