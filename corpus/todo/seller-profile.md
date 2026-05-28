---
title: Seller Profile Page
slug: seller-profile
type: update
priority: medium
status: pending
area: backend, frontend
updated: 2026-05-28
---

# Seller Profile Page

## What

Enrich the public seller profile with a bio, portfolio links, and seller-specific stats. Currently `PublicProfilePage` shows only `display_name`, `avatar_url`, `phone_verified`, `member_since`, and `active_listings_count`.

## Changes

**DB — add columns to `users`:**
```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN website_url TEXT;
ALTER TABLE users ADD COLUMN social_links TEXT; -- JSON: { github?, linkedin?, twitter? }
```

**Backend:**
- `GET /users/:id` — add `bio`, `website_url`, `social_links` to `PublicUserResponse`
- `PATCH /users/me` — accept `bio` (max 500 chars), `website_url`, `social_links`
- `GET /users/:id/listings` — already exists; also surface total sales count (count of `downloads` for seller's listings)

**Frontend:**
- `PublicProfilePage` — show bio, website link, social icons, listing grid
- `SettingsPage` — add bio textarea, website URL field, social links inputs

## Seller trust signals (future)

- `verified_seller` badge (manual review or document upload)
- Total downloads / sales count
- Member since date (already shown)
- Response rate for messaging (future)

## Acceptance criteria

- [ ] Bio (up to 500 chars) shown on public profile
- [ ] Website URL shown as clickable link
- [ ] Settings page allows editing bio + website
- [ ] Total downloads count shown on profile

## See also

- [[user]] — entity definition
