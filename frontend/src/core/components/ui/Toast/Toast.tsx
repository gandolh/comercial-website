import { useEffect, type ReactNode } from 'react'

type ToastVariant = 'info' | 'success' | 'error' | 'warning'

interface ToastProps {
  open: boolean
  onClose: () => void
  variant?: ToastVariant
  message: string
  action?: ReactNode
  duration?: number
}

const variantConfig: Record<ToastVariant, { icon: string; classes: string }> = {
  info: {
    icon: 'info',
    classes: 'bg-inverse-surface text-inverse-on-surface',
  },
  success: {
    icon: 'check_circle',
    classes: 'bg-tertiary-container text-on-tertiary-container',
  },
  error: {
    icon: 'error',
    classes: 'bg-error-container text-on-error-container',
  },
  warning: {
    icon: 'warning',
    classes: 'bg-secondary-container text-on-secondary-container',
  },
}

export function Toast({
  open,
  onClose,
  variant = 'info',
  message,
  action,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, onClose, duration])

  const { icon, classes } = variantConfig[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-5 py-3 rounded-full shadow-ambient',
        'transition-all duration-300',
        open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        classes,
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-xl" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm font-medium">{message}</span>
      {action && <div className="ml-2">{action}</div>}
      <button
        type="button"
        onClick={onClose}
        aria-label="Închide notificarea"
        className="ml-1 rounded-full p-0.5 hover:opacity-70 transition-opacity"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}
