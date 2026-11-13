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
  const look = [
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-control font-semibold transition-colors duration-200",
    selected
      ? "bg-primary-fixed text-on-primary-fixed ring-1 ring-primary ring-inset"
      : "bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant ring-inset hover:bg-surface-container-high",
    className,
  ].join(" ");

  // A removable chip is a label and a remove button side by side: a button never sits inside a button.
  if (onRemove) {
    return (
      <span className={`${look} pr-1.5`}>
        {icon && (
          <span className="material-symbols-outlined leading-none" style={{ fontSize: "18px" }} aria-hidden="true">
            {icon}
          </span>
        )}
        {label}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Elimină ${label}`}
          className="grid size-6 place-items-center rounded-full outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined leading-none" style={{ fontSize: "18px" }} aria-hidden="true">
            close
          </span>
        </button>
      </span>
    );
  }

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
    </button>
  );
}
