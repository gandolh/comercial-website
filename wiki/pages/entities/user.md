---
title: User
slug: user
category: entity
tags: [user, auth, seller, buyer, domain]
sources: 1
updated: 2026-05-27
---

# User

An account on the platform. Currently, seller and buyer are the same account type — a user can both list and purchase assets.

## Key fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `email` | string | unique |
| `password_hash` | string | Argon2; plaintext never stored |
| `created_at` | timestamp | |

## Auth flow

1. Register: `POST /auth/register` — hashes password with Argon2, stores `password_hash`.
2. Login: `POST /auth/login` — verifies hash, issues JWT.
3. Protected endpoints: Bearer token in `Authorization` header; `user_id` extracted by JWT middleware in `core/auth/`.

## Constraints

- Free tier: 5 listings per 7-day rolling window. See [[business-rules]].
- No separate buyer/seller roles yet.

## Open questions

- Profile page (display name, avatar, bio)?
- Seller verification / trust badges?
- Premium subscription tier?
- Password reset flow?

## See also

- [[listing]] — listings owned by this user
- [[business-rules]] — per-user rate limits
- [[stack]] — JWT + Argon2 auth details
