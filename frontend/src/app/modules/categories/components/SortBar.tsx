import { Select } from "@core/components/ui";
import type { FilterState } from "../types";

type ViewMode = "grid" | "list";

interface SortBarProps {
  sortare: FilterState["sortare"];
  viewMode: ViewMode;
  onSortChange: (value: FilterState["sortare"]) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const SORT_OPTIONS = [
  { value: "noi", label: "Cele mai noi" },
  { value: "pret_asc", label: "Preț: Mic la Mare" },
  { value: "pret_desc", label: "Preț: Mare la Mic" },
  { value: "relevanta", label: "Relevanță" },
];

export function SortBar({ sortare, viewMode, onSortChange, onViewModeChange }: SortBarProps) {
  return (
    <div className="flex w-full items-center gap-4 md:w-auto">
      <div className="flex rounded-xl bg-surface-container-low p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-surface-container-lowest shadow-sm" : "hover:bg-surface-container-high"}`}
          aria-label="Vedere grilă"
        >
          <span
            className={`material-symbols-outlined text-xl ${viewMode === "grid" ? "text-primary" : "text-outline"}`}
            aria-hidden="true"
          >
            grid_view
          </span>
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-surface-container-lowest shadow-sm" : "hover:bg-surface-container-high"}`}
          aria-label="Vedere listă"
        >
          <span
            className={`material-symbols-outlined text-xl ${viewMode === "list" ? "text-primary" : "text-outline"}`}
            aria-hidden="true"
          >
            view_list
          </span>
        </button>
      </div>

      <Select
        value={sortare}
        onChange={(e) => onSortChange(e.target.value as FilterState["sortare"])}
        options={SORT_OPTIONS}
        className="min-w-[180px]"
      />
    </div>
  );
}
