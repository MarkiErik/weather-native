// Jediné miesto v appke, ktoré vie o konkrétnom API (Open-Meteo).
// Zvyšok appky pozná len typ `Weather` a funkciu `fetchWeather`.
// Keď neskôr vymeníš API, meníš len tento súbor.

export type Weather = {
  city: string;
  temperature: number;
  description: string;
  high: number;
  low: number;
  code: number;
  isDay: boolean;
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

export async function fetchWeather(
  latitude: number,
  longitude: number,
  city: string,
): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code,is_day` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto`;

  const response = await fetch(url);
  // Od najkonkrétnejšieho po najvšeobecnejšie — generický catch-all musí byť posledný,
  // inak by prekryl konkrétne stavy (404 má tiež response.ok === false).
  if (response.status === 404) {
    throw new Error(`Open-Meteo nenašlo dáta pre súradnice ${latitude},${longitude} (404)`);
  }
  if (response.status === 204) {
    throw new Error(`Open-Meteo vrátilo prázdnu odpoveď (204)`);
  }
  if (!response.ok) {
    throw new Error(`Open-Meteo vrátilo chybu: ${response.status}`);
  }

  const data = await response.json();
  return {
    city,
    temperature: Math.round(data.current.temperature_2m),
    description: describeWeatherCode(data.current.weather_code),
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
  };
}
