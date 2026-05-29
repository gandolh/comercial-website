import { z } from "zod";
import { AppError } from "@my-olx/core";
import type { RouteRegistrar } from "../context.js";
import type { FastifyInstance } from "fastify";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
  vat_rate: number; // 0 | 5 | 9 | 19
}

export interface InvoiceResponse {
  id: string;
  user_id: string;
  series: string;
  number: number;
  issue_date: string;
  due_date: string | null;
  seller_name: string;
  seller_cui: string | null;
  seller_reg_com: string | null;
  seller_address: string | null;
  seller_iban: string | null;
  seller_bank: string | null;
  seller_email: string | null;
  buyer_name: string;
  buyer_cui: string | null;
  buyer_address: string | null;
  line_items: LineItem[];
  currency: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  order_id: number | null;
  created_at: string;
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const LineItemSchema = z.object({
  description: z.string().min(1),
  qty: z.number().positive(),
  unit_price: z.number().min(0),
  vat_rate: z.number().refine((v) => [0, 5, 9, 19].includes(v), {
    message: "vat_rate trebuie să fie 0, 5, 9 sau 19",
  }),
});

const ProfileUpsertSchema = z.object({
  company_name: z.string().max(200).nullable().optional(),
  cui: z.string().max(20).nullable().optional(),
  reg_com: z.string().max(30).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  iban: z.string().max(34).nullable().optional(),
  bank_name: z.string().max(100).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
});

const CreateInvoiceSchema = z.object({
  series: z.string().max(10).optional().default("FCT"),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  seller_name: z.string().min(1).max(200),
  seller_cui: z.string().max(20).nullable().optional(),
  seller_reg_com: z.string().max(30).nullable().optional(),
  seller_address: z.string().max(500).nullable().optional(),
  seller_iban: z.string().max(34).nullable().optional(),
  seller_bank: z.string().max(100).nullable().optional(),
  seller_email: z.string().email().nullable().optional(),
  buyer_name: z.string().min(1).max(200),
  buyer_cui: z.string().max(20).nullable().optional(),
  buyer_address: z.string().max(500).nullable().optional(),
  line_items: z.array(LineItemSchema).min(1),
  currency: z.string().length(3).optional().default("RON"),
});

// ─── PDF generator (no external deps — hand-rolled minimal PDF) ───────────────

function escPdf(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function latin2ToWinAnsi(text: string): string {
  // Map common Romanian diacritics (UTF-8) → WinAnsi code points readable in basic PDF
  return text
    .replace(/ă/g, "\xe3")
    .replace(/Ă/g, "\xc3")
    .replace(/â/g, "\xe2")
    .replace(/Â/g, "\xc2")
    .replace(/î/g, "\xee")
    .replace(/Î/g, "\xce")
    .replace(/ș/g, "\x15") // not in WinAnsi — keep as best-effort
    .replace(/Ș/g, "\x14")
    .replace(/ț/g, "\x16")
    .replace(/Ț/g, "\x17")
    .replace(/ş/g, "\xba") // cedilla variant
    .replace(/Ş/g, "\xaa")
    .replace(/ţ/g, "\xfe")
    .replace(/Ţ/g, "\xde");
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

function pdfText(
  x: number,
  y: number,
  text: string,
  size = 10
): string {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escPdf(latin2ToWinAnsi(text))}) Tj ET\n`;
}

function buildPdf(inv: InvoiceResponse): Buffer {
  const items = inv.line_items;
  const pageHeight = 842; // A4 in points
  const margin = 50;
  let currentY = pageHeight - margin;
  const lineH = 16;

  const lines: string[] = [];

  const title = `FACTURA ${inv.series}-${inv.number}`;
  lines.push(pdfText(margin, currentY, title, 16));
  currentY -= 28;

  lines.push(pdfText(margin, currentY, `Data emiterii: ${inv.issue_date}`, 10));
  if (inv.due_date) {
    lines.push(pdfText(300, currentY, `Scadenta: ${inv.due_date}`, 10));
  }
  currentY -= lineH * 2;

  // Seller
  lines.push(pdfText(margin, currentY, "FURNIZOR", 11));
  currentY -= lineH;
  lines.push(pdfText(margin, currentY, `Denumire: ${inv.seller_name}`, 10));
  currentY -= lineH;
  if (inv.seller_cui) {
    lines.push(pdfText(margin, currentY, `CUI: ${inv.seller_cui}`, 10));
    currentY -= lineH;
  }
  if (inv.seller_reg_com) {
    lines.push(pdfText(margin, currentY, `Reg. Com.: ${inv.seller_reg_com}`, 10));
    currentY -= lineH;
  }
  if (inv.seller_address) {
    lines.push(pdfText(margin, currentY, `Adresa: ${inv.seller_address}`, 10));
    currentY -= lineH;
  }
  if (inv.seller_iban) {
    lines.push(pdfText(margin, currentY, `IBAN: ${inv.seller_iban}`, 10));
    if (inv.seller_bank) {
      lines.push(pdfText(300, currentY, `Banca: ${inv.seller_bank}`, 10));
    }
    currentY -= lineH;
  }
  currentY -= lineH;

  // Buyer
  lines.push(pdfText(margin, currentY, "CLIENT", 11));
  currentY -= lineH;
  lines.push(pdfText(margin, currentY, `Denumire: ${inv.buyer_name}`, 10));
  currentY -= lineH;
  if (inv.buyer_cui) {
    lines.push(pdfText(margin, currentY, `CUI/CNP: ${inv.buyer_cui}`, 10));
    currentY -= lineH;
  }
  if (inv.buyer_address) {
    lines.push(pdfText(margin, currentY, `Adresa: ${inv.buyer_address}`, 10));
    currentY -= lineH;
  }
  currentY -= lineH;

  // Table header
  const c1 = margin;
  const c2 = 280;
  const c3 = 360;
  const c4 = 430;
  const c5 = 500;

  lines.push(pdfText(c1, currentY, "Descriere", 10));
  lines.push(pdfText(c2, currentY, "Cant.", 10));
  lines.push(pdfText(c3, currentY, "Pret unit.", 10));
  lines.push(pdfText(c4, currentY, "TVA %", 10));
  lines.push(pdfText(c5, currentY, "Valoare", 10));
  currentY -= lineH;

  // Separator line placeholder (we embed as text dashes)
  lines.push(
    pdfText(c1, currentY, "------------------------------------------------------------------------", 8)
  );
  currentY -= lineH;

  for (const item of items) {
    const value = item.qty * item.unit_price;
    const desc =
      item.description.length > 35
        ? item.description.slice(0, 33) + ".."
        : item.description;
    lines.push(pdfText(c1, currentY, desc, 10));
    lines.push(pdfText(c2, currentY, String(item.qty), 10));
    lines.push(pdfText(c3, currentY, formatMoney(item.unit_price), 10));
    lines.push(pdfText(c4, currentY, `${item.vat_rate}%`, 10));
    lines.push(pdfText(c5, currentY, formatMoney(value), 10));
    currentY -= lineH;
  }

  currentY -= lineH;
  lines.push(
    pdfText(c1, currentY, "------------------------------------------------------------------------", 8)
  );
  currentY -= lineH;

  lines.push(pdfText(c4, currentY, "Subtotal:", 10));
  lines.push(pdfText(c5, currentY, `${formatMoney(inv.subtotal)} ${inv.currency}`, 10));
  currentY -= lineH;

  lines.push(pdfText(c4, currentY, "TVA:", 10));
  lines.push(pdfText(c5, currentY, `${formatMoney(inv.vat_amount)} ${inv.currency}`, 10));
  currentY -= lineH;

  lines.push(pdfText(c4, currentY, "TOTAL:", 11));
  lines.push(pdfText(c5, currentY, `${formatMoney(inv.total)} ${inv.currency}`, 11));

  const streamContent = lines.join("");
  const streamBytes = Buffer.from(streamContent, "binary");
  const streamLen = streamBytes.length;

  // Build PDF objects
  const objs: string[] = [];

  // Obj 1: Catalog
  objs.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages
  objs.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // Obj 3: Page
  objs.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]\n   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
  );

  // Obj 4: Content stream
  objs.push(
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}endstream\nendobj\n`
  );

  // Obj 5: Font (standard Helvetica — no embedding needed)
  objs.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n"
  );

  const header = "%PDF-1.4\n";
  const parts: Buffer[] = [Buffer.from(header, "binary")];
  const offsets: number[] = [];
  let offset = header.length;

  for (const obj of objs) {
    offsets.push(offset);
    const buf = Buffer.from(obj, "binary");
    parts.push(buf);
    offset += buf.length;
  }

  const xrefOffset = offset;
  const xrefLines: string[] = [
    "xref\n",
    `0 ${objs.length + 1}\n`,
    "0000000000 65535 f \n",
  ];
  for (const off of offsets) {
    xrefLines.push(`${String(off).padStart(10, "0")} 00000 n \n`);
  }

  const trailer =
    `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  parts.push(Buffer.from(xrefLines.join(""), "binary"));
  parts.push(Buffer.from(trailer, "binary"));

  return Buffer.concat(parts);
}

// ─── UBL 2.1 XML (e-Factura RO_CIUS) ─────────────────────────────────────────

function xmlEsc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildUblXml(inv: InvoiceResponse): string {
  const items = inv.line_items;

  const linesXml = items
    .map((item, idx) => {
      const lineExtAmount = (item.qty * item.unit_price).toFixed(2);
      const vatAmount = (item.qty * item.unit_price * item.vat_rate / 100).toFixed(2);
      return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${item.qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${inv.currency}">${lineExtAmount}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${inv.currency}">${vatAmount}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${inv.currency}">${lineExtAmount}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${inv.currency}">${vatAmount}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${item.vat_rate === 0 ? "Z" : "S"}</cbc:ID>
          <cbc:Percent>${item.vat_rate}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${xmlEsc(item.description)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${item.vat_rate === 0 ? "Z" : "S"}</cbc:ID>
        <cbc:Percent>${item.vat_rate}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${inv.currency}">${item.unit_price.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEsc(inv.series)}-${inv.number}</cbc:ID>
  <cbc:IssueDate>${xmlEsc(inv.issue_date)}</cbc:IssueDate>
  ${inv.due_date ? `<cbc:DueDate>${xmlEsc(inv.due_date)}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${xmlEsc(inv.currency)}</cbc:DocumentCurrencyCode>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${xmlEsc(inv.seller_name)}</cbc:Name></cac:PartyName>
      ${inv.seller_cui ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEsc(inv.seller_cui)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      ${inv.seller_reg_com ? `<cac:PartyLegalEntity>
        <cbc:RegistrationName>${xmlEsc(inv.seller_name)}</cbc:RegistrationName>
        <cbc:CompanyID>${xmlEsc(inv.seller_reg_com)}</cbc:CompanyID>
      </cac:PartyLegalEntity>` : ""}
      ${inv.seller_address ? `<cac:PostalAddress>
        <cbc:StreetName>${xmlEsc(inv.seller_address)}</cbc:StreetName>
        <cac:Country><cbc:IdentificationCode>RO</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>` : ""}
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${xmlEsc(inv.buyer_name)}</cbc:Name></cac:PartyName>
      ${inv.buyer_cui ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEsc(inv.buyer_cui)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      ${inv.buyer_address ? `<cac:PostalAddress>
        <cbc:StreetName>${xmlEsc(inv.buyer_address)}</cbc:StreetName>
        <cac:Country><cbc:IdentificationCode>RO</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>` : ""}
    </cac:Party>
  </cac:AccountingCustomerParty>

  ${inv.seller_iban ? `<cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${xmlEsc(inv.seller_iban)}</cbc:ID>
      ${inv.seller_bank ? `<cbc:Name>${xmlEsc(inv.seller_bank)}</cbc:Name>` : ""}
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>` : ""}

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${inv.currency}">${inv.vat_amount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${inv.currency}">${inv.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${inv.currency}">${inv.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${inv.currency}">${inv.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${inv.currency}">${inv.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${linesXml}
</Invoice>`;
}

// ─── Totals calculator ────────────────────────────────────────────────────────

function calculateTotals(items: LineItem[]): {
  subtotal: number;
  vat_amount: number;
  total: number;
} {
  let subtotal = 0;
  let vat_amount = 0;
  for (const item of items) {
    const lineBase = item.qty * item.unit_price;
    subtotal += lineBase;
    vat_amount += lineBase * (item.vat_rate / 100);
  }
  const total = subtotal + vat_amount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat_amount: Math.round(vat_amount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function toInvoiceResponse(row: any): InvoiceResponse {
  return {
    id: row.id,
    user_id: row.user_id,
    series: row.series,
    number: row.number,
    issue_date: row.issue_date,
    due_date: row.due_date ?? null,
    seller_name: row.seller_name,
    seller_cui: row.seller_cui ?? null,
    seller_reg_com: row.seller_reg_com ?? null,
    seller_address: row.seller_address ?? null,
    seller_iban: row.seller_iban ?? null,
    seller_bank: row.seller_bank ?? null,
    seller_email: row.seller_email ?? null,
    buyer_name: row.buyer_name,
    buyer_cui: row.buyer_cui ?? null,
    buyer_address: row.buyer_address ?? null,
    line_items: JSON.parse(row.line_items ?? "[]"),
    currency: row.currency,
    subtotal: row.subtotal,
    vat_amount: row.vat_amount,
    total: row.total,
    order_id: row.order_id ?? null,
    created_at: row.created_at,
  };
}

// ─── Route registrar ─────────────────────────────────────────────────────────

export const registerInvoicesRoutes: RouteRegistrar = (app, ctx) => {
  const appWithAuth = app as FastifyInstance & { authenticate: any };

  /**
   * GET /invoices/profile
   * Return the authenticated user's invoice issuer profile.
   */
  app.get(
    "/invoices/profile",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const profile = await ctx.db
        .selectFrom("user_invoice_profiles")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return reply.send(profile ?? null);
    }
  );

  /**
   * PUT /invoices/profile
   * Upsert the authenticated user's invoice issuer profile.
   */
  app.put(
    "/invoices/profile",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const parsed = ProfileUpsertSchema.safeParse(request.body);
      if (!parsed.success) throw AppError.validation(parsed.error.message);

      const data = parsed.data;
      const existing = await ctx.db
        .selectFrom("user_invoice_profiles")
        .select("user_id")
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) {
        await ctx.db
          .updateTable("user_invoice_profiles")
          .set({
            company_name: data.company_name ?? null,
            cui: data.cui ?? null,
            reg_com: data.reg_com ?? null,
            address: data.address ?? null,
            iban: data.iban ?? null,
            bank_name: data.bank_name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            updated_at: new Date().toISOString(),
          })
          .where("user_id", "=", userId)
          .execute();
      } else {
        await ctx.db
          .insertInto("user_invoice_profiles")
          .values({
            user_id: userId,
            company_name: data.company_name ?? null,
            cui: data.cui ?? null,
            reg_com: data.reg_com ?? null,
            address: data.address ?? null,
            iban: data.iban ?? null,
            bank_name: data.bank_name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
          })
          .execute();
      }

      const profile = await ctx.db
        .selectFrom("user_invoice_profiles")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return reply.send(profile);
    }
  );

  /**
   * GET /invoices
   * List invoices for the authenticated user (most recent first).
   */
  app.get(
    "/invoices",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const rows = await ctx.db
        .selectFrom("invoices")
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy("created_at", "desc")
        .execute();
      return reply.send(rows.map(toInvoiceResponse));
    }
  );

  /**
   * POST /invoices
   * Create a new invoice record.
   */
  app.post(
    "/invoices",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const parsed = CreateInvoiceSchema.safeParse(request.body);
      if (!parsed.success) throw AppError.validation(parsed.error.message);

      const body = parsed.data;

      // Auto-increment number per user+series
      const maxRow = await ctx.db
        .selectFrom("invoices")
        .select(ctx.db.fn.max("number").as("max_number"))
        .where("user_id", "=", userId)
        .where("series", "=", body.series)
        .executeTakeFirst();

      const nextNumber = ((maxRow?.max_number as number | null) ?? 0) + 1;

      const { subtotal, vat_amount, total } = calculateTotals(body.line_items);

      const insertResult = await ctx.db
        .insertInto("invoices")
        .values({
          user_id: userId,
          series: body.series,
          number: nextNumber,
          issue_date: body.issue_date,
          due_date: body.due_date ?? null,
          seller_name: body.seller_name,
          seller_cui: body.seller_cui ?? null,
          seller_reg_com: body.seller_reg_com ?? null,
          seller_address: body.seller_address ?? null,
          seller_iban: body.seller_iban ?? null,
          seller_bank: body.seller_bank ?? null,
          seller_email: body.seller_email ?? null,
          buyer_name: body.buyer_name,
          buyer_cui: body.buyer_cui ?? null,
          buyer_address: body.buyer_address ?? null,
          line_items: JSON.stringify(body.line_items),
          currency: body.currency,
          subtotal,
          vat_amount,
          total,
          order_id: null,
        })
        .returning("id")
        .executeTakeFirst();

      if (!insertResult?.id) throw AppError.internal();

      const row = await ctx.db
        .selectFrom("invoices")
        .selectAll()
        .where("id", "=", insertResult.id)
        .executeTakeFirst();

      return reply.status(201).send(toInvoiceResponse(row));
    }
  );

  /**
   * GET /invoices/:id
   * Get a single invoice by ID.
   */
  app.get(
    "/invoices/:id",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };
      const row = await ctx.db
        .selectFrom("invoices")
        .selectAll()
        .where("id", "=", id)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      if (!row) throw AppError.notFound();
      return reply.send(toInvoiceResponse(row));
    }
  );

  /**
   * GET /invoices/:id/pdf
   * Download the invoice as a PDF file.
   */
  app.get(
    "/invoices/:id/pdf",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };
      const row = await ctx.db
        .selectFrom("invoices")
        .selectAll()
        .where("id", "=", id)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      if (!row) throw AppError.notFound();

      const inv = toInvoiceResponse(row);
      const pdfBuffer = buildPdf(inv);
      const filename = `factura-${inv.series}-${inv.number}.pdf`;

      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      reply.header("Content-Length", pdfBuffer.length);
      return reply.send(pdfBuffer);
    }
  );

  /**
   * GET /invoices/:id/xml
   * Download the invoice as a UBL 2.1 XML (e-Factura RO_CIUS).
   */
  app.get(
    "/invoices/:id/xml",
    { preHandler: appWithAuth.authenticate },
    async (request, reply) => {
      const userId = request.userId!;
      const { id } = request.params as { id: string };
      const row = await ctx.db
        .selectFrom("invoices")
        .selectAll()
        .where("id", "=", id)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      if (!row) throw AppError.notFound();

      const inv = toInvoiceResponse(row);
      const xml = buildUblXml(inv);
      const filename = `efactura-${inv.series}-${inv.number}.xml`;

      reply.header("Content-Type", "application/xml; charset=utf-8");
      reply.header(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      return reply.send(xml);
    }
  );
};
