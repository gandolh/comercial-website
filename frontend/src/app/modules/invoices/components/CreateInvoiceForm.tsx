import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button, Input, Select } from "@core/components/ui";
import { axiosInstance } from "@core/lib/axios";
import { useCreateInvoice } from "../hooks/useInvoices";
import type { InvoiceProfile } from "../services/invoices.service";

const lineItemSchema = z.object({
  description: z.string().min(1, "Descrierea este obligatorie"),
  qty: z.number().positive("Cantitatea trebuie să fie pozitivă"),
  unit_price: z.number().min(0, "Prețul nu poate fi negativ"),
  vat_rate: z.number().refine((v) => [0, 5, 9, 19].includes(v), {
    message: "TVA trebuie să fie 0, 5, 9 sau 19",
  }),
});

const schema = z.object({
  series: z.string().max(10).optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: AAAA-LL-ZZ"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format: AAAA-LL-ZZ")
    .optional()
    .or(z.literal("")),
  seller_name: z.string().min(1, "Denumirea furnizorului este obligatorie"),
  seller_cui: z.string().max(20).optional(),
  seller_reg_com: z.string().max(30).optional(),
  seller_address: z.string().max(500).optional(),
  seller_iban: z.string().max(34).optional(),
  seller_bank: z.string().max(100).optional(),
  seller_email: z.string().email("Email invalid").optional().or(z.literal("")),
  buyer_name: z.string().min(1, "Denumirea cumpărătorului este obligatorie"),
  buyer_cui: z.string().max(20).optional(),
  buyer_address: z.string().max(500).optional(),
  line_items: z.array(lineItemSchema).min(1, "Cel puțin o linie de factură"),
});

type FormValues = z.infer<typeof schema>;

const VAT_OPTIONS = [
  { value: "19", label: "19%" },
  { value: "9", label: "9%" },
  { value: "5", label: "5%" },
  { value: "0", label: "0%" },
];

interface Props {
  profile?: InvoiceProfile | null;
  onCreated?: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateInvoiceForm({ profile, onCreated }: Props) {
  const { t } = useTranslation();
  const create = useCreateInvoice();
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      series: "FCT",
      issue_date: todayStr(),
      seller_name: profile?.company_name ?? "",
      seller_cui: profile?.cui ?? "",
      seller_reg_com: profile?.reg_com ?? "",
      seller_address: profile?.address ?? "",
      seller_iban: profile?.iban ?? "",
      seller_bank: profile?.bank_name ?? "",
      seller_email: profile?.email ?? "",
      buyer_name: "",
      buyer_cui: "",
      buyer_address: "",
      line_items: [{ description: "", qty: 1, unit_price: 0, vat_rate: 19 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "line_items",
  });

  const lineItems = useWatch({ control, name: "line_items" });
  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unit_price) || 0), 0);
  const vatAmount = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.qty) || 0) * (Number(item.unit_price) || 0) * ((Number(item.vat_rate) || 0) / 100),
    0,
  );
  const total = subtotal + vatAmount;

  async function autofillBuyerFromCui() {
    const cui = (document.getElementById("buyer-cui") as HTMLInputElement)?.value?.trim();
    if (!cui) return;
    setCuiLoading(true);
    setCuiError(null);
    try {
      const res = await axiosInstance.get(`/anaf/company/${encodeURIComponent(cui)}`);
      const data = res.data;
      if (data.denumire) setValue("buyer_name", data.denumire);
      if (data.adresa) setValue("buyer_address", data.adresa);
    } catch {
      setCuiError(t("invoices.create.cuiNotFound", "CUI-ul nu a fost găsit în ANAF."));
    } finally {
      setCuiLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    await create.mutateAsync({
      series: values.series || "FCT",
      issue_date: values.issue_date,
      due_date: values.due_date || null,
      seller_name: values.seller_name,
      seller_cui: values.seller_cui || null,
      seller_reg_com: values.seller_reg_com || null,
      seller_address: values.seller_address || null,
      seller_iban: values.seller_iban || null,
      seller_bank: values.seller_bank || null,
      seller_email: values.seller_email || null,
      buyer_name: values.buyer_name,
      buyer_cui: values.buyer_cui || null,
      buyer_address: values.buyer_address || null,
      line_items: values.line_items.map((item) => ({
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
      })),
    });
    onCreated?.();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-8">
      {/* Header info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {t("invoices.create.series", "Serie")}
          </label>
          <Input {...register("series")} placeholder="FCT" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {t("invoices.create.issueDate", "Data emiterii")}
          </label>
          <Input {...register("issue_date")} type="date" />
          {errors.issue_date && <p className="mt-1 text-sm text-error">{errors.issue_date.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {t("invoices.create.dueDate", "Scadență (opțional)")}
          </label>
          <Input {...register("due_date")} type="date" />
        </div>
      </div>

      {/* Seller section */}
      <section className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
        <h3 className="text-base font-bold text-on-surface">{t("invoices.create.sellerSection", "Furnizor")}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerName", "Denumire furnizor")}
            </label>
            <Input {...register("seller_name")} placeholder="S.C. Firma Mea S.R.L." />
            {errors.seller_name && <p className="mt-1 text-sm text-error">{errors.seller_name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerCui", "CUI")}
            </label>
            <Input {...register("seller_cui")} placeholder="RO12345678" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerRegCom", "Reg. Com.")}
            </label>
            <Input {...register("seller_reg_com")} placeholder="J40/1234/2020" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerAddress", "Adresă furnizor")}
            </label>
            <Input {...register("seller_address")} placeholder="Str. Exemplu nr.1, București" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerIban", "IBAN")}
            </label>
            <Input {...register("seller_iban")} placeholder="RO49AAAA1B31007593840000" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.sellerBank", "Bancă")}
            </label>
            <Input {...register("seller_bank")} placeholder="Banca Transilvania" />
          </div>
        </div>
      </section>

      {/* Buyer section */}
      <section className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
        <h3 className="text-base font-bold text-on-surface">{t("invoices.create.buyerSection", "Client")}</h3>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              {t("invoices.create.buyerCui", "CUI / CNP client")}
            </label>
            <Input id="buyer-cui" {...register("buyer_cui")} placeholder="RO87654321" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void autofillBuyerFromCui()}
            disabled={cuiLoading}
          >
            {cuiLoading
              ? t("invoices.create.loading", "Se încarcă...")
              : t("invoices.create.autofill", "Auto-completare ANAF")}
          </Button>
        </div>
        {cuiError && <p className="text-sm text-error">{cuiError}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {t("invoices.create.buyerName", "Denumire client")}
          </label>
          <Input {...register("buyer_name")} placeholder="S.C. Client S.R.L." />
          {errors.buyer_name && <p className="mt-1 text-sm text-error">{errors.buyer_name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {t("invoices.create.buyerAddress", "Adresă client")}
          </label>
          <Input {...register("buyer_address")} placeholder="Str. Exemplu nr.2, Cluj-Napoca" />
        </div>
      </section>

      {/* Line items */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-on-surface">{t("invoices.create.lineItems", "Produse / Servicii")}</h3>
        {errors.line_items?.root && <p className="text-sm text-error">{errors.line_items.root.message}</p>}
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-12 items-start gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-3"
            >
              <div className="col-span-12 sm:col-span-5">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  {t("invoices.create.description", "Descriere")}
                </label>
                <Input {...register(`line_items.${idx}.description`)} placeholder="Serviciu / Produs" />
                {errors.line_items?.[idx]?.description && (
                  <p className="mt-0.5 text-xs text-error">{errors.line_items[idx]?.description?.message}</p>
                )}
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  {t("invoices.create.qty", "Cant.")}
                </label>
                <Input
                  {...register(`line_items.${idx}.qty`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1"
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  {t("invoices.create.unitPrice", "Preț unit. (RON)")}
                </label>
                <Input
                  {...register(`line_items.${idx}.unit_price`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  {t("invoices.create.vatRate", "TVA")}
                </label>
                <Select {...register(`line_items.${idx}.vat_rate`, { valueAsNumber: true })} options={VAT_OPTIONS} />
              </div>
              <div className="col-span-1 flex items-end pb-1">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 text-error hover:opacity-70"
                  aria-label={t("invoices.create.removeLine", "Șterge linie")}
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ description: "", qty: 1, unit_price: 0, vat_rate: 19 })}
        >
          {t("invoices.create.addLine", "+ Adaugă linie")}
        </Button>
      </section>

      {/* Totals */}
      <div className="space-y-1 rounded-xl border border-outline-variant bg-surface-container p-4 text-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>{t("invoices.create.subtotal", "Subtotal fără TVA")}</span>
          <span>{subtotal.toFixed(2)} RON</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>{t("invoices.create.vatTotal", "Total TVA")}</span>
          <span>{vatAmount.toFixed(2)} RON</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-outline-variant pt-2 text-base font-bold text-on-surface">
          <span>{t("invoices.create.total", "TOTAL")}</span>
          <span>{total.toFixed(2)} RON</span>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting || create.isPending}>
          {isSubmitting || create.isPending
            ? t("invoices.create.creating", "Se generează...")
            : t("invoices.create.submit", "Generează factura")}
        </Button>
      </div>

      {create.isError && (
        <p className="text-sm text-error">
          {t("invoices.create.error", "Eroare la generarea facturii. Încearcă din nou.")}
        </p>
      )}
    </form>
  );
}
