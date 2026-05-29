---
title: Fix Frontend Upload Flow (Presigned URL → Direct Multipart)
slug: fix-frontend-upload-flow
type: update
priority: critical
status: done
area: frontend
updated: 2026-05-29
---

# Fix Frontend Upload Flow

## What

The backend was migrated from S3 presigned URLs to direct multipart upload (disk storage). The frontend still uses the old two-step presigned URL flow in three places and will break.

## Why it's broken

Backend no longer has `presignPut` — `StorageService` is disk-based. The old endpoints that returned `{ upload_url, s3_key }` no longer exist:
- `POST /listings/:id/images/upload-url` — removed; replaced by `POST /listings/:id/images` (multipart)
- `POST /listings/:id/assets/upload-url` — removed; replaced by `POST /listings/:id/assets` (multipart)
- `POST /users/me/avatar/upload-url` — removed; replaced by `POST /users/me/avatar` (multipart)

## Files to update

- `frontend/src/app/modules/listings/services/images.ts` — uses `upload-url` endpoint then PUT to S3
- `frontend/src/app/modules/create-listing/services/assets.ts` — uses `upload-url` endpoint then PUT to S3
- `frontend/src/app/modules/settings/services/profile.ts` — uses `upload-url` endpoint for avatar

## New flow for each

Replace the two-step (get presigned URL → PUT to S3) with a single `POST` using `multipart/form-data`:

```ts
const form = new FormData();
form.append("file", fileBlob, filename);
const res = await axiosInstance.post(`/listings/${id}/images`, form);
// response: ImageResponse { id, listing_id, url, position }
```

For assets:
```ts
const form = new FormData();
form.append("file", fileBlob, filename);
const res = await axiosInstance.post(`/listings/${id}/assets`, form);
// response: AssetResponse
```

For avatar:
```ts
const form = new FormData();
form.append("file", fileBlob, filename);
const res = await axiosInstance.post(`/users/me/avatar`, form);
// response: { public_url, s3_key }
```

## Acceptance criteria

- [x] Image upload uses multipart POST, no S3 PUT step
- [x] Asset upload uses multipart POST
- [x] Avatar upload uses multipart POST to `/users/me/avatar`
- [x] Upload progress preserved (component layer unchanged)
- [x] Error handling preserved (file too large, wrong type)
