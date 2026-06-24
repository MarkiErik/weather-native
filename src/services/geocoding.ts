// Vyhľadávanie miest (mesto -> súradnice) cez Open-Meteo geocoding API.
// Oddelené od weather.ts, lebo je to iná zodpovednosť.

export type CityResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string; // kraj/región, na odlíšenie rovnomenných miest
  latitude: number;
  longitude: number;
};

export async function searchCities(query: string): Promise<CityResult[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(query)}&count=10&language=sk&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding zlyhalo: ${response.status}`);
  }

  const data = await response.json();
  // Keď nič nenájde, API vráti objekt BEZ kľúča `results` — preto fallback na [].
  const results = data.results ?? [];

  return results.map((r: any) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
