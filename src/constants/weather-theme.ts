// Vizuálna téma podľa počasia: gradient pozadia + ikona + či je pozadie tmavé.
// Vstup je WMO weather kód (z Open-Meteo) a či je deň.

export type WeatherTheme = {
  /** Farby gradientu zhora nadol (pre expo-linear-gradient). */
  colors: [string, string];
  /** Emoji ikona stavu počasia. */
  icon: string;
  /** Je pozadie tmavé? (autorský zámer — podľa toho tab lišta farbí ikony) */
  isDark: boolean;
};

// V noci ide všetko do tmavomodrej, cez deň farby podľa stavu.
const NIGHT: WeatherTheme["colors"] = ["#0B1026", "#1C2541"];

export function getWeatherTheme(code: number, isDay: boolean): WeatherTheme {
  if (!isDay) {
    return { colors: NIGHT, icon: code <= 2 ? "🌙" : "☁️", isDark: true };
  }
  // Jasno / prevažne jasno
  if (code <= 1) return { colors: ["#2E8BEF", "#7CC4FB"], icon: "☀️", isDark: false };
  // Polojasno
  if (code === 2) return { colors: ["#4A90D9", "#9DBFE0"], icon: "⛅", isDark: false };
  // Zamračené
  if (code === 3) return { colors: ["#5B6B7B", "#9AA7B4"], icon: "☁️", isDark: false };
  // Hmla
  if (code === 45 || code === 48)
    return { colors: ["#6B7785", "#AEB8C2"], icon: "🌫️", isDark: false };
  // Mrholenie / dážď / prehánky (tmavší gradient)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return { colors: ["#3A4A5A", "#6E7E8E"], icon: "🌧️", isDark: true };
  // Sneženie
  if (code >= 71 && code <= 77)
    return { colors: ["#7E8C9E", "#CBD5E1"], icon: "❄️", isDark: false };
  // Búrka (tmavá)
  if (code >= 95) return { colors: ["#2B2B3A", "#4A4A5E"], icon: "⛈️", isDark: true };
  // Fallback
  return { colors: ["#2E8BEF", "#7CC4FB"], icon: "🌡️", isDark: false };
}
