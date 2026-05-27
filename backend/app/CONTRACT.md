# API Contract (preserve exactly)

The frontend already consumes this API and maps snake_case → camelCase itself.
**All JSON request/response bodies use `snake_case` keys.** Do NOT camelCase responses.
Timestamps are ISO-8601 strings (serialize `Date` to ISO). UUIDs are strings.
Error bodies are `{ "error": "<message>" }` with statuses 404/401/403/422/409/429/500
(use `AppError` from `@my-olx/core`). Validation failures → 422 `{ "error": msg }`.

Each route module is a `RouteRegistrar` `(app, ctx) => void` (see `src/context.ts`).
`ctx` gives `{ db (Kysely), config, storage (StorageService), email }`.
Protected routes use `{ preHandler: app.authenticate }`; then read `request.userId!`.
Use zod to validate request bodies/queries; on parse failure throw `AppError.validation(msg)`.
Use Kysely query builder for all DB access against `ctx.db` (typed `Database` from core).

`image_url(s3_key)` rule: if value starts with http(s):// return as-is, else
`${config.s3PublicBaseUrl.replace(/\/$/,'')}/${s3_key.replace(/^\//,'')}`.

---

## AUTH  (module: auth.ts → registerAuthRoutes)  prefix none, paths literal
- POST `/auth/register`        body `{ email, password(min8) }` → 200 `AuthResponse` (creates user, sends verification email, returns JWT)
- POST `/auth/login`           body `{ email, password }` → 200 `AuthResponse` (401 on bad creds)
- POST `/auth/logout`          → 200 `{}` (stateless; just 200)
- POST `/auth/email/verify`    body `{ token }` → 200 `{}` (mark email_verified, consume token)
- POST `/auth/email/resend`    body `{ email }` → 200 `{}` (auth NOT required; resend verification; always 200 to avoid enumeration)
- POST `/auth/password/forgot` body `{ email }` → 200 `{}` (create reset token, email it; always 200)
- POST `/auth/password/reset`  body `{ token, password(min8) }` → 200 `{}`
- POST `/auth/phone/request-code` body `{ phone (^(\+40|0)7\d{8}$) }` → 200 `{}` (PROTECTED: app.authenticate; store hashed 6-digit code, "stub" provider just logs "123456" in dev)
- POST `/auth/phone/verify`    body `{ code (len 6) }` → 200 `{}` (PROTECTED; mark phone_verified)

`AuthResponse` = `{ token: string, user: UserSummary }`
`UserSummary` = `{ id, email, display_name|null, avatar_url|null, email_verified, phone|null, phone_verified, created_at }`

Password hashing: `hashPassword`/`verifyPassword` from core. Token: `signToken(userId, config.jwtSecret, config.jwtExpirySeconds)`.
Tokens for email/password use random hex strings stored in `email_verification_tokens` / `password_reset_tokens` (token PK, user_id, expires_at, used_at). Phone codes → `phone_verification_codes` (code_hash via sha256 or argon2, attempts, expires_at, consumed_at).

## USERS  (module: users.ts → registerUsersRoutes)
- GET   `/users/me`            PROTECTED → 200 `UserSummary`
- PATCH `/users/me`            PROTECTED body `{ display_name?(2-60), avatar_s3_key? }` → 200 `UserSummary` (avatar_url = image_url(avatar_s3_key))
- GET   `/users/me/stats`      PROTECTED → 200 `MyStatsResponse`
- PATCH `/users/me/password`   PROTECTED body `{ current_password(min8), new_password(min8) }` → 200 `{}` (409/403 if current wrong)
- POST  `/users/me/avatar/upload-url` PROTECTED body `{ content_type, filename }` → 200 `{ upload_url, s3_key, public_url }` (presignPut; key `avatars/<userId>/<uuid>.<ext>`)
- GET   `/users/:id`           → 200 `PublicUserResponse`
- GET   `/users/:id/listings`  query `?active=` → 200 `ListingCardResponse[]` (the user's listings as cards)

`PublicUserResponse` = `{ id, display_name|null, avatar_url|null, phone_verified, member_since (=user.created_at), active_listings_count }`
`MyStatsResponse` = `{ listings: ListingStats, messages: MessagingStats, favorites_count }`
`ListingStats` = `{ active, inactive, expired, expiring_soon, weekly_post_count, weekly_post_limit(=5), week_resets_at }`
  - active: active=true AND expires_at>now ; inactive: active=false ; expired: expires_at<=now
  - expiring_soon: active=true AND expires_at within next 3 days
  - weekly_post_count: listings created in last 7 days ; week_resets_at: oldest-in-window created_at + 7 days (or now+7d if none)
`MessagingStats` = `{ unread_count, conversation_count }`

## FAVORITES  (module: favorites.ts → registerFavoritesRoutes)
- POST   `/favorites/:listing_id`   PROTECTED → 200 `{}` (insert favorites(user_id,listing_id) ON CONFLICT DO NOTHING)
- DELETE `/favorites/:listing_id`   PROTECTED → 200 `{}`
- GET    `/me/favorites`            PROTECTED → 200 `ListingCardResponse[]` (favorited listings as cards)
- GET    `/me/favorites/ids`        PROTECTED → 200 `{ ids: string[] }`

## LISTINGS  (module: listings.ts → registerListingsRoutes)  — biggest module
- GET    `/listings`            (optional auth) query = ListingFilters → 200 `ListingsPageResponse`
- POST   `/listings`            PROTECTED body `CreateListingRequest` → 200 `ListingResponse`
- GET    `/listings/featured`   → 200 `ListingCardResponse[]` (limit 8; order seller_verified desc, created_at desc, active & not expired)
- GET    `/listings/suggest`    query `?q=&limit=20` → 200 `string[]` (distinct titles ILIKE q%)
- GET    `/listings/:id`        (optional auth) → 200 `ListingDetailResponse` (increments view_count; non-owner cannot see inactive/expired → 404)
- PATCH  `/listings/:id`        PROTECTED body `UpdateListingRequest` → 200 `ListingResponse` (owner only → 403)
- DELETE `/listings/:id`        PROTECTED → 200 `{}` (owner only)
- POST   `/listings/:id/publish`    PROTECTED → 200 `ListingResponse` (rules below)
- POST   `/listings/:id/renew`      PROTECTED → 200 `ListingResponse` (1/hour rate limit; +30 days)
- POST   `/listings/:id/deactivate` PROTECTED → 200 `ListingResponse` (set active=false)
- POST   `/listings/:id/activate`   PROTECTED → 200 `ListingResponse` (409 if expired)
- GET    `/listings/:id/related`    → 200 `ListingCardResponse[]` (4 in same category, exclude self, active & not expired)
- GET    `/listings/:id/seller-phone` PROTECTED → 200 `{ phone: string }` (403 if viewer is owner; 404 if no phone)
- POST   `/listings/:id/conversations` PROTECTED — handled by messaging module's start_conversation (see MESSAGING)
- nested `/listings/:id/images/*` — handled by images module (see IMAGES)

`CreateListingRequest` = `{ title(5-200), description(min10), price_ron?:int|null, is_negotiable:bool, category(min1), city(min1), active?:bool }`
  - create: user must be email_verified (else 403); if active(default true) enforce weekly limit 5 (count created in last 7d) else 429;
    expires_at = now + 30 days; insert; return ListingResponse.
`UpdateListingRequest` = same fields all optional; price_ron is nullable; owner-only.
`ListingFilters` query = `{ q?, category?, city?, price_min?, price_max?, date?("24h"|"saptamana"|"oricand"), verified?:bool, sort?("noi"|"pret_asc"|"pret_desc"|"relevanta"), page?(default1,min1), per_page?(default12,clamp1..50), user_id?, active?:bool }`
  - search: only active & not-expired listings unless user_id+active specified; q uses full-text via existing `search_tsv` column: `WHERE search_tsv @@ websearch_to_tsquery('simple', $q)`; city exact; price range; date filter on created_at; verified → seller.phone_verified; sort: noi=created_at desc, pret_asc/desc=price_ron, relevanta=ts_rank. Return page + total_count + total_pages.
`ListingResponse` = `{ id, user_id, title, description, price_ron, is_negotiable, category, city, active, expires_at, created_at }`
`ListingCardResponse` = `{ id, title, price_ron, city, category, cover_url(image_url of position-0 image or null), seller_verified(=seller.phone_verified), posted_at(=created_at), active, expires_at }`
`ListingsPageResponse` = `{ listings: ListingCardResponse[], total_count, total_pages, page }`
`ListingDetailResponse` = `{ id, title, description, price_ron, is_negotiable, category, category_label, city, images: [{id,url,position}], view_count, posted_at, expires_at, active, seller: SellerSummary }`
`SellerSummary` = `{ id, display_name, avatar_url, phone_verified, member_since, active_listings_count }`
`category_label(slug)`: electronice→"Electronice", auto→"Auto, moto și ambarcațiuni", imobiliare→"Imobiliare", casa-gradina→"Casă și grădină", moda→"Modă și frumusețe", joburi→"Locuri de muncă", servicii→"Servicii, afaceri", sport→"Sport și timp liber", gratuit→"Oferite gratuit", default→"Diverse".

PUBLISH rules: owner-only(403); user email_verified(403); title 5-200; description ≥10; category non-empty; city non-empty; **≥1 image (else 422 "cel puțin o imagine este necesară pentru publicare")**; weekly limit 5 (else 429); then set active=true & return.
RENEW rules: owner-only; last_renewal = expires_at - 30 days; if last_renewal > now-1h → 429; else expires_at = now + 30 days.

## IMAGES  (module: images.ts → registerImagesRoutes)  base `/listings/:id/images`
- POST   `/listings/:id/images/upload-url` PROTECTED body `{ content_type, filename }` → 200 `{ upload_url, s3_key, public_url }`
  (owner-only; max 10 images; allowed content_type image/jpeg|png|webp; key via core `listingImageKey(id, ext)`)
- POST   `/listings/:id/images`            PROTECTED body `{ s3_key, width?, height?, bytes? }` → 200 `ImageResponse` (owner-only; position = next free 0..9)
- PATCH  `/listings/:id/images/reorder`    PROTECTED body `{ order: string[] }` → 200 `ImageResponse[]` (owner-only; apply positions in array order)
- DELETE `/listings/:id/images/:image_id`  PROTECTED → 200 `{}` (owner-only; also delete S3 object via storage.deleteObject)

`ImageResponse` = `{ id, listing_id, url(image_url of s3_key), position }`

## MESSAGING  (module: messaging.ts → registerMessagingRoutes)
- POST `/listings/:id/conversations` PROTECTED body `{ body(1-2000) }` → 200 `ConversationSummary`
   (buyer = request.userId; seller = listing.user_id; 403 if buyer==seller; upsert conversation unique(listing_id,buyer_id); insert first message; bump last_message_at)
- GET  `/conversations`              PROTECTED → 200 `ConversationSummary[]` (where user is buyer or seller; order last_message_at desc)
- GET  `/conversations/:id`          PROTECTED → 200 `ConversationSummary` (participant-only → 403/404)
- GET  `/conversations/:id/messages` PROTECTED → 200 `MessageResponse[]` (asc by created_at; participant-only)
- POST `/conversations/:id/messages` PROTECTED body `{ body(1-2000) }` → 200 `MessageResponse` (participant-only; bump last_message_at)
- POST `/conversations/:id/read`     PROTECTED → 200 `{}` (mark messages not sent by me as read)
- GET  `/me/unread-count`            PROTECTED → 200 `{ count }`  (NOTE: literal path `/me/unread-count`, register it here)

`ConversationSummary` = `{ id, listing: ListingCardResponse, counterparty: UserSummary, last_message: { body, sender_id, created_at }|null, unread_count, last_message_at }`
  (counterparty = the OTHER participant relative to request.userId)
`MessageResponse` = `{ id, conversation_id, sender_id, body, read_at|null, created_at }`

## LOCATIONS  (module: locations.ts → registerLocationsRoutes)
Data file: `src/data/cities-by-counties.json` (counties + cities). Load it.
- GET `/locations/counties`  → 200 county list (shape: whatever the JSON county objects are; return array)
- GET `/locations/cities`    query `?q=&county=&limit=` → 200 matching cities (filter by name ILIKE q, optional county, limit default 20)
(These are kept only for contract compatibility; UI drops them in Wave 3. Keep simple — read JSON, filter in memory.)
