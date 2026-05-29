import type { ListingCard } from "@app/types/listing";

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

export const CATEGORY_LABELS: Record<string, string> = {
  grafica: "Grafică & Ilustrații",
  sabloane: "Șabloane & Template-uri",
  software: "Software & Aplicații",
  "cod-sursa": "Cod Sursă",
  audio: "Audio & Muzică",
  video: "Video & Motion",
  ebook: "E-Bookuri & Cursuri",
  fonturi: "Fonturi",
  documente: "Documente & Template-uri Legale",
  "3d": "Modele 3D & AR",
  mestesugart: "Artizanat Digital",
  invitatii: "Invitații Digitale",
  diverse: "Diverse",
};
