import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-on-surface mb-2">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
            bg-surface-container text-on-surface
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${
              error
                ? "border-error focus:ring-error"
                : "border-outline-variant hover:border-outline"
            }
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = "FormField";
