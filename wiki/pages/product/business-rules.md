---
title: Business Rules
slug: business-rules
category: product
tags: [rules, constraints, listings, assets, pricing]
sources: 1
updated: 2026-05-27
---

# Business Rules

Enforced constraints that define how the marketplace operates. Violations should be caught in `services/` layer and returned as `AppError` variants.

## Listings

- **Rate limit:** A user may create at most **5 listings per 7-day rolling window** (free tier). Enforced in `services/listings.ts`.
- **Expiry:** Every listing expires **30 days** after creation. Auto-set at creation time; expired listings are no longer visible to buyers.
- **Draft vs. published:** A listing cannot be published until it has ≥1 downloadable asset file attached. Preview images alone do not satisfy this requirement.

## Assets (downloadable files)

- **Required for publish:** At least one file with a real file format (zip, pdf, psd, mp4, etc.) must be uploaded before a listing can go live.
- **Metadata stored:** `file_format`, `file_size_bytes`, `download_count`, `license_type`.
- **License types:** `personal | commercial | extended`.
- **Download endpoint:** `GET /listings/:id/download` — authenticated buyers only.

## Pricing

- **Currency:** RON only.
- **Optional:** Price may be `null` / `None`, meaning the listing is free.
- **No platform fee defined yet** (TBD at payment integration stage).

## Users

- **Auth:** JWT + Argon2. `password_hash` stored, never plaintext.
- **Roles:** Currently seller = buyer = same account. No separate role distinction yet.

## Categories (exhaustive list)

`software`, `grafica`, `sabloane`, `audio`, `video`, `ebook`, `fonturi`, `cod-sursa`, `diverse`

## Localization

- Romanian required throughout the UI.
- Correct diacritics: ă â î ș ț (not ş ţ — use cedilla variants, not comma variants).

## Open questions

- Premium tier: how many listings/week? Is the limit per-user or per-subscription-tier?
- Expiry: should sellers be able to renew? Automatic renewal?
- Download limits per buyer per purchase?

## See also

- [[listing]] — entity definition
- [[asset]] — asset entity
- [[overview]] — project context
