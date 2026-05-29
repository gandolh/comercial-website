---
title: Invoice & e-Factura Generator
slug: invoice-generator
type: add
priority: high
status: done
area: backend, frontend
updated: 2026-05-29
---

# Invoice & e-Factura Generator

## What

A standalone page in the platform where any logged-in user can generate:
1. A **PDF invoice** (standard Romanian format)
2. A **UBL 2.1 XML e-Factura** compliant with ANAF's RO_CIUS spec
3. Optionally submit the e-Factura directly to ANAF via their OAuth 2.0 API

Emitter fields are saved per account so repeat users don't re-type them.

## Why

Romanian e-invoicing is legally mandatory for B2C since January 2025 (Emergency Ordinance 138/2024). Every seller crossing the VAT threshold must submit e-Facturi to ANAF. No free Romanian tool provides this with a clean UX.

## Tech context

- **Format:** UBL 2.1 XML, RO_CIUS national extension (Order 1366/2021, Ministry of Finance)
- **ANAF API:** `api.anaf.ro` — OAuth 2.0 via `logincert.anaf.ro`; requires SPV registration + Form 084
- **TypeScript SDK available:** `florin-szilagyi/efactura-anaf-ts-sdk` (MIT) — covers XML generation, upload, status check, download, company CUI lookup
- **ANAF CUI lookup:** Free public REST API — enter CUI, get company name + address + VAT status
- **Archive requirement:** 10 years

## UX design

Single page layout:
- **Left panel:** Form fields
  - Emitter section: CUI (with auto-fill via ANAF lookup), company name, address, IBAN
  - "Save emitter details" checkbox (persist to user account)
  - Client section: CUI or personal CNP, name, address
  - Line items: description, qty, unit price, VAT rate (19% / 9% / 5% / 0%)
  - Invoice number, date, due date
- **Right panel:** Live PDF preview (updates as fields change)
- **Bottom buttons:** "Descarcă PDF" | "Descarcă XML (e-Factura)" | "Trimite la ANAF"

## Backend changes

- New `invoices` table: `id, user_id, invoice_number, emitter_data (JSON), client_data (JSON), line_items (JSON), total_ron, vat_ron, created_at`
- New `user_invoice_profiles` table: `user_id PK, cui, company_name, address, iban, updated_at` (saved emitter details)
- `GET /invoice/profile` — return saved emitter details
- `PUT /invoice/profile` — save emitter details
- `POST /invoices` — generate + store invoice, return PDF bytes + XML string
- `POST /invoices/:id/submit-anaf` — submit XML to ANAF API, return submission status
- `GET /invoices` — list user's generated invoices
- ANAF CUI proxy: `GET /anaf/company/:cui` — proxies ANAF company lookup API (avoid CORS from frontend)

## Frontend changes

- New route `/facturi` — Invoice generator page
- New route `/facturi/istoric` — Invoice history
- ANAF OAuth flow (if doing direct submission — may be complex; consider "download XML and submit manually" as v1)

## Phased approach

**v1 (simpler):** PDF + XML download only. No ANAF submission. No OAuth. User downloads XML and uploads to SPV portal manually. This alone is valuable and avoids the ANAF OAuth complexity.

**v2:** Direct ANAF submission via API. Requires OAuth flow and SPV registration guidance.

## Acceptance criteria

- [x] PDF invoice matches Romanian standard format (seller info, buyer info, line items, VAT breakdown, total)
- [x] XML generated as UBL 2.1 with CIUS-RO customization (string-templated; not run through official SDK validator)
- [x] Emitter details persist across sessions (user_invoice_profiles table)
- [x] ANAF CUI lookup auto-fills company name and address (uses GET /anaf/company/:cui)
- [x] Invoice number auto-increments per (user, series)

## See also

- [[payment-processing]] — invoice can be auto-generated on purchase
- [[product-ideas]] — invoice generator in brainstorm
