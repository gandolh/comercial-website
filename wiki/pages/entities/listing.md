---
title: Listing
slug: listing
category: entity
tags: [listing, marketplace, domain]
sources: 1
updated: 2026-05-27
---

# Listing

The primary unit of the marketplace. A seller creates a listing to offer one or more downloadable [[asset]]s for sale or for free.

## Key fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → [[user]] (seller) |
| `title` | string | |
| `description` | string | |
| `category` | enum | software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse |
| `price` | decimal? | RON; null = free |
| `status` | enum | draft \| published \| expired |
| `created_at` | timestamp | |
| `expires_at` | timestamp | created_at + 30 days |

## Lifecycle

```
draft → published → expired (auto after 30 days)
         ↑
  requires ≥1 asset
```

- A listing starts as `draft`.
- It can only be published when ≥1 downloadable [[asset]] is attached.
- After 30 days from `created_at` it becomes `expired` and is no longer visible to buyers.

## Constraints

- Max 5 new listings per user per 7-day window (free tier). See [[business-rules]].
- `price` in RON; `null` means free.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| `POST` | `/listings` | create draft |
| `GET` | `/listings` | browse (published, not expired) |
| `GET` | `/listings/:id` | single listing |
| `PATCH` | `/listings/:id` | update |
| `POST` | `/listings/:id/publish` | publish (validates ≥1 asset) |
| `GET` | `/listings/:id/assets/*` | list downloadable assets |
| `GET` | `/listings/:id/download` | authenticated download |

## See also

- [[asset]] — the downloadable files attached to a listing
- [[user]] — the seller who owns the listing
- [[business-rules]] — rate limits, expiry, publish rules
