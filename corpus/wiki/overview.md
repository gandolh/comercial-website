---
summary: What PiațăRo (code name my-olx) is, a Romanian digital-files marketplace, and where it stands: a deployed demo with fake payments, decided 2026-11-03.
updated: 2026-05-28
---

# my-olx — Project Overview

**my-olx** is a Romanian digital-assets marketplace. Sellers upload downloadable files; buyers purchase and download them. No physical goods, no shipping. The platform is entirely in Romanian, prices in RON, and targets Romanian creators, freelancers, and SMBs.

## What it is

A self-serve platform for Romanian creators to sell digital work:
- Templates (șabloane), graphics (grafică), fonts, source code, software, audio, video, e-books, AI art, and a catch-all "diverse" category.
- Pricing in RON; listings can be free (price = null).
- Buyers get a secure download link after purchase.

## Current state (2026-11-03)

Built in April and May 2026 (auth, listings, digital-asset upload and download, orders with a fake
payment provider, invoices, reviews, bundles, search), then paused. On 2026-11-03 the owner decided it
becomes a **deployed demo with fake payments**, signed into only by the owner, at `<domain>/piataro`.
See [decisions.md](decisions.md) and [status.md](status.md).

## Architecture at a glance

| Layer | Tech |
|---|---|
| Backend | Node.js + TypeScript + Fastify; npm workspace (`@my-olx/core` + `@my-olx/app`) |
| DB | SQLite (`better-sqlite3`) + Kysely; migrations auto-run at startup |
| Auth | JWT + Argon2 |
| Storage | Disk (`data/uploads/`); served via `@fastify/static` at `/uploads/<key>` |
| Frontend | React + Vite + Tailwind CSS v4 + React Query v5 |
| Infra | No Docker — runs with `npm run dev` only |

## Key numbers / rules

- Free tier: 5 listings/week per user
- Listings expire after 30 days
- Publishing requires ≥1 downloadable asset file (images alone don't count)
- Target: < 3 min listing creation time
- Accessibility: WCAG 2.1 AA

## Market position

No existing platform combines: Romanian language + RON pricing + e-Factura generation + Romanian-specific niches. The closest competitors (legalup.ro, kitgdpr.ro) are document-only shops, not general digital marketplaces.

## Open questions

The real-launch questions the demo decision parked are on [open-questions.md](open-questions.md).

## See also

- [business-rules](business-rules.md) — enforced constraints
- [stack](stack.md) — tech stack detail
- [product-ideas](product-ideas.md) — all planned product categories
- [listing](listing.md) — core domain entity
