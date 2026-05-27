import type { ButtonHTMLAttributes } from 'react'

type ChipVariant = 'filter' | 'input' | 'suggestion'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant
  selected?: boolean
  onRemove?: () => void
  icon?: string
  label: string
}

export function Chip({
  variant = 'filter',
  selected = false,
  onRemove,
  icon,
  label,
  className = '',
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Elimină ${label}`}
          className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </button>
  )
}
