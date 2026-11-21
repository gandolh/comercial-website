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

// The Roman identity (brief 21): `primary` is the one filled red action per screen, on its own fill (white on it in
// dark); `secondary` is the tonal porphyry tint, never gold.
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action-fill text-on-action-fill hover:bg-action-fill-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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
        "inline-flex items-center justify-center rounded-control font-bold tracking-wide transition-colors duration-200 active:brightness-90",
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
