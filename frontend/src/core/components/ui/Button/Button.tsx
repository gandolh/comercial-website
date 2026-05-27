import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: string
  iconRight?: string
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
  tertiary:
    'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-primary hover:bg-primary-fixed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  danger:
    'bg-error text-on-error hover:opacity-90 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm gap-1.5',
  md: 'px-6 py-2.5 text-base gap-2',
  lg: 'px-8 py-3.5 text-lg gap-2.5',
}

const iconSizes: Record<Size, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'outline-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <span
          className={`material-symbols-outlined animate-spin ${iconSizes[size]}`}
          aria-hidden="true"
        >
          progress_activity
        </span>
      ) : iconLeft ? (
        <span className={`material-symbols-outlined ${iconSizes[size]}`} aria-hidden="true">
          {iconLeft}
        </span>
      ) : null}
      {children}
      {!loading && iconRight && (
        <span className={`material-symbols-outlined ${iconSizes[size]}`} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  )
}
