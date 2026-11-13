import type { ComponentProps, ReactNode } from "react";
import { cn } from "@core/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "tertiary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// ComponentProps carries `ref` (React 19), so a Base UI trigger can render this button through `render`.
interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: string;
  iconRight?: string;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  outline:
    "border border-outline bg-transparent text-on-surface hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  tertiary:
    "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-fixed-dim focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-primary hover:bg-primary-fixed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  danger:
    "bg-error text-on-error hover:opacity-90 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-control gap-1.5",
  md: "h-12 px-5 text-body gap-2.5",
  lg: "h-14 px-8 text-body gap-2.5",
};

const iconSizes: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-control font-semibold transition-colors duration-200 active:brightness-90",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "outline-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {loading ? (
        <span className={`material-symbols-outlined motion-safe:animate-spin ${iconSizes[size]}`} aria-hidden="true">
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
  );
}
