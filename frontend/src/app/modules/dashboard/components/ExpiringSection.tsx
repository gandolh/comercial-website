import { useTranslation } from 'react-i18next';
import { useListingMutations } from '@app/modules/listings/hooks/useListingMutations';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ListingCard } from '@app/modules/home/components/ListingCard';
import type { ListingCard as ListingCardType } from '@app/types/listing';

interface ExpiringSectionProps {
  listings: ListingCardType[];
}

export function ExpiringSection({ listings }: ExpiringSectionProps) {
  const { t } = useTranslation();
  const { renew } = useListingMutations();
  const qc = useQueryClient();

  if (listings.length === 0) return null;

  const handleRenew = async (id: string) => {
    await renew.mutateAsync(id);
    qc.invalidateQueries({ queryKey: ['me', 'stats'] });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error">notification_important</span>
          <h2 className="text-xl font-bold text-on-surface">
            {t('dashboard.expiringSoon.title', 'Anunțuri care expiră curând')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          const expiresAt = new Date(listing.expiresAt);
          return (
            <div key={listing.id} className="relative group">
              <ListingCard listing={listing} />
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-error text-on-error px-2 py-1 rounded text-xs font-bold shadow-lg">
                  {t('dashboard.expiringSoon.expiresIn', 'Expiră în')}{' '}
                  {formatDistanceToNow(expiresAt, { locale: ro })}
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => handleRenew(listing.id)}
                  disabled={renew.isPending}
                  className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  {renew.isPending 
                    ? t('common.loading', 'Se încarcă...') 
                    : t('dashboard.expiringSoon.renewAction', 'Reînnoiește acum')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
