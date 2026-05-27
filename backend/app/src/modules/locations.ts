import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { z } from "zod";
import type { RouteRegistrar } from "../context.js";
import { AppError } from "@my-olx/core";

/**
 * City data structure from the JSON file.
 */
interface CityData {
  x: number;
  y: number;
  nume: string;
  judet: string;
  judetAuto: string;
  populatie: number;
  regiune: string;
}

/**
 * Raw JSON structure: counties keyed by name → array of cities.
 */
interface CitiesByCounties {
  [countyName: string]: CityData[];
}

/**
 * Load the cities JSON file at module initialization.
 */
function loadCitiesData(): CitiesByCounties {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const dataPath = join(__dirname, "../data/cities-by-counties.json");

  const raw = readFileSync(dataPath, "utf8");
  return JSON.parse(raw) as CitiesByCounties;
}

const citiesData = loadCitiesData();

/**
 * Normalize Romanian text for loose matching.
 * Simple toLowerCase for case-insensitive ILIKE behavior.
 */
function normalizeText(text: string): string {
  return text.toLowerCase();
}

export const registerLocationsRoutes: RouteRegistrar = (app, _ctx) => {
  // GET /locations/counties — return array of counties
  app.get("/locations/counties", async (request, reply) => {
    const counties = Object.entries(citiesData)
      .map(([countyName, cities]) => {
        // Use first city to get judetAuto and regiune
        const firstCity = cities[0];
        if (!firstCity) {
          return null;
        }

        return {
          name: countyName,
          auto: firstCity.judetAuto,
          region: firstCity.regiune,
        };
      })
      .filter((c) => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return reply.send(counties);
  });

  // GET /locations/cities — query ?q=&county=&limit=
  app.get("/locations/cities", async (request, reply) => {
    const querySchema = z.object({
      q: z.string().optional().default(""),
      county: z.string().optional(),
      limit: z.coerce.number().int().min(1).optional().default(20),
    });

    const queryResult = querySchema.safeParse(request.query);
    if (!queryResult.success) {
      throw AppError.validation("invalid query parameters");
    }

    const { q, county, limit } = queryResult.data;

    // Gather all cities that match filters
    const allCities: Array<{
      name: string;
      county: string;
      county_auto: string;
      region: string;
      lat: number;
      lng: number;
      population: number;
    }> = [];

    for (const [countyName, cities] of Object.entries(citiesData)) {
      // If county filter given, skip non-matching counties
      if (county && countyName !== county) {
        continue;
      }

      for (const city of cities) {
        // If q filter given, check for ILIKE-style match (case-insensitive substring)
        if (q && !normalizeText(city.nume).includes(normalizeText(q))) {
          continue;
        }

        allCities.push({
          name: city.nume,
          county: city.judet,
          county_auto: city.judetAuto,
          region: city.regiune,
          lat: city.y,
          lng: city.x,
          population: city.populatie,
        });
      }
    }

    // Apply limit
    const limited = allCities.slice(0, limit);

    return reply.send(limited);
  });
};
