// Upwind weather sampling: given a city and the current wind, we generate a fan of
// coordinates UPWIND (the direction the weather is coming from), fetch their current
// weather in a single bulk Open-Meteo request, and report what might be approaching.
// No city dataset / no map — just generated points + their weather.

import { fetchOpenMeteo } from "@/services/open-meteo";
import { destinationPoint, toRad } from "@/utils/geo";

// A generated coordinate (before weather is attached).
export type UpwindSample = {
  lat: number;
  lon: number;
  bearing: number; // degrees from the city toward this point
  distanceKm: number;
  dxKm: number; // east offset from the city (+E)
  dyKm: number; // north offset from the city (+N)
};

// A sampled point with its current weather.
export type UpwindPoint = UpwindSample & {
  code: number; // WMO weather code
  temperature: number; // °C, rounded
  precipitation: number; // mm (current)
  isDay: boolean;
};

export type Arrival = { distanceKm: number; bearing: number; etaMin: number | null };

export type UpwindField = {
  points: UpwindPoint[];
  calm: boolean; // wind too weak to imply movement (points still shown, just no flow/ETA)
  arrival: Arrival | null; // nearest sampled point with precipitation; etaMin null when calm
};

// Open-Meteo bulk response: one entry per coordinate.
type BulkCurrent = {
  current: {
    temperature_2m: number;
    weather_code: number;
    precipitation: number;
    is_day: number;
  };
};

// Below this wind speed the "weather drifts toward you" model is meaningless.
const CALM_KMH = 3;
// Upwind sampling fan: distances (km) × angular offsets (deg) around the wind source.
const DISTANCES_KM = [15, 30, 45];
const ANGLE_OFFSETS = [-30, 0, 30];
// A point counts as "wet" from this WMO code up (drizzle and worse).
const WET_CODE = 51;

// Single source of truth for "is this point raining" — used by both the arrival
// detection and the panel styling so they can never disagree.
export function isWet(p: { precipitation: number; code: number }): boolean {
  return p.precipitation > 0 || p.code >= WET_CODE;
}

// Build the fan of upwind coordinates. windDirection already points at the source.
export function buildUpwindSamples(
  lat: number,
  lon: number,
  windDirection: number,
): UpwindSample[] {
  return DISTANCES_KM.flatMap((distanceKm) =>
    ANGLE_OFFSETS.map((offset) => {
      const bearing = (windDirection + offset + 360) % 360;
      const { lat: pLat, lon: pLon } = destinationPoint(lat, lon, bearing, distanceKm);
      return {
        lat: pLat,
        lon: pLon,
        bearing,
        distanceKm,
        dxKm: distanceKm * Math.sin(toRad(bearing)),
        dyKm: distanceKm * Math.cos(toRad(bearing)),
      };
    }),
  );
}

// Nearest sampled point that currently has precipitation, with a rough ETA.
export function findArrival(
  points: UpwindPoint[],
  windSpeed: number,
  calm: boolean,
): Arrival | null {
  const nearestWet = points.filter(isWet).sort((a, b) => a.distanceKm - b.distanceKm)[0];
  if (!nearestWet) return null;
  return {
    distanceKm: nearestWet.distanceKm,
    bearing: nearestWet.bearing,
    etaMin: calm ? null : Math.round((nearestWet.distanceKm / windSpeed) * 60),
  };
}

export async function fetchUpwindField(
  lat: number,
  lon: number,
  windDirection: number, // degrees the wind blows FROM = direction of the weather source
  windSpeed: number, // km/h
): Promise<UpwindField> {
  // We always sample and show the surrounding points; `calm` only tells the UI to
  // skip the wind-flow animation and the arrival ETA (nothing is meaningfully moving).
  const calm = windSpeed < CALM_KMH;
  const samples = buildUpwindSamples(lat, lon, windDirection);

  // One bulk request: comma-separated coordinates -> array of results (same order).
  const query =
    `latitude=${samples.map((s) => s.lat.toFixed(4)).join(",")}` +
    `&longitude=${samples.map((s) => s.lon.toFixed(4)).join(",")}` +
    `&current=temperature_2m,weather_code,precipitation,is_day&timezone=auto`;

  const data = await fetchOpenMeteo<BulkCurrent[] | BulkCurrent>(query);
  const results = Array.isArray(data) ? data : [data];

  const points: UpwindPoint[] = samples.map((sample, i) => {
    const current = results[i]?.current;
    return {
      ...sample,
      code: current?.weather_code ?? 0,
      temperature: Math.round(current?.temperature_2m ?? 0),
      precipitation: current?.precipitation ?? 0,
      isDay: current?.is_day === 1,
    };
  });

  return { points, calm, arrival: findArrival(points, windSpeed, calm) };
}
