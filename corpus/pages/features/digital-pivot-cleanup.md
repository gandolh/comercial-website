---
title: Digital Pivot — Physical-Goods Cleanup & Category Overhaul
slug: digital-pivot-cleanup
category: product
tags: [categories, cleanup, physical-goods, locations, seed-data]
sources: 0
updated: 2026-05-29
---

# Digital Pivot — Physical-Goods Cleanup & Category Overhaul

The foundational change that completed the pivot from the OLX-era physical-goods clone to a
digital-assets-only marketplace. Originated from todos `remove-physical-goods-remnants`,
`categories-update` (done together — they edited the same files).

## Physical-goods removal

- `city` and `is_negotiable` removed from the listing API (request acceptance + `ListingResponse` /
  `ListingDetailResponse`) and from all frontend display. **DB columns kept** (not dropped) — a later
  cleanup migration can drop them; data isn't lost.
- `city` filter removed from listing search params.
- **Locations module deleted** — `modules/locations.ts`, the `/locations/*` routes, and the 600KB
  `data/cities-by-counties.json` are gone.
- Create-listing wizard no longer has a city step; `ListingCard` / `ListingDetailPage` drop city display.
- Seed data updated: `20260428010000_seed_data.sql` now seeds 5 digital-asset listings; the locations
  seed (`20260429010000_seed_locations.sql`) is emptied to a no-op (file retained because the migrator
  tracks applied filenames).
- Side effect: deleting the only file in `backend/app/src/data/` broke the `copy-assets` build step;
  the script was made tolerant of a missing `src/data` directory.

## Category overhaul

12 digital-native categories replace the OLX-era slugs (electronice, auto, imobiliare, etc.):

| slug | label (RO) | | slug | label (RO) |
|---|---|---|---|---|
| grafica | Grafică & Ilustrații | | ebook | E-Bookuri & Cursuri |
| sabloane | Șabloane & Template-uri | | fonturi | Fonturi |
| software | Software & Aplicații | | documente | Documente & Template-uri Legale |
| cod-sursa | Cod Sursă | | 3d | Modele 3D & AR |
| audio | Audio & Muzică | | mestesugart | Artizanat Digital |
| video | Video & Motion | | diverse | Diverse |

Updated in backend `CATEGORY_LABELS` (`listings-helpers.ts`), frontend HomePage/CategoryStep/category
pages, and i18n `categories.*`. Category is a free TEXT column (no CHECK constraint), so no migration
was needed.

> **Update 2026-05-29:** a 13th category `invitatii` ("Invitații Digitale") was added for Romanian
> event-invitation templates (nuntă, botez, cununie, logodnă, majorat, aniversări, sărbători). Same
> add-only edit pattern: backend `CATEGORY_LABELS`, frontend `CATEGORY_SLUGS` (Zod enum) +
> `CATEGORY_LABELS` + the three `CATEGORIES` arrays (icon `celebration`), and `ro`/`en` i18n. No
> migration. Event type (nuntă/botez/…) is expressed in the listing title, not as separate categories.

> Note: this supersedes the 9-category list still quoted in `SCHEMA.md` "Domain context" and `CLAUDE.md`
> — the canonical list is the 12 above.

## Open questions

- **Old category slugs do not 404/redirect** — they simply have no listings. No explicit redirect shipped.
- `city` / `is_negotiable` DB columns linger unused, awaiting a future drop migration.

## See also

- [[listing]] — the entity whose schema/categories changed
- [[business-rules]] — category list
