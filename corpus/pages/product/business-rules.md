---
title: Business Rules
slug: business-rules
category: product
tags: [rules, constraints, listings, assets, pricing, free-tier]
sources: 1
updated: 2026-05-28
---

# Business Rules

Enforced constraints that define how the marketplace operates. All violations are caught in the `services/` layer and returned as `AppError` variants mapped to HTTP status codes.

## Listings

- **Rate limit:** Max **5 listings per 7-day rolling window** per user (free tier). Enforced in `services/listings.ts`.
- **Expiry:** Every listing expires **30 days** after creation. Auto-set at creation time. Expired listings are invisible to buyers.
- **Publish requirement:** A listing cannot be published until ≥1 downloadable asset file is attached. Preview images alone do not satisfy this.

## Assets (downloadable files)

- **Required for publish:** ≥1 file with a real format (zip, pdf, psd, mp4, etc.) must be uploaded before going live.
- **Max assets per listing:** 10 files.
- **Metadata stored:** `file_format`, `file_size_bytes`, `download_count`, `license_type`.
- **License types:** `personal | commercial | extended`.
- **Download endpoint:** `GET /listings/:id/download` — authenticated users only; records each download.

## Images (preview screenshots)

- Optional; shown on listing page only.
- Max 10 images per listing.
- Uploaded as multipart directly to backend; stored on disk under `data/uploads/listings/<id>/`.
- Do NOT count toward the publish requirement.

## Pricing

- **Currency:** RON only.
- **Optional:** Price may be `null` meaning the listing is free.
- **No platform fee defined yet** — TBD at payment integration stage.

## Users

- **Auth:** JWT + Argon2. `password_hash` stored; plaintext never persisted.
- **Roles:** Seller = buyer = same account type. No role distinction yet.

## Categories (exhaustive)

`grafica`, `sabloane`, `software`, `cod-sursa`, `audio`, `video`, `ebook`, `fonturi`, `documente`, `3d`, `mestesugart`, `invitatii`, `diverse`

> Canonical list is the 13 above (see [[digital-pivot-cleanup]] for the 12-category overhaul; `invitatii` — "Invitații Digitale" — added 2026-05-29 for Romanian event templates: nuntă, botez, cununie, logodnă, majorat, aniversări, sărbători).

## Localization

- Romanian required throughout the UI.
- Correct diacritics: ă â î **ș ț** (comma-below, not cedilla-below ş ţ).

## Open questions

- Premium tier: higher listing limit? How many/week?
- Expiry: should sellers be able to renew manually? Auto-renewal?
- Download limits per buyer per purchase?
- Should `categories` be extended to include `ai-art`, `sabloane-sociale` (social media templates), `modele-3d`?

## See also

- [[listing]] — listing entity and lifecycle
- [[asset]] — downloadable file entity
- [[overview]] — project context
