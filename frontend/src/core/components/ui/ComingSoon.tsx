import { useTranslation } from 'react-i18next'

export function ComingSoon() {
  const { t } = useTranslation()
  return (
    <main className="pt-24 flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 py-32">
        <h1 className="text-4xl font-black text-on-surface">{t('comingSoon.title')}</h1>
        <p className="text-on-surface-variant">{t('comingSoon.subtitle')}</p>
      </div>
    </main>
  )
}
