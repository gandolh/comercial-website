import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon = 'inbox', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-20 px-6 gap-4 text-center',
        className,
      ].join(' ')}
    >
      <span
        className="material-symbols-outlined text-on-surface-variant"
        style={{ fontSize: '56px' }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="font-headline font-semibold text-on-surface text-lg">{title}</p>
        {description && <p className="text-sm text-on-surface-variant max-w-xs">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
