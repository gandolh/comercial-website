---
title: ANAF CUI Company Lookup
slug: cui-lookup
type: add
priority: medium
status: done
area: backend, frontend
updated: 2026-05-29
---

# ANAF CUI Company Lookup

## What

A free utility endpoint that proxies the ANAF public API to look up a Romanian company by its fiscal code (CUI/CIF). Used by the invoice generator and optionally exposed as a search helper.

## Why

ANAF provides a free REST API at `https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva` that returns company name, address, VAT registration status, and other fiscal data from a CUI. This data is needed for the invoice generator (auto-fill buyer/seller fields) and is useful for buyers verifying a seller's identity.

## Backend endpoint

```
GET /anaf/company/:cui
```

- Proxies to ANAF API (avoids CORS from browser)
- Returns: `{ cui, name, address, vat_registered, active }`
- Caches responses in memory for 1 hour (ANAF data doesn't change often)
- Returns 404 if CUI not found, 422 if CUI format invalid

## CUI format validation

Romanian CUI: 2–10 digits, optionally prefixed with `RO` for VAT-registered companies.

## Frontend usage

- Invoice generator: "Caută firma după CUI" button — calls this endpoint, auto-fills company name + address
- Optionally: seller profile verification (show company name if CUI provided)

## Acceptance criteria

- [x] `GET /anaf/company/:cui` returns normalized company data
- [x] Invalid CUI format returns 422
- [x] Unknown CUI returns 404
- [x] Response cached (1h in-memory TTL)
- [ ] Invoice generator uses this endpoint for auto-fill (pending Wave 4 / invoice-generator)

## See also

- [[invoice-generator]] — primary consumer of this endpoint
