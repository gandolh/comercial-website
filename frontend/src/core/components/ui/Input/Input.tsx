import { cn } from "@core/lib/cn";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: string;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, fullWidth = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xl text-on-surface-variant"
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(
              "w-full rounded-control bg-surface-container-low text-on-surface ring-1 ring-outline ring-inset",
              "h-12 px-3.5 text-body",
              "transition-all duration-200 outline-none",
              "placeholder:text-on-surface-variant",
              "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "ring-2 ring-error" : "",
              iconLeft ? "pl-10" : "",
              iconRight ? "pr-10" : "",
              className,
            )}
          />
          {iconRight && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant">{iconRight}</span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
