import type { ListingCard } from "@/types/listing";

export interface FilterState {
  licenta: string | null;
  format: string | null;
  pret_min: number | null;
  pret_max: number | null;
  data: "24h" | "saptamana" | "oricand";
  verificat: boolean;
  sortare: "noi" | "pret_asc" | "pret_desc" | "relevanta";
  pagina: number;
}

export interface ListingsResponse {
  listings: ListingCard[];
  totalCount: number;
  totalPages: number;
}

export const PAGE_SIZE = 12;

export const LICENSE_OPTIONS = [
  { value: "", label: "Toate" },
  { value: "personal", label: "Personală" },
  { value: "commercial", label: "Comercială" },
  { value: "extended", label: "Extinsă" },
];

export const FORMAT_OPTIONS = [
  { value: "", label: "Toate" },
  { value: "zip", label: "ZIP" },
  { value: "pdf", label: "PDF" },
  { value: "psd", label: "PSD" },
  { value: "mp4", label: "MP4" },
  { value: "wav", label: "WAV" },
  { value: "otf", label: "OTF" },
];

export const CITIES: { slug: string; label: string }[] = [
  { slug: "bucuresti", label: "București" },
  { slug: "cluj-napoca", label: "Cluj-Napoca" },
  { slug: "timisoara", label: "Timișoara" },
  { slug: "iasi", label: "Iași" },
  { slug: "brasov", label: "Brașov" },
  { slug: "constanta", label: "Constanța" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  software: "Software și aplicații",
  grafica: "Grafică și ilustrații",
  sabloane: "Șabloane și teme",
  audio: "Audio și muzică",
  video: "Video și animație",
  ebook: "Cărți electronice",
  fonturi: "Fonturi",
  "cod-sursa": "Cod sursă",
  diverse: "Diverse",
};
