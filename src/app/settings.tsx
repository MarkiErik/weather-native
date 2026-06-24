import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="gap-8 p-6">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-white">Nastavenia</Text>

        <View className="gap-1">
          <Text className="text-sm uppercase tracking-wide text-neutral-500">Aplikácia</Text>
          <Text className="text-base text-neutral-900 dark:text-white">Weather App</Text>
          <Text className="text-base text-neutral-500">Zdroj dát: Open-Meteo</Text>
        </View>

        <Text className="text-sm text-neutral-400">Verzia 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}
