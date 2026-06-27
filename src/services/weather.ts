// Jediné miesto v appke, ktoré vie o konkrétnom API (Open-Meteo).
// Zvyšok appky pozná len typ `Weather` a funkciu `fetchWeather`.
// Keď neskôr vymeníš API, meníš len tento súbor.

import { fetchOpenMeteo } from "@/services/open-meteo";

// One hour of the hourly forecast strip.
export type HourForecast = {
  time: string; // local ISO, e.g. "2026-06-27T16:00"
  temperature: number; // °C, rounded
  code: number; // WMO code (for the icon)
  isDay: boolean; // day/night icon variant
  precipitationProbability: number; // %
};

export type Weather = {
  city: string;
  temperature: number;
  description: string;
  code: number;
  isDay: boolean;
  humidity: number; // %
  windSpeed: number; // km/h
  windGusts: number; // km/h
  windDirection: number; // degrees, meteorological (direction the wind blows FROM)
  uvIndex: number; // current hour
  precipitationProbability: number; // current hour, %
  hourly: HourForecast[]; // next 24 hours
};

// WMO weather codes -> slovenský popis. Open-Meteo vracia počasie ako číselný kód.
// Plná tabuľka: https://open-meteo.com/en/docs (sekcia "Weather variable documentation")
const WEATHER_CODES: Record<number, string> = {
  0: "Jasno",
  1: "Prevažne jasno",
  2: "Polojasno",
  3: "Zamračené",
  45: "Hmla",
  48: "Námrazová hmla",
  51: "Slabé mrholenie",
  53: "Mrholenie",
  55: "Husté mrholenie",
  61: "Slabý dážď",
  63: "Dážď",
  65: "Silný dážď",
  71: "Slabé sneženie",
  73: "Sneženie",
  75: "Silné sneženie",
  80: "Prehánky",
  81: "Silné prehánky",
  82: "Prudké prehánky",
  95: "Búrka",
  96: "Búrka s krúpami",
  99: "Silná búrka s krúpami",
};

function describeWeatherCode(code: number): string {
  return WEATHER_CODES[code] ?? "Neznáme";
}

// Shape of the Open-Meteo forecast response — only the fields we request.
type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    is_day: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    // Open-Meteo returns null for hours beyond model range.
    precipitation_probability: (number | null)[];
    uv_index: (number | null)[];
  };
};

export async function fetchWeather(
  latitude: number,
  longitude: number,
  city: string,
): Promise<Weather> {
  const query =
    `latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,weather_code,is_day,precipitation_probability,uv_index` +
    `&forecast_days=2&timezone=auto`;

  const data = await fetchOpenMeteo<ForecastResponse>(query);

  // Hourly arrays start at 00:00 today. Take the first hour at/after "now" so the
  // current UV / precipitation and the hourly strip both start from the present —
  // findIndex (not exact indexOf) tolerates DST / formatting edge cases.
  const currentHour = `${data.current.time.slice(0, 13)}:00`;
  const match = data.hourly.time.findIndex((t) => t >= currentHour);
  const startIndex = match === -1 ? 0 : match;

  const hourly: HourForecast[] = data.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time, i) => {
      const idx = startIndex + i;
      return {
        time,
        temperature: Math.round(data.hourly.temperature_2m[idx]),
        code: data.hourly.weather_code[idx],
        isDay: data.hourly.is_day[idx] === 1,
        precipitationProbability: data.hourly.precipitation_probability[idx] ?? 0,
      };
    });

  return {
    city,
    temperature: Math.round(data.current.temperature_2m),
    description: describeWeatherCode(data.current.weather_code),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windGusts: Math.round(data.current.wind_gusts_10m),
    windDirection: data.current.wind_direction_10m,
    uvIndex: Math.round(data.hourly.uv_index[startIndex] ?? 0),
    precipitationProbability: data.hourly.precipitation_probability[startIndex] ?? 0,
    hourly,
  };
}
