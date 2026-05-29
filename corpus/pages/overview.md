---
title: my-olx — Project Overview
slug: overview
category: synthesis
tags: [project, overview, marketplace, digital-assets, romania]
sources: 2
updated: 2026-05-28
---

# my-olx — Project Overview

**my-olx** is a Romanian digital-assets marketplace. Sellers upload downloadable files; buyers purchase and download them. No physical goods, no shipping. The platform is entirely in Romanian, prices in RON, and targets Romanian creators, freelancers, and SMBs.

## What it is

A self-serve platform for Romanian creators to sell digital work:
- Templates (șabloane), graphics (grafică), fonts, source code, software, audio, video, e-books, AI art, and a catch-all "diverse" category.
- Pricing in RON; listings can be free (price = null).
- Buyers get a secure download link after purchase.

## Current state (2026-05-28)

Early stage. Core implemented: user auth, listings CRUD, digital-asset upload/download (multipart), SQLite database with auto-migrations. Frontend and backend both in active development. No payment processing yet.

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

- Payment processing (Stripe? Romanian PSP like Netopia/TWISPAY?)
- ~~Buyer review/rating system~~ — shipped 2026-05-29, verified-purchase gated. See [[reviews-ratings]].
- Creator payout flow (payment-in exists; money-out to sellers still unbuilt)
- Premium seller tier (higher listing limit)
- e-Factura generator as platform feature

## See also

- [[business-rules]] — enforced constraints
- [[stack]] — tech stack detail
- [[product-ideas]] — all planned product categories
- [[listing]] — core domain entity
