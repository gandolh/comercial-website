import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import type { FilterState } from "../types";
import { LICENSE_OPTIONS, FORMAT_OPTIONS } from "../types";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (
    key: keyof FilterState,
    value: FilterState[keyof FilterState],
  ) => void;
  onReset: () => void;
}

const PRICE_MAX = 100_000;

const DATE_OPTIONS = [
  { value: "oricand", label: "Oricând" },
  { value: "24h", label: "Ultimele 24 ore" },
  { value: "saptamana", label: "Ultima săptămână" },
] as const;

function formatRON(v: number) {
  return v >= PRICE_MAX
    ? `${PRICE_MAX.toLocaleString("ro-RO")}+ RON`
    : `${v.toLocaleString("ro-RO")} RON`;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: FilterSidebarProps) {
  const priceRange: [number, number] = [
    filters.pret_min ?? 0,
    filters.pret_max ?? PRICE_MAX,
  ];

  function handlePriceChange([min, max]: [number, number]) {
    onChange("pret_min", min === 0 ? null : min);
    onChange("pret_max", max === PRICE_MAX ? null : max);
  }

  return (
    <aside className="w-72 flex-shrink-0 hidden md:block">
      <div className="sticky top-28 space-y-8">
        {/* Tip Licență */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
            Tip Licență
          </h3>
          <div className="space-y-2">
            {LICENSE_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="licenta"
                  checked={filters.licenta === value}
                  onChange={() => onChange("licenta", value || null)}
                  className="w-4 h-4 text-primary focus:ring-0 border-outline-variant accent-primary"
                />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Format Fișier */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
            Format Fișier
          </h3>
          <div className="space-y-2">
            {FORMAT_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="format"
                  checked={filters.format === value}
                  onChange={() => onChange("format", value || null)}
                  className="w-4 h-4 text-primary focus:ring-0 border-outline-variant accent-primary"
                />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preț */}
        <Slider
          label="Preț (RON)"
          min={0}
          max={PRICE_MAX}
          step={100}
          value={priceRange}
          onChange={handlePriceChange}
          formatValue={formatRON}
        />

        {/* Data publicării */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
            Data Publicării
          </h3>
          <div className="space-y-2">
            {DATE_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="data"
                  checked={filters.data === value}
                  onChange={() => onChange("data", value)}
                  className="w-4 h-4 text-primary focus:ring-0 border-outline-variant accent-primary"
                />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Autor verificat */}
        <div className="pt-6 border-t border-surface-container-high">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-bold text-on-surface">
              Autor Verificat
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.verificat}
                onChange={(e) => onChange("verificat", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-tertiary-container peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </div>
          </label>
        </div>

        {/* Reset */}
        <Button variant="secondary" className="w-full" onClick={onReset}>
          Resetează Filtre
        </Button>
      </div>
    </aside>
  );
}
