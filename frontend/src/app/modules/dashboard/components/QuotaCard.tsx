import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

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
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-1">
            {t('dashboard.quota.title', 'Limita săptămânală')}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {t('dashboard.quota.subtitle', 'Anunțuri postate în ultimele 7 zile')}
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
          {count} / {limit}
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              count >= limit ? 'bg-error' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">history</span>
          <span>
            {t('dashboard.quota.resets', 'Se resetează în')}{' '}
            <span className="font-bold text-on-surface">
              {formatDistanceToNow(resetDate, { locale: ro })}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
