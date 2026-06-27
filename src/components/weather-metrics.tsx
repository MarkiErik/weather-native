import { Text, View } from "react-native";

import { compass8 } from "@/utils/compass";
import { downwindBearing } from "@/utils/geo";

// Compact metric tiles shown under the main temperature: wind, UV, humidity, precip.

type Props = {
  windSpeed: number; // km/h
  windGusts: number; // km/h
  windDirection: number; // degrees, meteorological (FROM)
  uvIndex: number;
  humidity: number; // %
  precipitationProbability: number; // %
};

function uvLabel(uv: number): string {
  if (uv <= 2) return "Nízky";
  if (uv <= 5) return "Stredný";
  if (uv <= 7) return "Vysoký";
  if (uv <= 10) return "Veľmi vysoký";
  return "Extrémny";
}

const tile = "w-[48%] rounded-2xl bg-white/10 px-4 py-3";
const title = "text-xs text-white/70";
const value = "mt-1 text-2xl font-semibold text-white";
const sub = "text-xs text-white/60";

export function WeatherMetrics({
  windSpeed,
  windGusts,
  windDirection,
  uvIndex,
  humidity,
  precipitationProbability,
}: Props) {
  return (
    <View className="mt-8 w-full flex-row flex-wrap justify-between gap-y-3">
      {/* Wind: speed + arrow pointing the way the wind blows (FROM + 180°) */}
      <View className={tile}>
        <Text className={title}>💨 Vietor</Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Text className="text-2xl font-semibold text-white">{windSpeed}</Text>
          <Text className="text-sm text-white/80">km/h</Text>
          <Text
            style={{ transform: [{ rotate: `${downwindBearing(windDirection)}deg` }] }}
            className="text-base text-white/90">
            ↑
          </Text>
        </View>
        <Text className={sub}>
          {compass8(windDirection)} · náraz {windGusts}
        </Text>
      </View>

      {/* UV index */}
      <View className={tile}>
        <Text className={title}>☀️ UV index</Text>
        <Text className={value}>{uvIndex}</Text>
        <Text className={sub}>{uvLabel(uvIndex)}</Text>
      </View>

      {/* Humidity */}
      <View className={tile}>
        <Text className={title}>💧 Vlhkosť</Text>
        <Text className={value}>{humidity} %</Text>
        <Text className={sub}>relatívna</Text>
      </View>

      {/* Precipitation probability */}
      <View className={tile}>
        <Text className={title}>🌧️ Zrážky</Text>
        <Text className={value}>{precipitationProbability} %</Text>
        <Text className={sub}>pravdepodobnosť</Text>
      </View>
    </View>
  );
}
