---
title: Update Categories for Digital-Assets Focus
slug: categories-update
type: update
priority: high
status: pending
area: backend, frontend
updated: 2026-05-28
---

# Update Categories for Digital-Assets Focus

## What

The current category list was inherited from the physical-goods OLX-clone era. Several slugs (`electronice`, `auto`, `imobiliare`, `casa-gradina`, `moda`, `joburi`, `servicii`, `sport`, `gratuit`) make no sense for a digital-assets marketplace. Replace with digital-native categories aligned with the product roadmap.

## Current categories (to remove or rename)

`software`, `grafica`, `sabloane`, `audio`, `video`, `ebook`, `fonturi`, `cod-sursa`, `diverse`  
plus legacy: `electronice`, `auto`, `imobiliare`, `casa-gradina`, `moda`, `joburi`, `servicii`, `sport`, `gratuit`

## Proposed new category list

| Slug | Label (RO) | Notes |
|---|---|---|
| `grafica` | Grafică & Ilustrații | AI art, icons, illustrations, textures |
| `sabloane` | Șabloane & Template-uri | UI kits, social media templates, web templates |
| `software` | Software & Aplicații | Desktop/mobile apps, scripts, plugins |
| `cod-sursa` | Cod Sursă | Source code, components, snippets |
| `audio` | Audio & Muzică | Music, sound effects, loops |
| `video` | Video & Motion | Stock footage, motion graphics, LUTs |
| `ebook` | E-Bookuri & Cursuri | PDF guides, course materials |
| `fonturi` | Fonturi | Typefaces, font bundles |
| `documente` | Documente & Template-uri Legale | GDPR kits, HR templates, contracts, invoices |
| `3d` | Modele 3D & AR | 3D models, scenes, characters |
| `mestesugart` | Artizanat Digital | Embroidery DST/PES, coloring pages, print patterns |
| `diverse` | Diverse | Catch-all |

## Changes required

**Backend:**
- `migrations/` — new migration to update `CHECK` constraints if any (SQLite has none on category currently — just a TEXT column, so no migration needed for existing rows)
- `listings-helpers.ts` — update `CATEGORY_LABELS` map
- `CONTRACT.md` — update category list
- `backend/app/src/modules/locations.ts` — no change (different data)

**Frontend:**
- `frontend/src/app/modules/home/pages/HomePage.tsx` — update CATEGORIES array (slugs + labels + icons)
- `frontend/src/app/modules/categories/` — update category pages
- `frontend/src/app/modules/create-listing/` — update category picker step
- i18n translations in `public/locales/ro/common.json` — add new category label keys

## Migration strategy

Existing seed listings use old slugs (`electronice`, `auto`, etc.) — re-seed or update them. No real user data to worry about at this stage.

## Acceptance criteria

- [ ] All 12 new categories shown on homepage
- [ ] Create listing form offers new categories only
- [ ] Category detail pages exist for each new slug
- [ ] Old category slugs return 404 or redirect
- [ ] CATEGORY_LABELS updated in backend response serialization
