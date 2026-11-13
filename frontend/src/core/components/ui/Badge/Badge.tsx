import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "tertiary" | "error" | "surface";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
  surface: "bg-surface-container-high text-on-surface-variant",
};

export function Badge({ variant = "surface", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex h-6 items-center gap-1 rounded-xl px-2.5 text-label font-semibold",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {icon && (
        <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
