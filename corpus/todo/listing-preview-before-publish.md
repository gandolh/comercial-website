---
title: Listing Preview Before Publish
slug: listing-preview-before-publish
type: add
priority: low
status: done
area: frontend
updated: 2026-05-29
---

# Listing Preview Before Publish

## What

After a seller fills in the create-listing form and uploads files, they should see a preview of how their listing will appear to buyers before clicking "Publică". Currently the wizard goes straight to publish.

## UX

Final step of the create-listing wizard:
- Show the listing as it would appear on `ListingDetailPage` (read-only)
- Show a summary: title, category, price, license type, number of files, total size
- Two buttons: "← Înapoi" (go back to edit) and "Publică anunțul" (publish)

## Implementation

- The listing already exists in DB as soon as assets are uploaded (creation happens on step 1 of the wizard, then assets are attached)
- Preview step: render `ListingDetailPage` in read-only/preview mode using the already-created listing ID
- Alternatively: a lightweight preview component that renders the filled form data without a DB round-trip

## Acceptance criteria

- [x] Preview step shown before final publish action (ReviewStep)
- [x] Preview accurately reflects how listing will appear to buyers
- [x] Seller can go back and edit (wizard Back navigation intact)
- [x] Publish button triggers the existing publish flow (unchanged)

## See also

- [[listing]] — publish endpoint and rules
