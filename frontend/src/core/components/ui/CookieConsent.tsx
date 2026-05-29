import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@core/components/ui/Button'

const STORAGE_KEY = 'cookie_consent'
type ConsentValue = 'accepted' | 'rejected'

export function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted' as ConsentValue)
    setVisible(false)
  }

  function handleReject() {
    localStorage.setItem(STORAGE_KEY, 'rejected' as ConsentValue)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('cookies.bannerLabel')}
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant shadow-lg"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Text */}
        <div className="flex-1 text-sm text-on-surface-variant">
          <p>
            {t('cookies.bannerText')}{' '}
            {/* Plain anchor — route /confidentialitate is created in the static-pages wave */}
            <a
              href="/confidentialitate"
              className="text-primary underline underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t('cookies.policyLink')}
            </a>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-row gap-3 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReject}
            aria-label={t('cookies.rejectAll')}
          >
            {t('cookies.rejectAll')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            aria-label={t('cookies.acceptAll')}
          >
            {t('cookies.acceptAll')}
          </Button>
        </div>
      </div>
    </div>
  )
}
