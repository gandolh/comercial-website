import { cn } from "@core/lib/cn";
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
          className={cn(
            "w-full rounded-control bg-surface-container-low text-on-surface ring-1 ring-outline ring-inset",
            "resize-y px-3.5 py-3 text-body",
            "transition-all duration-200 outline-none",
            "placeholder:text-on-surface-variant",
            "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "ring-2 ring-error" : "",
            className,
          )}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
