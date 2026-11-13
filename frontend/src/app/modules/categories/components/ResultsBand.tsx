import { useId, useState, type ReactNode } from "react";
import { Button, Chip, RadioGroup, Radio, Select, Sheet, Switch } from "@core/components/ui";
import { Slider } from "@core/components/ui/Slider";
import { cn } from "@core/lib/cn";
import type { FilterState } from "../types";
import { FORMAT_OPTIONS, LICENSE_OPTIONS } from "../types";
import {
  DATE_OPTIONS,
  EMPTY_VALUES,
  PRICE_MAX,
  SORT_OPTIONS,
  activeFilters,
  formatRON,
  pickValues,
  priceRangeText,
  type FilterValues,
} from "./filterModel";

type ViewMode = "grid" | "list";

/** "Toate" is the empty value; a radio needs a value of its own, so the group reads it as "all". */
const ALL = "all";

const segmentClass =
  "flex h-8 items-center rounded-lg px-3 text-control whitespace-nowrap text-on-surface-variant transition-colors hover:text-on-surface focus-visible:ring-inset data-checked:bg-primary-fixed data-checked:font-semibold data-checked:text-on-primary-fixed data-checked:shadow-[inset_0_0_0_1px_var(--color-primary)]";

const wrapChipClass =
  "flex h-11 items-center rounded-full border border-outline-variant bg-surface-container-low px-3.5 text-control text-on-surface-variant data-checked:border-primary data-checked:bg-primary-fixed data-checked:font-semibold data-checked:text-on-primary-fixed";

interface OptionGroupProps {
  title: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string | null;
  onValueChange: (value: string) => void;
  /** "segments" in the band, "chips" in the phone sheet. */
  look: "segments" | "chips";
}

/** One filter group: one option is always chosen, and the arrow keys try each (base-ui rule 16). */
function OptionGroup({ title, name, options, value, onValueChange, look }: OptionGroupProps) {
  const titleId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={titleId} className="text-control text-on-surface-variant">
        {title}
      </span>
      <RadioGroup
        name={name}
        aria-labelledby={titleId}
        value={value || ALL}
        onValueChange={(next) => onValueChange(next === ALL ? "" : String(next))}
        className={cn(
          look === "segments"
            ? "inline-flex flex-wrap gap-0.5 rounded-xl bg-surface-container-low p-1"
            : "flex flex-wrap gap-2",
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value || ALL}
            className={look === "segments" ? segmentClass : wrapChipClass}
          >
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}

interface FieldsProps {
  values: FilterValues;
  onChange: (patch: Partial<FilterState>) => void;
  look: "segments" | "chips";
}

/** The five groups, in the band's order, for the band and the sheet alike. */
function FilterFields({ values, onChange, look }: FieldsProps) {
  const priceRange: [number, number] = [values.pret_min ?? 0, values.pret_max ?? PRICE_MAX];
  const inline = look === "segments";
  return (
    <>
      <OptionGroup
        title="Tip Licență"
        name={`licenta-${look}`}
        options={LICENSE_OPTIONS}
        value={values.licenta}
        onValueChange={(v) => onChange({ licenta: v || null })}
        look={look}
      />
      <OptionGroup
        title="Format Fișier"
        name={`format-${look}`}
        options={FORMAT_OPTIONS}
        value={values.format}
        onValueChange={(v) => onChange({ format: v || null })}
        look={look}
      />
      <OptionGroup
        title="Data Publicării"
        name={`data-${look}`}
        options={DATE_OPTIONS}
        value={values.data}
        onValueChange={(v) => onChange({ data: v as FilterState["data"] })}
        look={look}
      />
      {inline ? null : <PriceAndSwitch values={values} onChange={onChange} priceRange={priceRange} inline={false} />}
    </>
  );
}

interface PriceProps {
  values: FilterValues;
  onChange: (patch: Partial<FilterState>) => void;
  priceRange: [number, number];
  inline: boolean;
}

function PriceAndSwitch({ values, onChange, priceRange, inline }: PriceProps) {
  return (
    <>
      <Slider
        label="Preț (RON)"
        min={0}
        max={PRICE_MAX}
        step={100}
        value={priceRange}
        inline={inline}
        onChange={([min, max]) =>
          onChange({ pret_min: min === 0 ? null : min, pret_max: max === PRICE_MAX ? null : max })
        }
        formatValue={formatRON}
      />
      <Switch
        label={<span className="text-control text-on-surface">Autor Verificat</span>}
        tone="tertiary"
        checked={values.verificat}
        onCheckedChange={(checked) => onChange({ verificat: checked })}
        className="h-10"
      />
    </>
  );
}

/** The result count beside Resetează Filtre, and on the phone's Filtre button. */
function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "inline-grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary px-1.5 text-label font-semibold text-on-primary",
        className,
      )}
    >
      {count}
    </span>
  );
}

const toggleButton =
  "grid place-items-center rounded-lg text-on-surface-variant transition-colors hover:text-on-surface";

function ViewToggle({
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

function SortSelect({
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

interface ResultsBandProps {
  title: ReactNode;
  count: ReactNode;
  filters: FilterState;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Sets the given filters together, and goes back to the first page. */
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}

/**
 * The filter band: the title and count with the view toggle and sort on one line, every option of every group
 * showing, then the price range, Autor Verificat and Resetează Filtre on one row. Removable chips under it show what
 * is set. On a phone the groups move into a sheet behind Filtre, and a rail of chips shows the same values.
 */
export function ResultsBand({
  title,
  count,
  filters,
  viewMode,
  onViewModeChange,
  onChange,
  onReset,
}: ResultsBandProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(() => pickValues(filters));
  const values = pickValues(filters);
  const active = activeFilters(values);
  const priceRange: [number, number] = [values.pret_min ?? 0, values.pret_max ?? PRICE_MAX];

  function openSheet() {
    setDraft(values);
    setSheetOpen(true);
  }

  return (
    <section
      aria-label="Rezultate"
      className="relative z-raised border-b border-outline-variant bg-surface-container-lowest shadow-band"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6">
        <div className="pt-4 md:flex md:items-center md:justify-between md:gap-6 md:pb-3.5">
          <div className="min-w-0 md:flex md:flex-wrap md:items-baseline md:gap-4">
            <h1 className="font-headline font-extrabold tracking-[-0.01em] text-on-surface max-md:text-2xl max-md:leading-[1.875rem] md:text-title">
              {title}
            </h1>
            <p className="mt-0.5 text-body text-on-surface-variant md:mt-0 md:text-control">{count}</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
            <SortSelect value={filters.sortare} onChange={(v) => onChange({ sortare: v })} className="h-10 w-50" />
          </div>
        </div>

        <form
          aria-label="Filtre"
          onSubmit={(e) => e.preventDefault()}
          className="hidden flex-wrap items-end gap-x-7 gap-y-3.5 border-t border-outline-variant pt-3.5 pb-4 md:flex"
        >
          <FilterFields values={values} onChange={onChange} look="segments" />
          <div className="flex basis-full flex-wrap items-center gap-x-7 gap-y-3">
            <PriceAndSwitch values={values} onChange={onChange} priceRange={priceRange} inline />
            <button
              type="button"
              onClick={onReset}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-control px-3.5 text-control font-semibold whitespace-nowrap text-primary underline underline-offset-3"
            >
              Resetează Filtre
              <CountBadge count={active.length} />
            </button>
          </div>
        </form>

        {active.length > 0 && (
          <ul aria-label="Filtre active" className="hidden flex-wrap gap-2 pb-3.5 md:flex">
            {active.map((f) => (
              <li key={f.key} className="list-none">
                <Chip selected label={f.value} onRemove={() => onChange(f.clear)} aria-pressed={undefined} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3.5 flex items-center gap-2 md:hidden">
          <Button onClick={openSheet} iconLeft="tune" className="relative flex-none px-3.5">
            Filtre
            <CountBadge
              count={active.length}
              className="absolute -top-2 -right-2 ring-2 ring-surface-container-lowest"
            />
          </Button>
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} className="flex-none" />
          <SortSelect
            value={filters.sortare}
            onChange={(v) => onChange({ sortare: v })}
            className="min-w-0 flex-1 pr-7 pl-2.5"
          />
        </div>

        <ul
          aria-label="Filtre active"
          className="-mx-4 mt-3.5 flex gap-2.5 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-32px),transparent)] px-4 pb-4 md:hidden [&::-webkit-scrollbar]:hidden"
        >
          {(
            [
              ["Tip Licență", values.licenta ? activeFilters(values).find((a) => a.key === "licenta")?.value : "Toate"],
              ["Format Fișier", values.format ? activeFilters(values).find((a) => a.key === "format")?.value : "Toate"],
              [
                "Data Publicării",
                values.data !== "oricand" ? activeFilters(values).find((a) => a.key === "data")?.value : "Oricând",
              ],
              [
                "Preț (RON)",
                values.pret_min !== null || values.pret_max !== null
                  ? priceRangeText(values.pret_min, values.pret_max)
                  : `0 – ${PRICE_MAX.toLocaleString("ro-RO")}+`,
              ],
            ] as const
          ).map(([group, value]) => (
            <li key={group} className="list-none">
              <button
                type="button"
                onClick={openSheet}
                className="flex h-11 flex-none flex-col justify-center rounded-3xl border border-outline-variant bg-surface-container-low px-3.5 py-1 text-left whitespace-nowrap"
              >
                <span className="text-label text-on-surface-variant">{group}</span>
                <b className="text-control font-semibold text-on-surface">{value}</b>
              </button>
            </li>
          ))}
          <li className="list-none">
            <button
              type="button"
              onClick={openSheet}
              className={cn(
                "flex h-11 flex-none items-center rounded-3xl border px-3.5 text-control whitespace-nowrap",
                values.verificat
                  ? "border-primary bg-primary-fixed font-semibold text-on-primary-fixed"
                  : "border-outline-variant bg-surface-container-low text-on-surface-variant",
              )}
            >
              Autor Verificat
            </button>
          </li>
        </ul>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtre"
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setDraft(EMPTY_VALUES)}>
              Resetează Filtre
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onChange(draft);
                setSheetOpen(false);
              }}
            >
              Aplică filtrele
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5 pt-2">
          <FilterFields values={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} look="chips" />
        </div>
      </Sheet>
    </section>
  );
}
