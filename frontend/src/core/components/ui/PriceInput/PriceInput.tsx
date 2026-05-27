import { forwardRef, type InputHTMLAttributes } from 'react'

interface PriceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  hint?: string
  negotiable?: boolean
  onNegotiableChange?: (v: boolean) => void
  fullWidth?: boolean
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      label = 'Preț',
      error,
      hint,
      negotiable = false,
      onNegotiableChange,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? 'price-input'

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <label htmlFor={inputId} className="block text-sm font-medium text-on-surface-variant mb-1.5">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            min={0}
            disabled={negotiable}
            {...props}
            className={[
              'w-full rounded-xl bg-surface-container-high text-on-surface',
              'pl-4 pr-20 py-3 leading-relaxed',
              'outline-none transition-all duration-200',
              'placeholder:text-on-surface-variant/60',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              'focus:bg-surface-container-lowest focus:shadow-[0_0_0_1px_rgba(0,86,210,0.3)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'shadow-[0_0_0_1px_rgba(186,26,26,0.4)]' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-on-surface-variant pointer-events-none">
            RON
          </span>
        </div>
        {onNegotiableChange && (
          <label className="mt-2 inline-flex items-center gap-2 cursor-pointer select-none text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => onNegotiableChange(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            Preț negociabil
          </label>
        )}
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    )
  },
)

PriceInput.displayName = 'PriceInput'
