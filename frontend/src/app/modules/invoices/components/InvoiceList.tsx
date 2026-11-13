import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@core/components/ui";
import { invoicesService, type Invoice } from "../services/invoices.service";

interface Props {
  invoices: Invoice[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO");
}

export function InvoiceList({ invoices }: Props) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownloadPdf(inv: Invoice) {
    const key = `pdf-${inv.id}`;
    setDownloading(key);
    try {
      await invoicesService.downloadPdf(inv.id, `factura-${inv.series}-${inv.number}.pdf`);
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadXml(inv: Invoice) {
    const key = `xml-${inv.id}`;
    setDownloading(key);
    try {
      await invoicesService.downloadXml(inv.id, `efactura-${inv.series}-${inv.number}.xml`);
    } finally {
      setDownloading(null);
    }
  }

  if (invoices.length === 0) {
    return (
      <p className="py-4 text-sm text-on-surface-variant">
        {t("invoices.list.empty", "Nu ai generat nicio factură încă.")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-on-surface">
                {inv.series}-{inv.number}
              </span>
              <span className="text-xs text-on-surface-variant">{formatDate(inv.issue_date)}</span>
              {inv.due_date && (
                <span className="text-xs text-on-surface-variant">
                  {t("invoices.list.due", "Scadență:")} {formatDate(inv.due_date)}
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-sm text-on-surface-variant">
              {t("invoices.list.buyer", "Client:")} {inv.buyer_name}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-primary">
              {inv.total.toFixed(2)} {inv.currency}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleDownloadPdf(inv)}
              disabled={downloading === `pdf-${inv.id}`}
              iconLeft="picture_as_pdf"
            >
              {downloading === `pdf-${inv.id}` ? t("invoices.list.downloading", "...") : "PDF"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleDownloadXml(inv)}
              disabled={downloading === `xml-${inv.id}`}
              iconLeft="code"
            >
              {downloading === `xml-${inv.id}` ? t("invoices.list.downloading", "...") : "XML"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
