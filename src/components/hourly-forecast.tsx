import { ScrollView, Text, View } from "react-native";

import { getWeatherTheme } from "@/constants/weather-theme";
import type { HourForecast } from "@/services/weather";

// Horizontal strip of the next 24 hours: time, icon, precip %, temperature.

type Props = {
  hours: HourForecast[];
  unit: "C" | "F";
  convertTemp: (celsius: number) => number;
};

// "2026-06-27T16:00" -> "16:00"
function formatHour(iso: string): string {
  return iso.slice(11, 16);
}

export function HourlyForecast({ hours, unit, convertTemp }: Props) {
  return (
    <View className="mt-6 w-full">
      <Text className="mb-2 px-1 text-sm font-semibold text-white/80">Hodinová predpoveď</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
        {hours.map((h, i) => (
          <View key={h.time} className="w-16 items-center rounded-2xl bg-white/10 py-3">
            <Text className="text-xs text-white/70">{i === 0 ? "Teraz" : formatHour(h.time)}</Text>
            <Text className="my-1 text-2xl">{getWeatherTheme(h.code, h.isDay).icon}</Text>
            {/* Keep a fixed slot so temperatures stay aligned even with no precip. */}
            <Text
              className={
                h.precipitationProbability > 0
                  ? "text-[10px] text-sky-200"
                  : "text-[10px] text-transparent"
              }>
              {h.precipitationProbability}%
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-white">
              {convertTemp(h.temperature)}°{unit}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
