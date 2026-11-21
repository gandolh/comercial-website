import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "tertiary" | "error" | "surface" | "verified";

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
  // Verificat and Vânzător verificat (brief 21): porphyry, a gold check, a 1px gold inset ring. The laurel marks the
  // brand only, never a seller.
  verified: "rounded-sm bg-nav-band text-on-nav-band ring-1 ring-on-nav-band-variant ring-inset shadow-card",
};

const iconClasses: Partial<Record<BadgeVariant, string>> = { verified: "text-on-nav-band-variant" };

export function Badge({ variant = "surface", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex h-6 items-center gap-1 px-2.5 text-label font-semibold",
        variant === "verified" ? "" : "rounded-xl",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {icon && (
        <span
          className={`material-symbols-outlined text-base leading-none ${iconClasses[variant] ?? ""}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
