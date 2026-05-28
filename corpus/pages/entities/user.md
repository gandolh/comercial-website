---
title: User
slug: user
category: entity
tags: [user, auth, seller, buyer, jwt, argon2]
sources: 1
updated: 2026-05-28
---

# User

An account on the platform. Seller and buyer are the same account type — a user can both list and purchase assets.

## DB columns (SQLite — `users` table)

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | hex(randomblob(16)) |
| `email` | TEXT UNIQUE | |
| `password_hash` | TEXT | Argon2; plaintext never stored |
| `display_name` | TEXT | nullable |
| `avatar_url` | TEXT | nullable; storage key |
| `phone` | TEXT | nullable |
| `phone_verified` | INTEGER | 0 or 1 |
| `email_verified` | INTEGER | 0 or 1 |
| `created_at` | TEXT | ISO 8601 |
| `updated_at` | TEXT | ISO 8601 |

## Auth flow

1. `POST /auth/register` — hashes password with Argon2, stores `password_hash`
2. `POST /auth/login` — verifies hash, issues JWT
3. Protected endpoints: `Authorization: Bearer <token>`; `user_id` extracted by JWT middleware in `core/auth/`

## Verification

- **Email:** token sent via `email_verification_tokens` table; 24h expiry; marks `email_verified=1`
- **Phone:** OTP via `phone_verification_codes` table; 10-min expiry; stub provider logs code to console in dev

## Constraints

- Free tier: 5 listings per 7-day rolling window — see [[business-rules]]
- No separate buyer/seller roles yet

## Open questions

- Seller profile: extended bio, social links, portfolio URL?
- Seller verification / trust badge (verified_seller flag)?
- Premium subscription tier (higher listing quota)?
- Password reset flow: implemented in repo but UI may be incomplete

## See also

- [[listing]] — listings owned by this user
- [[business-rules]] — per-user rate limits
- [[stack]] — JWT + Argon2 details
