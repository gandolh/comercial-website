/** The filter band's small controls, moved out of ResultsBand.tsx (brief 24): the count badge, the view toggle, the sort. */
import { Select } from "@core/components/ui";
import { cn } from "@core/lib/cn";
import type { FilterState } from "../types";
import { SORT_OPTIONS } from "./filterModel";

export type ViewMode = "grid" | "list";

/**
 * The count of set filters beside Resetează Filtre, and on the phone's Filtre button: the selected state's tint and
 * outline, so nothing in the band but the phone's Filtre is filled red (brief 24).
 */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "inline-grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary-fixed px-1.5 text-label font-semibold text-on-primary-fixed tabular-nums ring-1 ring-primary ring-inset",
        className,
      )}
    >
      {count}
    </span>
  );
}

const toggleButton =
  "grid place-items-center rounded-lg text-on-surface-variant transition-colors hover:text-on-surface";

export function ViewToggle({
  viewMode,
  onChange,
  className,
}: {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
}) {
  const item = (mode: ViewMode, label: string, icon: string) => (
    <button
      type="button"
      aria-pressed={viewMode === mode}
      aria-label={label}
      onClick={() => onChange(mode)}
      className={cn(
        toggleButton,
        "h-8 w-9 aria-pressed:bg-primary-fixed aria-pressed:text-on-primary-fixed aria-pressed:shadow-[inset_0_0_0_1px_var(--color-primary)] max-md:size-11",
      )}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Mod de afișare"
      className={cn(
        "flex gap-0.5 rounded-xl bg-surface-container-low p-1 max-md:rounded-control max-md:p-0.5",
        className,
      )}
    >
      {item("grid", "Vedere grilă", "grid_view")}
      {item("list", "Vedere listă", "view_list")}
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
  className,
}: {
  value: FilterState["sortare"];
  onChange: (v: FilterState["sortare"]) => void;
  className?: string;
}) {
  return (
    <Select
      aria-label="Sortare"
      value={value}
      onChange={(e) => onChange(e.target.value as FilterState["sortare"])}
      options={SORT_OPTIONS}
      className={className}
    />
  );
}
