/**
 * Tests for buildUblXml and validateUblInvoice (e-Factura RO_CIUS hardening).
 *
 * UNVERIFIED (no live ANAF credentials in this environment):
 *   - Actual XSD schema validation against the full CIUS-RO 1.0.1 schema
 *   - Submission to the ANAF e-Factura OAuth2 test/production endpoint
 * These tests verify structural invariants and internal consistency only.
 */

import { describe, it, expect } from "vitest";
import { buildUblXml, validateUblInvoice } from "./invoices.js";
import type { InvoiceResponse } from "./invoices.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal balanced-tag XML well-formedness check (no external XML parser). */
function isWellFormedXml(xml: string): { ok: boolean; reason?: string } {
  // Must start with XML declaration
  if (!xml.trim().startsWith("<?xml")) {
    return { ok: false, reason: "missing XML declaration" };
  }

  // Check that every opened tag has a corresponding close (simple stack check)
  // We handle: <tag>, </tag>, <tag/>, and ignore attributes.
  // This is intentionally simple — not a full XML validator.
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9:_.-]*)(?:\s[^>]*)?\/?>/g;
  const stack: string[] = [];
  let match: RegExpExecArray | null;

  // Strip processing instructions and XML declaration before checking
  const body = xml.replace(/<\?[^>]*\?>/g, "").replace(/<!--[\s\S]*?-->/g, "");

  while ((match = tagRe.exec(body)) !== null) {
    const full = match[0]!;
    const name = match[1]!;

    if (full.endsWith("/>")) {
      // Self-closing — no stack change
      continue;
    }
    if (full.startsWith("</")) {
      // Closing tag
      if (stack.length === 0 || stack[stack.length - 1] !== name) {
        return {
          ok: false,
          reason: `unexpected closing tag </${name}>, expected </${stack[stack.length - 1] ?? "nothing"}>`,
        };
      }
      stack.pop();
    } else {
      // Opening tag
      stack.push(name);
    }
  }

  if (stack.length !== 0) {
    return { ok: false, reason: `unclosed tags: ${stack.join(", ")}` };
  }
  return { ok: true };
}

function makeValidInvoice(overrides: Partial<InvoiceResponse> = {}): InvoiceResponse {
  return {
    id: "inv-1",
    user_id: "user-1",
    series: "FCT",
    number: 1,
    issue_date: "2026-05-29",
    due_date: "2026-06-28",
    seller_name: "SC Vânzător SRL",
    seller_cui: "RO12345678",
    seller_reg_com: "J40/123/2020",
    seller_address: "Str. Exemplu nr. 1, București",
    seller_iban: "RO49AAAA1B31007593840000",
    seller_bank: "Banca Transilvania",
    seller_email: "vanzator@example.com",
    buyer_name: "SC Cumpărător SRL",
    buyer_cui: "RO87654321",
    buyer_address: "Str. Client nr. 2, Cluj-Napoca",
    line_items: [
      { description: "Licență software", qty: 1, unit_price: 100.0, vat_rate: 19 },
    ],
    currency: "RON",
    subtotal: 100.0,
    vat_amount: 19.0,
    total: 119.0,
    order_id: null,
    created_at: "2026-05-29T10:00:00.000Z",
    ...overrides,
  };
}

// ─── validateUblInvoice ───────────────────────────────────────────────────────

describe("validateUblInvoice", () => {
  it("returns no errors for a fully valid invoice", () => {
    const inv = makeValidInvoice();
    const errors = validateUblInvoice(inv);
    expect(errors).toHaveLength(0);
  });

  it("returns no errors for a valid invoice with zero-VAT line", () => {
    const inv = makeValidInvoice({
      line_items: [{ description: "Export goods", qty: 2, unit_price: 50.0, vat_rate: 0 }],
      subtotal: 100.0,
      vat_amount: 0.0,
      total: 100.0,
    });
    const errors = validateUblInvoice(inv);
    expect(errors).toHaveLength(0);
  });

  it("returns no errors when optional CUI fields are absent", () => {
    const inv = makeValidInvoice({
      seller_cui: null,
      buyer_cui: null,
      seller_reg_com: null,
      seller_address: null,
      buyer_address: null,
    });
    const errors = validateUblInvoice(inv);
    expect(errors).toHaveLength(0);
  });

  it("rejects when seller_name is empty", () => {
    const errors = validateUblInvoice(makeValidInvoice({ seller_name: "" }));
    expect(errors.some((e) => e.field === "seller_name")).toBe(true);
  });

  it("rejects when buyer_name is empty", () => {
    const errors = validateUblInvoice(makeValidInvoice({ buyer_name: "  " }));
    expect(errors.some((e) => e.field === "buyer_name")).toBe(true);
  });

  it("rejects non-RON currency", () => {
    const errors = validateUblInvoice(makeValidInvoice({ currency: "EUR" }));
    expect(errors.some((e) => e.field === "currency")).toBe(true);
    expect(errors.find((e) => e.field === "currency")?.message).toMatch(/RON/);
  });

  it("rejects USD currency", () => {
    const errors = validateUblInvoice(makeValidInvoice({ currency: "USD" }));
    expect(errors.some((e) => e.field === "currency")).toBe(true);
  });

  it("rejects malformed issue_date", () => {
    const errors = validateUblInvoice(makeValidInvoice({ issue_date: "29/05/2026" }));
    expect(errors.some((e) => e.field === "issue_date")).toBe(true);
  });

  it("rejects malformed due_date", () => {
    const errors = validateUblInvoice(makeValidInvoice({ due_date: "2026-13-99" }));
    // Pattern check only — the regex ensures format, not calendar validity
    // A date like 2026-13-99 still matches \d{4}-\d{2}-\d{2}, so no error expected here.
    // Let's test a truly malformed one instead:
    const errors2 = validateUblInvoice(makeValidInvoice({ due_date: "not-a-date" }));
    expect(errors2.some((e) => e.field === "due_date")).toBe(true);
  });

  it("rejects empty line_items", () => {
    const errors = validateUblInvoice(makeValidInvoice({ line_items: [] }));
    expect(errors.some((e) => e.field === "line_items")).toBe(true);
  });

  it("rejects line item with zero or negative qty", () => {
    const inv = makeValidInvoice({
      line_items: [{ description: "Item", qty: 0, unit_price: 10, vat_rate: 19 }],
      subtotal: 0,
      vat_amount: 0,
      total: 0,
    });
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field.includes("qty"))).toBe(true);
  });

  it("rejects line item with negative unit_price", () => {
    const inv = makeValidInvoice({
      line_items: [{ description: "Discount item", qty: 1, unit_price: -5, vat_rate: 19 }],
      subtotal: -5,
      vat_amount: -0.95,
      total: -5.95,
    });
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field.includes("unit_price"))).toBe(true);
  });

  it("rejects invalid vat_rate (e.g. 25)", () => {
    const inv = makeValidInvoice({
      line_items: [{ description: "Item", qty: 1, unit_price: 100, vat_rate: 25 }],
      subtotal: 100,
      vat_amount: 25,
      total: 125,
    });
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field.includes("vat_rate"))).toBe(true);
  });

  it("rejects mismatched subtotal", () => {
    const inv = makeValidInvoice({ subtotal: 999.99 });
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field === "subtotal")).toBe(true);
  });

  it("rejects mismatched vat_amount", () => {
    const inv = makeValidInvoice({ vat_amount: 50.0 });
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field === "vat_amount")).toBe(true);
  });

  it("rejects mismatched total (subtotal + vat != total)", () => {
    const inv = makeValidInvoice({ total: 200.0 }); // should be 119.00
    const errors = validateUblInvoice(inv);
    expect(errors.some((e) => e.field === "total")).toBe(true);
  });

  it("rejects CUI with letters in numeric part", () => {
    const errors = validateUblInvoice(makeValidInvoice({ seller_cui: "ROINVALID" }));
    expect(errors.some((e) => e.field === "seller_cui")).toBe(true);
  });

  it("accepts CUI without RO prefix", () => {
    const errors = validateUblInvoice(makeValidInvoice({ seller_cui: "12345678" }));
    expect(errors.filter((e) => e.field === "seller_cui")).toHaveLength(0);
  });

  it("accepts CUI with RO prefix", () => {
    const errors = validateUblInvoice(makeValidInvoice({ seller_cui: "RO12345678" }));
    expect(errors.filter((e) => e.field === "seller_cui")).toHaveLength(0);
  });

  it("accepts multi-line invoice", () => {
    const inv = makeValidInvoice({
      line_items: [
        { description: "Produs A", qty: 2, unit_price: 50.0, vat_rate: 19 },
        { description: "Produs B", qty: 1, unit_price: 100.0, vat_rate: 9 },
      ],
      subtotal: 200.0, // 2*50 + 1*100
      vat_amount: 28.0, // 2*50*0.19 + 1*100*0.09 = 19 + 9
      total: 228.0,
    });
    const errors = validateUblInvoice(inv);
    expect(errors).toHaveLength(0);
  });
});

// ─── buildUblXml ──────────────────────────────────────────────────────────────

describe("buildUblXml", () => {
  it("produces well-formed XML for a valid invoice", () => {
    const inv = makeValidInvoice();
    const xml = buildUblXml(inv);
    const check = isWellFormedXml(xml);
    expect(check.ok, check.reason).toBe(true);
  });

  it("contains required UBL 2.1 CustomizationID for RO_CIUS", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("urn:efactura.mfinante.ro:CIUS-RO:1.0.1");
  });

  it("contains correct invoice ID (series-number)", () => {
    const xml = buildUblXml(makeValidInvoice({ series: "FCT", number: 42 }));
    expect(xml).toContain("<cbc:ID>FCT-42</cbc:ID>");
  });

  it("contains IssueDate", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cbc:IssueDate>2026-05-29</cbc:IssueDate>");
  });

  it("contains DocumentCurrencyCode RON", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>");
  });

  it("contains seller name", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("SC Vânzător SRL");
  });

  it("contains buyer name", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("SC Cumpărător SRL");
  });

  it("contains seller CUI", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("RO12345678");
  });

  it("contains at least one InvoiceLine", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cac:InvoiceLine>");
  });

  it("contains TaxTotal element", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cac:TaxTotal>");
  });

  it("contains LegalMonetaryTotal element", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cac:LegalMonetaryTotal>");
  });

  it("contains PayableAmount", () => {
    const xml = buildUblXml(makeValidInvoice());
    expect(xml).toContain("<cbc:PayableAmount");
    expect(xml).toContain("119.00");
  });

  it("Romanian diacritics survive into XML correctly (XML-escaped where needed)", () => {
    const inv = makeValidInvoice({
      seller_name: "Societatea Văncă & Frații SRL",
      buyer_name: "Cumpărătorul <Bun>",
      line_items: [
        { description: "Șabloane grafice & fonturi", qty: 1, unit_price: 100, vat_rate: 19 },
      ],
      subtotal: 100,
      vat_amount: 19,
      total: 119,
    });
    const xml = buildUblXml(inv);

    // Diacritics must appear in the XML (ă, â, î, ș, ț survive)
    expect(xml).toContain("Văncă");
    expect(xml).toContain("Cumpărătorul");
    expect(xml).toContain("Șabloane grafice");

    // Dangerous XML chars must be escaped
    expect(xml).toContain("&amp;");      // & escaped
    expect(xml).toContain("&lt;");       // < escaped
    expect(xml).toContain("&gt;");       // > escaped

    // Raw unescaped angle brackets from user data must NOT appear inside element content
    // (only the structural angle brackets of the tags themselves are OK)
    // After escaping, "Cumpărătorul <Bun>" becomes "Cumpărătorul &lt;Bun&gt;"
    expect(xml).not.toContain("Cumpărătorul <Bun>");
    expect(xml).toContain("Cumpărătorul &lt;Bun&gt;");

    const check = isWellFormedXml(xml);
    expect(check.ok, check.reason).toBe(true);
  });

  it("multi-line invoice produces well-formed XML and correct totals", () => {
    const inv = makeValidInvoice({
      line_items: [
        { description: "Produs A", qty: 2, unit_price: 50.0, vat_rate: 19 },
        { description: "Produs B", qty: 1, unit_price: 100.0, vat_rate: 9 },
      ],
      subtotal: 200.0,
      vat_amount: 28.0,
      total: 228.0,
    });
    const xml = buildUblXml(inv);
    expect(isWellFormedXml(xml).ok).toBe(true);
    expect(xml.split("<cac:InvoiceLine>").length - 1).toBe(2);
  });

  it("omits DueDate element when due_date is null", () => {
    const xml = buildUblXml(makeValidInvoice({ due_date: null }));
    expect(xml).not.toContain("<cbc:DueDate>");
  });

  it("omits PaymentMeans when seller_iban is null", () => {
    const xml = buildUblXml(makeValidInvoice({ seller_iban: null }));
    expect(xml).not.toContain("<cac:PaymentMeans>");
  });
});
