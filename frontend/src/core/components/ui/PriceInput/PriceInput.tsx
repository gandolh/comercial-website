import { forwardRef, type InputHTMLAttributes } from "react";
import { Checkbox } from "../Checkbox";

interface PriceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  hint?: string;
  negotiable?: boolean;
  onNegotiableChange?: (v: boolean) => void;
  fullWidth?: boolean;
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      label = "Preț",
      error,
      hint,
      negotiable = false,
      onNegotiableChange,
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? "price-input";

    return (
      <div className={fullWidth ? "w-full" : ""}>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface-variant">
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
              "w-full rounded-control bg-surface-container-low text-on-surface ring-1 ring-outline ring-inset",
              "h-12 pr-20 pl-3.5 text-body",
              "outline-none transition-all duration-200",
              "placeholder:text-on-surface-variant",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "ring-2 ring-error" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-on-surface-variant">
            RON
          </span>
        </div>
        {onNegotiableChange && (
          <Checkbox
            checked={negotiable}
            onCheckedChange={onNegotiableChange}
            label="Preț negociabil"
            className="mt-2 text-sm text-on-surface-variant select-none"
          />
        )}
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    );
  },
);

PriceInput.displayName = "PriceInput";
