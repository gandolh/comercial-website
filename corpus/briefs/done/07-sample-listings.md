# Task 07 — Sample listings that never expire

## Context
Decisions.md → *Sample listings never expire*. With only the owner signing in, the public would see an
empty site. `docs/demo-seed.mjs` and `seed-data/` already hold sample listings, images and reviews;
brief 03 moved the old SQL seed out of the migrations.

## Files you OWN
A new migration (an `is_sample` flag), a production seed command, `seed-data/`, the listing queries
that apply expiry, the expiry-reminder job, `docs/getting-started.md`.

## What to do
1. **Mark samples:** `listings.is_sample` (default 0). Every expiry check treats a sample as active (or
   samples get no expiry date); the reminder job skips them. The owner's listings keep the 30-day rule.
2. **Seed command:** `npm run seed:samples` creates three or four seller profiles that cannot sign in
   (no password, no email login, no Ward link) and the sample listings with their images, asset files
   and a few reviews. Idempotent: running it again changes nothing. Runs in production (brief 09 calls it
   after the first deploy).
3. Seller profile pages for the sample sellers work; buying a sample works for the owner (fake payment).

## Acceptance
- After `seed:samples` on a fresh database the home page and categories show the samples; a sample's
  expiry is never reached (test with a clock set a year ahead); reruns are no-ops.
- Builds and tests pass.

---

**Outcome (2026-11-03).** Done (`5d87199`).
- **Never expire:** samples carry `is_sample = 1` and the expiry date 9999-12-31, so no query changed and
  public pages only ever ask "expired?". The reminder query also filters `is_sample = 0`.
- **`npm run seed:samples`:** three sellers on `.invalid` addresses with a password hash no password
  matches; nine listings from the README demo's content; previews rendered from `demo-previews.html`
  into `backend/seed/samples/previews/` (9 PNGs, about 560 KB); a 64 KB ZIP per listing whose only file
  says it is a demo; two reviews behind paid simulated orders. Images go to the public uploads folder,
  ZIPs to `ASSETS_DIR`. It is idempotent.
- **Tests:** counts, the rerun, files in the right folders, the sellers' sign-in refused, a year on, no
  reminder. Backend tests: 159.
- **Checked on the scratch dev API:** the listings page shows the samples with their previews, a sample
  page names its seller, and the owner bought one (simulated) and downloaded a valid ZIP.
