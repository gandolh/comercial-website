import { z } from "zod";

// ─── Reply schemas: output only, separate from the input ones ────────────────

/** The issuer profile: the user_invoice_profiles row, in its column order. */
export const invoiceProfileSchema = z.object({
  user_id: z.string(),
  company_name: z.string().nullable(),
  cui: z.string().nullable(),
  reg_com: z.string().nullable(),
  address: z.string().nullable(),
  iban: z.string().nullable(),
  bank_name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  updated_at: z.string(),
});

/** An invoice, as toInvoiceResponse builds it. */
export const invoiceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  series: z.string(),
  number: z.number(),
  issue_date: z.string(),
  due_date: z.string().nullable(),
  seller_name: z.string(),
  seller_cui: z.string().nullable(),
  seller_reg_com: z.string().nullable(),
  seller_address: z.string().nullable(),
  seller_iban: z.string().nullable(),
  seller_bank: z.string().nullable(),
  seller_email: z.string().nullable(),
  buyer_name: z.string(),
  buyer_cui: z.string().nullable(),
  buyer_address: z.string().nullable(),
  // The stored JSON array, passed through as it was written.
  line_items: z.array(z.unknown()),
  currency: z.string(),
  subtotal: z.number(),
  vat_amount: z.number(),
  total: z.number(),
  order_id: z.number().nullable(),
  created_at: z.string(),
});
