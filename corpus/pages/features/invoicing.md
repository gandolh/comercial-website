---
title: Invoicing & ANAF CUI Lookup
slug: invoicing
category: product
tags: [invoice, e-factura, ubl, anaf, cui, pdf]
sources: 0
updated: 2026-05-29
---

# Invoicing & ANAF CUI Lookup

A v1 invoice generator: sellers save an issuer profile and generate Romanian invoices as downloadable
**PDF** and **UBL 2.1 XML** (e-Factura shape). Company data auto-fills from a CUI via an ANAF proxy.
Originated from todos `invoice-generator`, `cui-lookup`.

## ANAF CUI company lookup

- `GET /anaf/company/:cui` (`modules/anaf.ts`) — proxies the public ANAF VAT-payer API
  (`webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva`) and returns normalized
  `{ cui, denumire, adresa, nrRegCom, scpTVA, stare }`.
- Input normalized (strips leading `RO`, numeric check). Invalid format → `422`; unknown CUI → `404`;
  ANAF unreachable → clean error (8s `AbortController` timeout). 1-hour in-memory cache.
- No live ANAF call happens during build/test — only at runtime.

## Invoice generator (v1)

Scope decision: **download only — no ANAF OAuth / SPV submission.**

- **Tables** (migration `20260620010000_invoices.sql`):
  - `user_invoice_profiles` (PK user_id): company_name, cui, reg_com, address, iban, bank_name, email, phone.
  - `invoices`: id, user_id, series, number, issue_date, due_date, seller_* snapshot, buyer_*, line_items
    (JSON text), currency, subtotal, vat_amount, total, **`order_id` (nullable, no FK — reserved for
    [[digital-asset-commerce]])**, created_at. `UNIQUE(user_id, series, number)`; number auto-increments per (user, series).
- **Endpoints** (`modules/invoices.ts`, all JWT-authenticated): `GET/PUT /invoices/profile`,
  `GET/POST /invoices`, `GET /invoices/:id`, `GET /invoices/:id/pdf`, `GET /invoices/:id/xml`.
- **PDF** is hand-built (raw PDF 1.4 bytes, Helvetica/WinAnsi) — no PDF library.
- **XML** is UBL 2.1 with `urn:efactura.mfinante.ro:CIUS-RO:1.0.1`, string-templated — no library.
- **Frontend:** `/facturi` page (list / create / billing-profile tabs); the CUI auto-fill button in
  `InvoiceProfileForm` and `CreateInvoiceForm` calls `GET /anaf/company/:cui`. i18n under `invoices.*`.
- **Zero new npm dependencies.**

## Hardening (added 2026-05-29)

An **offline UBL structural validator** (`validateUblInvoice`) now runs before XML is emitted and the
`GET /invoices/:id/xml` endpoint **fails loudly** (`AppError.validation`) on a structurally-invalid
e-Factura rather than emitting bad XML. It checks: non-empty seller/buyer name, currency == RON, ISO
issue/due dates, ≥1 line item, per-line description/qty>0/unit_price≥0/vat_rate∈{0,5,9,19}, CUI shape
(optional `RO` + 2–10 digits), and internal monetary consistency (Σ line extensions == subtotal;
Σ per-line VAT == vat_amount; subtotal + vat == total, ±0.02). Covered by 36 vitest cases (valid passes,
several invalid variants rejected, Romanian diacritics survive into the XML escaped).

## Open questions

- ⚠️ **STILL UNVERIFIED against live ANAF:** the validator only checks structure we can verify offline —
  the XML has NOT been submitted to ANAF, nor validated against the full CIUS-RO 1.0.1 XSD, nor put
  through the official e-Factura SDK. Conformance remains by-construction. To verify: ANAF OAuth sandbox
  creds → token → POST the XML to the ANAF test upload endpoint.
- PDF diacritics are best-effort: ș/ț fall back to near-equivalents (not in standard WinAnsi).
- No direct SPV/e-Factura upload (OAuth) — explicitly out of v1 scope.

## See also

- [[digital-asset-commerce]] — paid orders that an invoice can reference via `order_id`
- [[user]] — the issuer profile lives per-user
- [[product-ideas]] — invoice generator was a prioritized product idea
