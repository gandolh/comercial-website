---
title: Asset
slug: asset
category: entity
tags: [asset, download, file, domain, storage]
sources: 1
updated: 2026-05-28
---

# Asset

A downloadable file attached to a [[listing]]. The core product unit — what the buyer actually receives.

## DB columns (SQLite — `listing_assets` table)

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | hex(randomblob(16)) |
| `listing_id` | TEXT FK | → [[listing]] |
| `s3_key` | TEXT | storage key; path under `data/uploads/` |
| `original_filename` | TEXT | original uploaded filename |
| `file_size_bytes` | INTEGER | |
| `content_type` | TEXT | MIME type |
| `checksum_sha256` | TEXT | optional integrity check |
| `position` | INTEGER | 0 = primary deliverable |
| `created_at` | TEXT | ISO 8601 |

## Two kinds of files on a listing

1. **Downloadable assets** (`listing_assets` table) — the actual product. ≥1 required to publish. Max 10.
2. **Preview images** (`listing_images` table) — screenshots shown on listing page. Optional. Max 10. Do NOT count toward publish requirement.

## Storage (disk-based)

Files are stored on disk under `UPLOADS_DIR/listings/<listing_id>/assets/<uuid>-<filename>`. The `s3_key` column stores the relative path from `UPLOADS_DIR`. Download is streamed directly via `GET /listings/:id/download` (streams the primary asset, position=0).

## License types

| Type | Meaning |
|---|---|
| `personal` | Personal, non-commercial use only |
| `commercial` | Use in commercial projects |
| `extended` | Broadest rights (e.g. resale in end-products) |

## Upload flow (current)

```
POST /listings/:id/assets   ← multipart file POST (authenticated, owner only)
  → saves file to disk
  → inserts row into listing_assets
  → if position=0, updates listing.file_format and file_size_bytes
```

No presigned URLs. File goes directly to the backend.

## Open questions

- Per-asset pricing vs one price for whole listing? (today a listing has a single `price_ron`; paid downloads are gated per-listing — see [[digital-asset-commerce]])
- Should there be a file size limit per asset? (currently 500 MB — set in `@fastify/multipart` config)

> Resolved: each asset now has its own download URL (`GET /listings/:id/assets/:asset_id/download`);
> the legacy `/listings/:id/download` (position 0) is retained. See [[digital-asset-commerce]].

## See also

- [[listing]] — parent listing
- [[business-rules]] — publish requirement, max counts, license types
- [[stack]] — disk storage configuration
- [[digital-asset-commerce]] — per-asset downloads + paid-order gate
- [[accounts-and-profiles]] — the multipart upload contract assets are uploaded through
