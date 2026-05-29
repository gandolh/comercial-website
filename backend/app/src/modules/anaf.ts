import type { RouteRegistrar } from "../context.js";
import { AppError } from "@my-olx/core";

// ─── Types ───────────────────────────────────────────────────────────────────

/** The normalised company data returned to callers. */
export interface CompanyData {
  cui: number;
  denumire: string;
  adresa: string;
  nrRegCom: string;
  scpTVA: boolean;
  stare: string;
}

/** Shape of a single entry in the ANAF v9 response `found` array. */
interface AnafFoundEntry {
  date_generale?: {
    cui?: number;
    denumire?: string;
    adresa?: string;
    nrRegCom?: string;
  };
  inregistrare_scop_Tva?: {
    scpTVA?: boolean;
  };
  stare_inregistrare?: {
    stare?: string;
  };
}

interface AnafApiResponse {
  found?: AnafFoundEntry[];
  notFound?: number[];
}

// ─── In-memory cache ─────────────────────────────────────────────────────────

interface CacheEntry {
  data: CompanyData;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<number, CacheEntry>();

function getCached(cui: number): CompanyData | null {
  const entry = cache.get(cui);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(cui);
    return null;
  }
  return entry.data;
}

function setCached(cui: number, data: CompanyData): void {
  cache.set(cui, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── ANAF fetch helper ───────────────────────────────────────────────────────

const ANAF_URL =
  "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva";
const FETCH_TIMEOUT_MS = 8_000;

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function fetchFromAnaf(cui: number): Promise<AnafApiResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(ANAF_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ cui, data: todayString() }]),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new AppError(
        502,
        `ANAF API returned HTTP ${res.status}`,
      );
    }

    return (await res.json()) as AnafApiResponse;
  } catch (err) {
    if (err instanceof AppError) throw err;
    // AbortError or network error
    throw new AppError(502, "ANAF API unreachable", err);
  } finally {
    clearTimeout(timer);
  }
}

// ─── CUI validation ───────────────────────────────────────────────────────────

/**
 * Normalises a CUI string: strips optional "RO" prefix, validates digits.
 * Returns the numeric CUI, or throws AppError 422 on invalid input.
 */
function parseCui(raw: string): number {
  const trimmed = raw.trim().toUpperCase();
  const digits = trimmed.startsWith("RO") ? trimmed.slice(2) : trimmed;

  if (!/^\d{2,10}$/.test(digits)) {
    throw AppError.validation(
      "CUI invalid — trebuie să fie un număr de 2–10 cifre, opțional precedat de 'RO'",
    );
  }

  return parseInt(digits, 10);
}

// ─── Route registrar ─────────────────────────────────────────────────────────

export const registerAnafRoutes: RouteRegistrar = (app, _ctx) => {
  /**
   * GET /anaf/company/:cui
   *
   * Look up a Romanian company by CUI/CIF via the ANAF public VAT API.
   * Responses are cached in memory for 1 hour.
   *
   * Returns 200 + CompanyData, 404 if unknown CUI, 422 if invalid CUI,
   * 502 if ANAF is unreachable.
   */
  app.get("/anaf/company/:cui", async (request, reply) => {
    const { cui: rawCui } = request.params as { cui: string };

    // Validate / normalise
    const cui = parseCui(rawCui);

    // Cache hit
    const cached = getCached(cui);
    if (cached) {
      return reply.send(cached);
    }

    // Proxy to ANAF
    const apiResp = await fetchFromAnaf(cui);

    // "notFound" array contains CUIs ANAF doesn't know about
    if (
      Array.isArray(apiResp.notFound) &&
      apiResp.notFound.includes(cui)
    ) {
      throw AppError.notFound();
    }

    const entry = apiResp.found?.[0];
    if (!entry) {
      throw AppError.notFound();
    }

    const dg = entry.date_generale ?? {};
    const tva = entry.inregistrare_scop_Tva ?? {};
    const stare = entry.stare_inregistrare ?? {};

    const company: CompanyData = {
      cui: dg.cui ?? cui,
      denumire: dg.denumire ?? "",
      adresa: dg.adresa ?? "",
      nrRegCom: dg.nrRegCom ?? "",
      scpTVA: tva.scpTVA ?? false,
      stare: stare.stare ?? "",
    };

    setCached(cui, company);
    return reply.send(company);
  });
};
