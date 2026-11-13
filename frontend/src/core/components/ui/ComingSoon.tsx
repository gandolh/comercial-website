import { useTranslation } from "react-i18next";

export function ComingSoon() {
  const { t } = useTranslation();
  return (
    <main className="flex flex-1 items-center justify-center pt-8">
      <div className="space-y-4 py-32 text-center">
        <h1 className="text-4xl font-black text-on-surface">{t("comingSoon.title")}</h1>
        <p className="text-on-surface-variant">{t("comingSoon.subtitle")}</p>
      </div>
    </main>
  );
}
