import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: string
  iconRight?: ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, iconLeft, iconRight, fullWidth = false, className = '', id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-on-surface-variant mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none"
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={[
              'w-full rounded-xl bg-surface-container-high text-on-surface',
              'px-4 py-3 leading-relaxed',
              'outline-none transition-all duration-200',
              'placeholder:text-on-surface-variant/60',
              'focus:bg-surface-container-lowest focus:shadow-[0_0_0_1px_rgba(0,86,210,0.3)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'shadow-[0_0_0_1px_rgba(186,26,26,0.4)]' : '',
              iconLeft ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
