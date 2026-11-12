import React from "react";
import { useTranslation } from "react-i18next";
export const EmptyInbox: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">chat</span>
      </div>
      <h3 className="mb-2 font-[Manrope] text-lg font-semibold text-on-surface">
        {t("common:messaging.empty_inbox_title")}
      </h3>
      <p className="max-w-xs text-sm text-on-surface-variant">{t("common:messaging.empty_inbox_description")}</p>
    </div>
  );
};
