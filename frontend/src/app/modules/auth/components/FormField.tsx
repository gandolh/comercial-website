import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ label, error, ...props }, ref) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-on-surface">{label}</label>
      <input
        ref={ref}
        className={`
            w-full rounded-lg border bg-surface-container px-4 py-3
            text-on-surface transition-colors
            focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none
            ${error ? "border-error focus:ring-error" : "border-outline-variant hover:border-outline"}
          `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
});

FormField.displayName = "FormField";
