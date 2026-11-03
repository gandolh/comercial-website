---
summary: The Listing entity, the marketplace's unit for sale: columns, status lifecycle, pricing, expiry and the publish rule (at least one asset).
updated: 2026-05-28
---

# Listing

The primary unit of the marketplace. A seller creates a listing to offer one or more downloadable [asset](asset.md)s for sale or free download.

## DB columns (SQLite)

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | hex(randomblob(16)) |
| `user_id` | TEXT FK | → [user](user.md) (seller) |
| `title` | TEXT | |
| `description` | TEXT | |
| `category` | TEXT | see [business-rules](business-rules.md) for exhaustive list |
| `price_ron` | INTEGER | RON; null = free |
| `is_negotiable` | INTEGER | 0 or 1 |
| `active` | INTEGER | 0 or 1 |
| `view_count` | INTEGER | |
| `expires_at` | TEXT | ISO 8601; created_at + 30 days |
| `created_at` | TEXT | ISO 8601; default datetime('now') |
| `updated_at` | TEXT | ISO 8601 |
| `asset_type` | TEXT | default 'file' |
| `file_format` | TEXT | e.g. zip, pdf, mp4 |
| `file_size_bytes` | INTEGER | primary asset size |
| `license_type` | TEXT | personal \| commercial \| extended |
| `download_count` | INTEGER | |
| `city` | TEXT | default ''; optional for digital listings |

## Lifecycle

```
(draft)  →  active=1  →  expires_at reached → no longer visible
              ↑
    requires ≥1 asset
```

A listing is immediately active when created; it becomes invisible to buyers once `expires_at < now()`.

## Search

Full-text search via `LIKE %q%` on `title` and `description` (no tsvector — SQLite limitation). Category, price range, and date filters applied as SQL WHERE clauses in `ListingsRepository.search()`.

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/listings` | required | create listing |
| `GET` | `/listings` | public | browse (active, not expired) |
| `GET` | `/listings/:id` | public | single listing; increments view_count |
| `PATCH` | `/listings/:id` | owner | update fields |
| `DELETE` | `/listings/:id` | owner | delete |
| `GET` | `/listings/:id/assets` | public | list asset metadata |
| `GET` | `/listings/:id/download` | required | stream primary asset file |
| `POST` | `/listings/:id/images` | owner | upload preview image (multipart) |

## See also

- [asset](asset.md) — downloadable files attached to a listing
- [user](user.md) — seller who owns the listing
- [business-rules](business-rules.md) — rate limits, expiry, publish rules, max assets
- [digital-asset-commerce](digital-asset-commerce.md) — per-asset downloads + paid-order download gate
- [search](search.md) — FTS5 search over listing title/description
- [listing-lifecycle](listing-lifecycle.md) — preview-before-publish, renewal & expiry UI
- [digital-pivot-cleanup](digital-pivot-cleanup.md) — removal of `city`/`is_negotiable`; 12 new categories
