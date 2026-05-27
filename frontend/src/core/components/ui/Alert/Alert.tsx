import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const variantConfig: Record<AlertVariant, { icon: string; classes: string }> = {
  info: {
    icon: 'info',
    classes: 'bg-primary-fixed/20 text-on-surface border border-primary/20',
  },
  success: {
    icon: 'check_circle',
    classes: 'bg-tertiary-container/40 text-on-tertiary-container border border-tertiary/20',
  },
  warning: {
    icon: 'warning',
    classes: 'bg-secondary-container/40 text-on-secondary-container border border-secondary/20',
  },
  error: {
    icon: 'error',
    classes: 'bg-error-container text-on-error-container border border-error/20',
  },
}

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const { icon, classes } = variantConfig[variant]

  return (
    <div
      role="alert"
      className={['flex gap-3 rounded-xl px-4 py-3', classes, className].join(' ')}
    >
      <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide alerta"
          className="flex-shrink-0 rounded-full p-0.5 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  )
}
