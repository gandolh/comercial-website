import type { ButtonHTMLAttributes } from "react";

type ChipVariant = "filter" | "input" | "suggestion";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  selected?: boolean;
  onRemove?: () => void;
  icon?: string;
  label: string;
}

export function Chip({
  variant: _variant,
  selected = false,
  onRemove,
  icon,
  label,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={[
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-control font-semibold transition-colors duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "bg-primary-fixed text-on-primary-fixed ring-1 ring-primary ring-inset"
          : "bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant ring-inset hover:bg-surface-container-high",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && (
        <span className="material-symbols-outlined leading-none" style={{ fontSize: "18px" }} aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Elimină ${label}`}
          className="ml-0.5 rounded-full transition-opacity hover:opacity-70"
        >
          <span className="material-symbols-outlined leading-none" style={{ fontSize: "18px" }} aria-hidden="true">
            close
          </span>
        </button>
      )}
    </button>
  );
}
