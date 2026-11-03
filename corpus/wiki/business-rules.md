---
summary: The enforced marketplace rules (listing rate limit, expiry, the publish requirement, pricing, the platform fee) and where each is checked.
updated: 2026-11-03
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
- **Platform fee: 2.5%** of each paid order (`PLATFORM_FEE_RATE`, `app/src/payout-fee.ts`), rounded to
  the ban half up and recorded on the order when it is paid (`platform_fee_ron`, `seller_net_ron`), so a
  new rate never touches past orders.
- **Payouts are simulated** (`modules/payouts.ts`): a seller's balance is their net on paid orders minus
  payouts; a payout takes the whole balance at once, moves no money, and is idempotent per request id.

## Users

- **Auth:** JWT + Argon2. `password_hash` stored; plaintext never persisted.
- **Roles:** Seller = buyer = same account type. No role distinction yet.

## Categories (exhaustive)

`grafica`, `sabloane`, `software`, `cod-sursa`, `audio`, `video`, `ebook`, `fonturi`, `documente`, `3d`, `mestesugart`, `invitatii`, `diverse`

> Canonical list is the 13 above (see [digital-pivot-cleanup](digital-pivot-cleanup.md) for the 12-category overhaul; `invitatii` — "Invitații Digitale" — added 2026-05-29 for Romanian event templates: nuntă, botez, cununie, logodnă, majorat, aniversări, sărbători).

## Localization

- Romanian required throughout the UI.
- Correct diacritics: ă â î **ș ț** (comma-below, not cedilla-below ş ţ).

## Open questions

- Premium tier: higher listing limit? How many/week?
- Expiry: should sellers be able to renew manually? Auto-renewal?
- Download limits per buyer per purchase?
- Should `categories` be extended to include `ai-art`, `sabloane-sociale` (social media templates), `modele-3d`?

## See also

- [listing](listing.md) — listing entity and lifecycle
- [asset](asset.md) — downloadable file entity
- [overview](overview.md) — project context
