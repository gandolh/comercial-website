---
title: Verify e-Factura XML against live ANAF
slug: verify-efactura-live
category: product
tags: [efactura, anaf, invoicing, ubl, verification, blocked]
type: update
priority: high
status: pending
updated: 2026-05-29
---

# Verify e-Factura XML against live ANAF

The generated UBL 2.1 / RO_CIUS XML is currently validated **only structurally and offline** (see the
`validateUblInvoice` work in [[invoicing]]). Conformance to the real ANAF e-Factura system is unproven.

## Why this is still open

No ANAF credentials exist in the dev/CI environment, so the XML has never been:
- validated against the official **CIUS-RO 1.0.1 XSD** / ANAF e-Factura SDK validator;
- submitted to the ANAF test upload endpoint;
- round-tripped through ANAF OAuth 2.0 token acquisition.

The offline validator catches malformed invoices but cannot guarantee ANAF will accept the document.

## Acceptance criteria

- Obtain ANAF **test/sandbox** OAuth 2.0 credentials and acquire a bearer token.
- Run a generated invoice's XML through the official CIUS-RO XSD (and/or the
  `florin-szilagyi/efactura-anaf-ts-sdk` validator) — fix any conformance gaps surfaced.
- `POST` the XML to the ANAF **test** upload endpoint (`/test/FCTEL/rest/upload`) and confirm it is
  accepted (poll status to `ok`).
- Document the verified flow + any field corrections in [[invoicing]]; downgrade the ⚠️ caveat there.

## Notes

- Optional follow-on (out of scope for "verify"): wire a real **Submit to ANAF** button (OAuth + upload)
  as a platform feature — currently explicitly out of v1 scope.

## See also

- [[invoicing]] — the e-Factura generator + offline validator this verifies
- [[product-ideas]] — e-Factura generator was a prioritized idea
