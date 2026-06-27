// Shared Open-Meteo access: one place that knows the host + error handling.
// Callers pass their own query string and the response type they expect.

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchOpenMeteo<T>(query: string): Promise<T> {
  const response = await fetch(`${FORECAST_URL}?${query}`);

  // From most specific to the generic catch-all (a 404 is also `!ok`).
  if (response.status === 404) {
    throw new Error("Open-Meteo nenašlo dáta pre zadané súradnice (404)");
  }
  if (response.status === 204) {
    throw new Error("Open-Meteo vrátilo prázdnu odpoveď (204)");
  }
  if (!response.ok) {
    throw new Error(`Open-Meteo vrátilo chybu: ${response.status}`);
  }

  return (await response.json()) as T;
}
