import { Slider } from "@core/components/ui/Slider";
import { Button } from "@core/components/ui/Button";
import { RadioGroup, RadioOption, Switch } from "@core/components/ui";
import { useId } from "react";
import type { FilterState } from "../types";
import { LICENSE_OPTIONS, FORMAT_OPTIONS } from "../types";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
  onReset: () => void;
}

const PRICE_MAX = 100_000;

const DATE_OPTIONS = [
  { value: "oricand", label: "Oricând" },
  { value: "24h", label: "Ultimele 24 ore" },
  { value: "saptamana", label: "Ultima săptămână" },
] as const;

function formatRON(v: number) {
  return v >= PRICE_MAX ? `${PRICE_MAX.toLocaleString("ro-RO")}+ RON` : `${v.toLocaleString("ro-RO")} RON`;
}

/** "Toate" is the empty value; a radio needs a value of its own, so the group reads it as "all". */
const ALL = "all";

interface FilterRadiosProps {
  title: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onValueChange: (value: string) => void;
}

function FilterRadios({ title, name, options, value, onValueChange }: FilterRadiosProps) {
  const titleId = useId();
  return (
    <div className="space-y-3">
      <h3 id={titleId} className="text-xs font-bold uppercase tracking-widest text-outline">
        {title}
      </h3>
      <RadioGroup
        name={name}
        aria-labelledby={titleId}
        value={value || ALL}
        onValueChange={(next) => onValueChange(next === ALL ? "" : String(next))}
        className="space-y-2"
      >
        {options.map((option) => (
          <RadioOption
            key={option.value}
            value={option.value || ALL}
            labelClassName="group"
            label={
              <span className="text-sm font-medium text-on-surface-variant transition-colors group-hover:text-on-surface">
                {option.label}
              </span>
            }
          />
        ))}
      </RadioGroup>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const priceRange: [number, number] = [filters.pret_min ?? 0, filters.pret_max ?? PRICE_MAX];

  function handlePriceChange([min, max]: [number, number]) {
    onChange("pret_min", min === 0 ? null : min);
    onChange("pret_max", max === PRICE_MAX ? null : max);
  }

  return (
    <aside className="w-72 flex-shrink-0 hidden md:block">
      <div className="sticky top-28 space-y-8">
        {/* Tip Licență */}
        <FilterRadios
          title="Tip Licență"
          name="licenta"
          options={LICENSE_OPTIONS}
          value={filters.licenta}
          onValueChange={(value) => onChange("licenta", value || null)}
        />

        {/* Format Fișier */}
        <FilterRadios
          title="Format Fișier"
          name="format"
          options={FORMAT_OPTIONS}
          value={filters.format}
          onValueChange={(value) => onChange("format", value || null)}
        />

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
        <FilterRadios
          title="Data Publicării"
          name="data"
          options={DATE_OPTIONS}
          value={filters.data}
          onValueChange={(value) => onChange("data", value)}
        />

        {/* Autor verificat */}
        <div className="pt-6 border-t border-surface-container-high">
          <Switch
            label={<span className="text-sm font-bold text-on-surface">Autor Verificat</span>}
            labelFirst
            tone="tertiary"
            checked={filters.verificat}
            onCheckedChange={(checked) => onChange("verificat", checked)}
          />
        </div>

        {/* Reset */}
        <Button variant="secondary" className="w-full" onClick={onReset}>
          Resetează Filtre
        </Button>
      </div>
    </aside>
  );
}
