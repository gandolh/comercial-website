---
title: GDPR Cookie Consent Banner
slug: gdpr-cookie-consent
type: add
priority: high
status: done
area: frontend
updated: 2026-05-29
---

# GDPR Cookie Consent Banner

## What

Add a GDPR-compliant cookie consent banner to the frontend. Romanian law (Law 506/2004, amended 2026) requires that the reject button be equally visible as the accept button at the first level — dark patterns are explicitly prohibited.

## Legal requirements (Romania 2026)

- Accept and reject buttons must be **at the same level**, equally visible and accessible
- No pre-checked boxes
- No confusing language
- Withdrawal must be as easy as granting consent
- Penalties: 5,000–100,000 RON; up to 2% annual turnover for large companies
- Compliance window: 120 days from law entry into force

## What cookies we use

Currently: likely just JWT in localStorage (not a cookie), no analytics. But as we add:
- Analytics (if any) — require consent
- Any third-party embeds — require consent

For now: minimal banner required even if only using functional cookies.

## Implementation

- Banner component shown on first visit (check localStorage flag `cookie_consent`)
- Three buttons: "Accept toate", "Respinge toate", "Preferințe" (for granular control — future)
- On accept/reject: set `cookie_consent = 'accepted' | 'rejected'` in localStorage
- If rejected: disable any analytics scripts
- Banner should be at bottom of screen, not a full-page overlay

## Acceptance criteria

- [x] Banner shown on first visit
- [x] Accept and reject buttons equally prominent
- [x] Preference persisted across sessions (localStorage cookie_consent)
- [x] Banner does not appear again after choice is made
- [x] Links to /confidentialitate (route lands in Wave 3 static-pages)

## See also

- [[gdpr-kits]] — market research on GDPR compliance requirements
