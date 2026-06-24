import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUnits } from "@/contexts/units";

const UNITS = [
  { value: "C", label: "°C" },
  { value: "F", label: "°F" },
] as const;

export default function SettingsScreen() {
  const { unit, setUnit } = useUnits();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="gap-8 p-6">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-white">Nastavenia</Text>

        <View className="gap-2">
          <Text className="text-sm uppercase tracking-wide text-neutral-500">Jednotka teploty</Text>
          {/* Jednoduchý segmentový prepínač z dvoch Pressable tlačidiel */}
          <View className="flex-row gap-2">
            {UNITS.map((option) => {
              const active = unit === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setUnit(option.value)}
                  className={`rounded-xl px-5 py-3 ${
                    active ? "bg-sky-500" : "bg-neutral-100 dark:bg-neutral-900"
                  }`}>
                  <Text
                    className={`text-base font-semibold ${
                      active ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                    }`}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-sm uppercase tracking-wide text-neutral-500">Aplikácia</Text>
          <Text className="text-base text-neutral-900 dark:text-white">Weather App</Text>
          <Text className="text-base text-neutral-500">Zdroj dát: Open-Meteo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
