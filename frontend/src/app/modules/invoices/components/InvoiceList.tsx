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
      await invoicesService.downloadPdf(
        inv.id,
        `factura-${inv.series}-${inv.number}.pdf`
      );
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadXml(inv: Invoice) {
    const key = `xml-${inv.id}`;
    setDownloading(key);
    try {
      await invoicesService.downloadXml(
        inv.id,
        `efactura-${inv.series}-${inv.number}.xml`
      );
    } finally {
      setDownloading(null);
    }
  }

  if (invoices.length === 0) {
    return (
      <p className="text-on-surface-variant text-sm py-4">
        {t("invoices.list.empty", "Nu ai generat nicio factură încă.")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-on-surface text-sm">
                {inv.series}-{inv.number}
              </span>
              <span className="text-xs text-on-surface-variant">
                {formatDate(inv.issue_date)}
              </span>
              {inv.due_date && (
                <span className="text-xs text-on-surface-variant">
                  {t("invoices.list.due", "Scadență:")} {formatDate(inv.due_date)}
                </span>
              )}
            </div>
            <div className="text-sm text-on-surface-variant mt-0.5 truncate">
              {t("invoices.list.buyer", "Client:")} {inv.buyer_name}
            </div>
            <div className="text-sm font-semibold text-primary mt-0.5">
              {inv.total.toFixed(2)} {inv.currency}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleDownloadPdf(inv)}
              disabled={downloading === `pdf-${inv.id}`}
              iconLeft="picture_as_pdf"
            >
              {downloading === `pdf-${inv.id}`
                ? t("invoices.list.downloading", "...")
                : "PDF"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadXml(inv)}
              disabled={downloading === `xml-${inv.id}`}
              iconLeft="code"
            >
              {downloading === `xml-${inv.id}`
                ? t("invoices.list.downloading", "...")
                : "XML"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
