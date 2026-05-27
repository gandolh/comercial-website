---
title: Asset
slug: asset
category: entity
tags: [asset, download, file, domain]
sources: 1
updated: 2026-05-27
---

# Asset

A downloadable file attached to a [[listing]]. The core product unit — what the buyer actually receives.

## Key fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `listing_id` | UUID | FK → [[listing]] |
| `file_key` | string | S3 object key |
| `file_name` | string | original filename |
| `file_format` | string | zip, pdf, psd, mp4, … |
| `file_size_bytes` | integer | |
| `download_count` | integer | incremented on each download |
| `license_type` | enum | personal \| commercial \| extended |
| `created_at` | timestamp | |

## Two kinds of files

A listing can have two categories of files:
1. **Downloadable assets** — the actual product (zip, pdf, psd, mp4, etc.). ≥1 required to publish.
2. **Preview images** — screenshots/thumbnails shown on the listing page. Optional; do NOT count toward the publish requirement.

## Storage

Files live in S3 (LocalStack in dev). The `file_key` is the S3 object key. Download is a short-lived signed URL or streamed proxy via `GET /listings/:id/download`.

## License types

| Type | Meaning |
|---|---|
| `personal` | Buyer may use for personal, non-commercial projects |
| `commercial` | Buyer may use in commercial projects |
| `extended` | Broadest rights (e.g. resale in end-products) |

## Open questions

- Are multiple assets per listing supported? (Currently implied by `GET /listings/:id/assets/*`)
- Is there a per-asset price or just one price for the whole listing?
- How are preview images stored/referenced separately from downloadable assets?

## See also

- [[listing]] — the parent listing
- [[business-rules]] — publish requirement, license types
- [[stack]] — S3 storage configuration
