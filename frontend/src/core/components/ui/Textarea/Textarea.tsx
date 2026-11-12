import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, fullWidth = false, className = "", id, rows = 4, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          {...props}
          className={[
            "w-full rounded-xl bg-surface-container-high text-on-surface",
            "px-4 py-3 leading-relaxed resize-y",
            "outline-none transition-all duration-200",
            "placeholder:text-on-surface-variant/60",
            "focus:bg-surface-container-lowest focus:shadow-focus",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "shadow-focus-error" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
