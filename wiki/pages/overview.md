---
title: my-olx — Project Overview
slug: overview
category: synthesis
tags: [project, overview, marketplace, digital-assets]
sources: 1
updated: 2026-05-27
---

# my-olx — Project Overview

**my-olx** (formerly "PiațăRo") is a Romanian digital-assets marketplace. Sellers upload downloadable files; buyers purchase and download them. No physical goods, no shipping, no location or city metadata.

## What it is

A self-serve platform for Romanian creators and developers to sell digital work:
- Templates (șabloane), graphics (grafică), fonts, source code, software, audio, video, ebooks, and a catch-all "diverse" category.
- Pricing in RON; listings can be free (price = None).
- Buyers get a secure download link after purchase.

## Current state (2026-05-27)

Early stage. Core implemented: user auth, listings CRUD, digital-asset upload/download. Frontend and backend both in active development.

## Architecture at a glance

| Layer | Tech |
|---|---|
| Backend | Node.js + TypeScript + Fastify; npm workspace (`@my-olx/core` + `@my-olx/app`) |
| DB | PostgreSQL 16 via Kysely + raw SQL migrations |
| Auth | JWT + Argon2 |
| Storage | S3-compatible (LocalStack in dev, real S3 in prod) |
| Frontend | React 18 + Vite + Tailwind CSS v4 + React Query v5 |
| Infra (dev) | docker-compose: Postgres, LocalStack, MailHog |

## Key numbers / rules

- Free tier: 5 listings/week per user
- Listings expire after 30 days
- Publishing requires ≥1 downloadable asset file (images alone don't count)
- Target: < 3 min listing creation time
- Accessibility: WCAG 2.1 AA

## Open questions

- Payment processing integration (Stripe? Romanian PSP?)
- Buyer review/rating system
- Creator payout flow
- Subscription / premium seller tier above free 5/week

## See also

- [[business-rules]] — full list of enforced rules
- [[stack]] — tech stack detail
- [[listing]] — core domain entity
- [[asset]] — downloadable file entity
- [[user]] — seller/buyer entity
