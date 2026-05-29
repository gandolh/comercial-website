---
title: Legal & Compliance (Static Pages, Cookie Consent)
slug: legal-and-compliance
category: product
tags: [gdpr, cookies, legal, static-pages, compliance, romania]
sources: 0
updated: 2026-05-29
---

# Legal & Compliance (Static Pages, Cookie Consent)

Romanian legal-baseline surface: static legal/info pages and a GDPR cookie consent banner. Originated
from todos `static-pages`, `gdpr-cookie-consent`.

## Static legal pages

A new `legal` frontend module (TanStack Router) with 6 pages of coherent Romanian content:

- `/termeni` — Termeni și Condiții (digital content delivery, 14-day withdrawal exception, ANPC/SAL).
- `/confidentialitate` — Politică de Confidențialitate (GDPR / Law 190/2018; data controller, rights, ANSPDCP).
- `/politica-cookies` (alias `/cookies`) — Politică de Cookies (Law 506/2004).
- `/despre` — Despre my-olx.
- `/contact` — Contact.
- `/ajutor` — Ajutor & FAQ (accordion).

Wired into `app/routes/index.tsx` via `legalRoutes`; Footer links updated. i18n under `legal.*`.

## Cookie consent

- `CookieConsent` banner (`core/components/ui`), mounted in `MainLayout`. Shows on first visit;
  Accept all / Reject all are **equally prominent** (no dark patterns, per Law 506/2004).
- Choice persisted in `localStorage` (`cookie_consent` = `accepted|rejected`); banner does not reappear
  after a decision. Accessible (role/aria-label/keyboard). Links to `/confidentialitate` (now resolves).
  i18n under `cookies.*`.

## Open questions

- Page bodies are coherent boilerplate, not lawyer-reviewed.
- Consent is binary (accept/reject all) — no per-category cookie management.

## See also

- [[gdpr-kits]] — GDPR compliance is also a sellable product category
- [[business-rules]] — Romanian-localization and accessibility requirements
