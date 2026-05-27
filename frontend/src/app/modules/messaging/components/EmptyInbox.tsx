import React from 'react';
import { useTranslation } from 'react-i18next';
export const EmptyInbox: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">chat</span>
      </div>
      <h3 className="text-lg font-semibold font-[Manrope] text-on-surface mb-2">
        {t('common:messaging.empty_inbox_title')}
      </h3>
      <p className="text-on-surface-variant text-sm max-w-xs">
        {t('common:messaging.empty_inbox_description')}
      </p>
    </div>
  );
};
