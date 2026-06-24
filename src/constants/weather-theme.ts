// Vizuálna téma podľa počasia: gradient pozadia + ikona.
// Vstup je WMO weather kód (z Open-Meteo) a či je deň.
// Vďaka tomuto súboru sa obloha mení podľa počasia a dennej doby.

export type WeatherTheme = {
  /** Farby gradientu zhora nadol (pre expo-linear-gradient). */
  colors: [string, string];
  /** Emoji ikona stavu počasia. */
  icon: string;
};

// V noci ide všetko do tmavomodrej, cez deň farby podľa stavu.
const NIGHT: WeatherTheme["colors"] = ["#0B1026", "#1C2541"];

export function getWeatherTheme(code: number, isDay: boolean): WeatherTheme {
  if (!isDay) {
    return { colors: NIGHT, icon: code <= 2 ? "🌙" : "☁️" };
  }

  // Jasno / prevažne jasno
  if (code <= 1) return { colors: ["#2E8BEF", "#7CC4FB"], icon: "☀️" };
  // Polojasno
  if (code === 2) return { colors: ["#4A90D9", "#9DBFE0"], icon: "⛅" };
  // Zamračené
  if (code === 3) return { colors: ["#5B6B7B", "#9AA7B4"], icon: "☁️" };
  // Hmla
  if (code === 45 || code === 48) return { colors: ["#6B7785", "#AEB8C2"], icon: "🌫️" };
  // Mrholenie / dážď / prehánky
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return { colors: ["#3A4A5A", "#6E7E8E"], icon: "🌧️" };
  // Sneženie
  if (code >= 71 && code <= 77) return { colors: ["#7E8C9E", "#CBD5E1"], icon: "❄️" };
  // Búrka
  if (code >= 95) return { colors: ["#2B2B3A", "#4A4A5E"], icon: "⛈️" };

  // Fallback
  return { colors: ["#2E8BEF", "#7CC4FB"], icon: "🌡️" };
}
