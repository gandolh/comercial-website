import type { FilterState } from "../types";
import { FORMAT_OPTIONS, LICENSE_OPTIONS } from "../types";

export const PRICE_MAX = 100_000;

export const DATE_OPTIONS = [
  { value: "oricand", label: "Oricând" },
  { value: "24h", label: "Ultimele 24 ore" },
  { value: "saptamana", label: "Ultima săptămână" },
] as const;

export const SORT_OPTIONS = [
  { value: "noi", label: "Cele mai noi" },
  { value: "pret_asc", label: "Preț: Mic la Mare" },
  { value: "pret_desc", label: "Preț: Mare la Mic" },
  { value: "relevanta", label: "Relevanță" },
];

/** The filters a visitor sets, without the sort and the page. */
export type FilterValues = Pick<FilterState, "licenta" | "format" | "pret_min" | "pret_max" | "data" | "verificat">;

export function pickValues(filters: FilterState): FilterValues {
  const { licenta, format, pret_min, pret_max, data, verificat } = filters;
  return { licenta, format, pret_min, pret_max, data, verificat };
}

export const EMPTY_VALUES: FilterValues = {
  licenta: null,
  format: null,
  pret_min: null,
  pret_max: null,
  data: "oricand",
  verificat: false,
};

export function formatRON(v: number) {
  return v >= PRICE_MAX ? `${PRICE_MAX.toLocaleString("ro-RO")}+ RON` : `${v.toLocaleString("ro-RO")} RON`;
}

/** The price range as one line, with the app's own dash. */
export function priceRangeText(min: number | null, max: number | null) {
  return `${formatRON(min ?? 0)} – ${formatRON(max ?? PRICE_MAX)}`;
}

function labelOf(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((o) => o.value === (value ?? ""))?.label ?? value ?? "";
}

export interface ActiveFilter {
  key: string;
  /** The group's name, shown on a phone chip. */
  group: string;
  /** What is chosen, shown on a chip. */
  value: string;
  /** What removing it sets. */
  clear: Partial<FilterState>;
}

/** The filters that are set, in the band's order. */
export function activeFilters(f: FilterValues): ActiveFilter[] {
  const list: ActiveFilter[] = [];
  if (f.licenta) {
    list.push({
      key: "licenta",
      group: "Tip Licență",
      value: labelOf(LICENSE_OPTIONS, f.licenta),
      clear: { licenta: null },
    });
  }
  if (f.format) {
    list.push({
      key: "format",
      group: "Format Fișier",
      value: labelOf(FORMAT_OPTIONS, f.format),
      clear: { format: null },
    });
  }
  if (f.data !== "oricand") {
    list.push({
      key: "data",
      group: "Data Publicării",
      value: labelOf(DATE_OPTIONS, f.data),
      clear: { data: "oricand" },
    });
  }
  if (f.pret_min !== null || f.pret_max !== null) {
    list.push({
      key: "pret",
      group: "Preț (RON)",
      value: priceRangeText(f.pret_min, f.pret_max),
      clear: { pret_min: null, pret_max: null },
    });
  }
  if (f.verificat) {
    list.push({ key: "verificat", group: "Autor Verificat", value: "Autor Verificat", clear: { verificat: false } });
  }
  return list;
}
