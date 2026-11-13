# Task 15: Replies that say less, and the avatar URL

**Depends on:** brief 13 (the response schemas this brief narrows) and the todo [replies-that-say-too-much](../../todos/replies-that-say-too-much.md).

## Context

Brief 13 gave every JSON route a response schema and kept each reply as it was. Three replies carry more than a client needs, and one URL is wrong:

- The conversation summary (`backend/app/src/features/messaging/routes.ts`, `buildConversationSummary`; schema in `schemas.ts`) answers the other party's `email` and `phone`, plus `email_verified` and `created_at`. A buyer learns the seller's address and number without the seller sharing them. `/listings/:id/seller-phone` is the intended way.
- The asset upload (`POST /listings/:id/assets`, `features/assets/routes.ts`) answers the storage key `s3_key`. Internal.
- The avatar upload (`POST /users/me/avatar`, `features/users/routes.ts`) answers `public_url` built by `StorageService.publicUrl`, which has no `/uploads/` segment, so the URL does not load. Every other stored file's URL goes through `imageUrl`.
- The conversation summary sends `seller_verified`, `active` (listing) and the counterparty's flags as stored 0/1 numbers; the frontend types them as booleans.

Checked against the frontend: messaging screens read only the counterparty's `display_name` and `avatar_url` (`ConversationListItem`, `ConversationPage`); `RecentConversations` falls back to `counterparty.email` for a missing name. The asset `s3_key` is read only by `mapAsset` into `ListingAsset.s3Key`, which nothing uses. The avatar flow sends the avatar's own `s3_key` back in `PATCH /users/me` (`avatar_s3_key`), so that field stays; the frontend never reads the avatar's `public_url`.

## Files you OWN

- `backend/app/src/features/messaging/` (routes.ts, schemas.ts, routes.test.ts)
- `backend/app/src/features/assets/` (routes.ts, routes.test.ts)
- `backend/app/src/features/users/` (routes.ts, routes.test.ts; schemas.ts only for the avatar reply)
- `frontend/src/app/modules/messaging/services/messaging.ts`, `frontend/src/app/modules/dashboard/components/RecentConversations.tsx`
- `frontend/src/app/modules/create-listing/services/assets.ts`, `frontend/src/app/types/listing.ts` (`s3Key`)
- `corpus/` bookkeeping for this brief

## Files you must NOT touch

Migrations, other features' routes, `backend/core`, `backend/app/vendor/`, `vendor/`, lockfiles, deploy files.

## What to do

1. Counterparty in the conversation summary: `id`, `display_name`, `avatar_url` only. Stop selecting the dropped columns. Drop `email`, `phone`, `email_verified`, `phone_verified`, `created_at` from the schema and the handler.
2. `seller_verified`, `active` and any remaining flag in the summary become booleans (`Boolean(...)`), schema `z.boolean()`.
3. Drop `s3_key` from the asset upload's `AssetResponse`, `toAssetResponse` and `assetSchema`. Keep the key in the database and the stores.
4. Avatar upload: build `public_url` with the shared `imageUrl` (the `/uploads/` URL); keep `s3_key` in that reply.
5. Frontend: `UserSummary` in `messaging.ts` loses `email`, `created_at`, `phone_verified`; `RecentConversations` uses `display_name` and an "unknown user" fallback; drop `s3Key` from `ListingAsset` and `mapAsset`; fix the comments that list the old reply.
6. Tests: the conversation summary has no `email`, `phone`, `email_verified`, `phone_verified`, `created_at` on the counterparty and returns booleans; the asset upload reply has no `s3_key`; the avatar `public_url` contains `/uploads/avatars/` and is served by the app.

## Acceptance

- `npm run check` at the root exits 0; `bash corpus/lint.sh` exits 0.
- The new tests fail on the old code and pass now.
- A dev seed on a scratch database still runs.
- The outcome note says what each dropped field did in the frontend (nothing).
- Owner step: deploy with vps-deploy's `piataro` stack, phase `server` (briefs 10 to 14 also wait for the owner's deploy).

## Outcome (2026-11-13)

Built as written. Commit 1898ce7.

- The conversation summary's counterparty is `id`, `display_name`, `avatar_url`; `email`, `phone`, `email_verified`, `phone_verified` and `created_at` are no longer selected or sent. The listing's `seller_verified` and `active` are booleans.
- The asset upload no longer answers `s3_key`. The avatar upload's `public_url` goes through `imageUrl` (`/uploads/avatars/...`); its `s3_key` stays, because the avatar form sends it back in `PATCH /users/me`.
- Frontend: nothing read a dropped field except `RecentConversations`, which fell back to the counterparty's email local part for a missing name; it shows the "unknown user" text now, as the messaging screens do. `UserSummary` and `ListingAsset.s3Key` lost the dead fields. The avatar's `public_url` was never read, so the wrong URL never showed.
- Tests: three new ones (summary, asset reply, avatar URL served); all three fail on the old code. `npm run check`, `corpus/lint.sh` and `seed:dev` on a scratch database exit 0.
- Owner step: deploy phase `server` (briefs 10 to 14 also wait).
