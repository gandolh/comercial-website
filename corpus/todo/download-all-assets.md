---
title: Download All Assets (Multi-file Listings)
slug: download-all-assets
type: update
priority: medium
status: done
area: backend, frontend
updated: 2026-05-29
---

# Download All Assets (Multi-file Listings)

## What

Currently `GET /listings/:id/download` only streams the primary asset (`position = 0`). Listings can have up to 10 assets but buyers can only download the first one. Fix this.

## Options

**Option A — Per-asset download endpoint (recommended for v1):**
- `GET /listings/:id/assets/:asset_id/download` — stream a specific asset by ID
- Frontend shows a file list with individual download buttons for each asset

**Option B — Zip bundle:**
- `GET /listings/:id/download/all` — zip all assets server-side and stream the archive
- Better UX for buyers but heavier server-side (streaming zip creation)
- Requires `archiver` or `jszip` npm package

## Decision

Start with Option A (per-asset endpoint). Option B can be added later as "Download all as .zip".

## Backend changes

- New endpoint: `GET /listings/:id/assets/:asset_id/download`
  - Auth required
  - Verify listing exists and asset belongs to listing
  - Record download (reuse `assetsRepo.recordDownload`)
  - Stream file from disk
- Keep existing `GET /listings/:id/download` for backward compatibility (still serves position=0)

## Frontend changes

- `ListingDetailPage` — show file list (filename, size, content_type) with download button per file
- Show total number of files ("3 fișiere incluse")
- Show total size of all assets combined

## Acceptance criteria

- [x] Each asset in a listing has its own download URL
- [x] Download is gated (auth required)
- [x] Download count incremented per download event
- [x] File list shown on listing detail page
- [x] Existing `/listings/:id/download` still works (position=0 backward compat)

## See also

- [[asset]] — asset entity, position field
- [[listing]] — listing endpoints
