import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@core/components/ui";
import { axiosInstance } from "@core/lib/axios";
import { useUpsertInvoiceProfile } from "../hooks/useInvoiceProfile";
import type { InvoiceProfile } from "../services/invoices.service";

const schema = z.object({
  company_name: z.string().max(200).optional(),
  cui: z.string().max(20).optional(),
  reg_com: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  iban: z.string().max(34).optional(),
  bank_name: z.string().max(100).optional(),
  email: z.string().email("Email invalid").or(z.literal("")).optional(),
  phone: z.string().max(20).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: InvoiceProfile | null;
  onSaved?: () => void;
}

export function InvoiceProfileForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const upsert = useUpsertInvoiceProfile();
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: initial?.company_name ?? "",
      cui: initial?.cui ?? "",
      reg_com: initial?.reg_com ?? "",
      address: initial?.address ?? "",
      iban: initial?.iban ?? "",
      bank_name: initial?.bank_name ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
    },
  });

  async function autofillFromCui() {
    const cui = (document.getElementById("profile-cui") as HTMLInputElement)?.value?.trim();
    if (!cui) {
      setCuiError(t("invoices.profile.cuiRequired", "Introduceti un CUI pentru auto-completare."));
      return;
    }
    setCuiLoading(true);
    setCuiError(null);
    try {
      const res = await axiosInstance.get(`/anaf/company/${encodeURIComponent(cui)}`);
      const data = res.data;
      if (data.denumire) setValue("company_name", data.denumire);
      if (data.adresa) setValue("address", data.adresa);
      if (data.nrRegCom) setValue("reg_com", data.nrRegCom);
    } catch {
      setCuiError(t("invoices.profile.cuiNotFound", "CUI-ul nu a fost găsit în ANAF."));
    } finally {
      setCuiLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    await upsert.mutateAsync({
      company_name: values.company_name || null,
      cui: values.cui || null,
      reg_com: values.reg_com || null,
      address: values.address || null,
      iban: values.iban || null,
      bank_name: values.bank_name || null,
      email: values.email || null,
      phone: values.phone || null,
    });
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* CUI row with auto-fill */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-on-surface-variant mb-1">
            {t("invoices.profile.cui", "CUI / CIF")}
          </label>
          <Input
            id="profile-cui"
            {...register("cui")}
            placeholder="RO12345678"
          />
          {errors.cui && (
            <p className="text-error text-sm mt-1">{errors.cui.message}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={autofillFromCui}
          disabled={cuiLoading}
        >
          {cuiLoading
            ? t("invoices.profile.loading", "Se încarcă...")
            : t("invoices.profile.autofill", "Auto-completare ANAF")}
        </Button>
      </div>
      {cuiError && <p className="text-error text-sm">{cuiError}</p>}

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          {t("invoices.profile.companyName", "Denumire firmă / Nume")}
        </label>
        <Input {...register("company_name")} placeholder="S.C. Exemplu S.R.L." />
        {errors.company_name && (
          <p className="text-error text-sm mt-1">{errors.company_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          {t("invoices.profile.regCom", "Nr. Reg. Comerțului")}
        </label>
        <Input {...register("reg_com")} placeholder="J40/1234/2020" />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          {t("invoices.profile.address", "Adresă")}
        </label>
        <Input {...register("address")} placeholder="Str. Exemplu nr. 1, București" />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          {t("invoices.profile.iban", "IBAN")}
        </label>
        <Input {...register("iban")} placeholder="RO49AAAA1B31007593840000" />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          {t("invoices.profile.bankName", "Bancă")}
        </label>
        <Input {...register("bank_name")} placeholder="Banca Transilvania" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">
            {t("invoices.profile.email", "Email facturare")}
          </label>
          <Input {...register("email")} type="email" placeholder="facturare@firma.ro" />
          {errors.email && (
            <p className="text-error text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">
            {t("invoices.profile.phone", "Telefon")}
          </label>
          <Input {...register("phone")} placeholder="+40721000000" />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting || upsert.isPending}>
          {isSubmitting || upsert.isPending
            ? t("invoices.profile.saving", "Se salvează...")
            : t("invoices.profile.save", "Salvează profilul de facturare")}
        </Button>
      </div>

      {upsert.isSuccess && (
        <p className="text-tertiary text-sm">
          {t("invoices.profile.saved", "Profilul a fost salvat.")}
        </p>
      )}
      {upsert.isError && (
        <p className="text-error text-sm">
          {t("invoices.profile.saveError", "Eroare la salvare. Încearcă din nou.")}
        </p>
      )}
    </form>
  );
}
