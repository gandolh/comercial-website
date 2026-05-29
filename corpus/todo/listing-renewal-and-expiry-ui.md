---
title: Listing Renewal & Expiry UI
slug: listing-renewal-and-expiry-ui
type: update
priority: medium
status: done
area: frontend
updated: 2026-05-29
---

# Listing Renewal & Expiry UI

## What

The backend has `POST /listings/:id/renew` (extends expiry by 30 days, rate-limited to once/hour) and `POST /listings/:id/activate` / `deactivate`. The frontend doesn't expose these actions to sellers.

## Missing UI

**In `MyListingsPage` / `DashboardPage`:**
- Show expiry date on each listing card
- Show "Expiră în X zile" warning badge for listings expiring within 3 days (matches `expiring_soon` from stats)
- "Reînnoiește" (Renew) button — calls `POST /listings/:id/renew`; disabled with countdown if rate-limited
- "Dezactivează" / "Activează" toggle — calls `POST /listings/:id/deactivate` or `activate`

**Expired listings section:**
- Separate tab or section in dashboard for expired listings
- "Reactivează și reînnoiește" action

**Stats bar:**
- Dashboard already has `expiring_soon` count from `GET /users/me/stats` — wire it to a warning banner

## Backend (already implemented)

- `POST /listings/:id/renew` — extends `expires_at` by 30 days; 429 if called within 1 hour of previous renewal
- `POST /listings/:id/activate` — 409 if already expired
- `POST /listings/:id/deactivate` — sets `active=0`

## Acceptance criteria

- [x] Expiry date visible on listing cards in dashboard
- [x] "Expiră în 3 zile" badge shown for listings expiring soon
- [x] Renew button works; shows disabled state with "Poți reînnoi din nou în X minute" if rate-limited
- [x] Activate/Deactivate toggle works (pre-existing, retained)
- [x] Expired listings shown in separate tab/section with renew CTA

## See also

- [[listing]] — lifecycle, renew endpoint
- [[business-rules]] — expiry rules
