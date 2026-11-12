import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, fullWidth = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            {...props}
            className={[
              "w-full appearance-none rounded-xl bg-surface-container-high text-on-surface",
              "px-4 py-3 pr-10 leading-relaxed",
              "outline-none transition-all duration-200 cursor-pointer",
              "focus:bg-surface-container-lowest focus:shadow-focus",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "shadow-focus-error" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xl text-on-surface-variant"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
