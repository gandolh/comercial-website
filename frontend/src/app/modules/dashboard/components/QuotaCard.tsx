import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface QuotaCardProps {
  count: number;
  limit: number;
  resetsAt: string;
}

export function QuotaCard({ count, limit, resetsAt }: QuotaCardProps) {
  const { t } = useTranslation();
  const percentage = Math.min((count / limit) * 100, 100);
  const resetDate = new Date(resetsAt);

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-lg font-bold text-on-surface">{t("dashboard.quota.title", "Limita săptămânală")}</h3>
          <p className="text-sm text-on-surface-variant">
            {t("dashboard.quota.subtitle", "Anunțuri postate în ultimele 7 zile")}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {count} / {limit}
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-3 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full transition-all duration-500 ${count >= limit ? "bg-error" : "bg-primary"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">history</span>
          <span>
            {t("dashboard.quota.resets", "Se resetează în")}{" "}
            <span className="font-bold text-on-surface">{formatDistanceToNow(resetDate, { locale: ro })}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
