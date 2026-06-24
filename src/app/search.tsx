import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUnits } from "@/contexts/units";
import { searchCities, type CityResult } from "@/services/geocoding";
import { showWeatherNotification } from "@/services/notifications";
import { saveSelectedLocation } from "@/services/storage";
import { fetchWeather } from "@/services/weather";

export default function SearchScreen() {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { unit, convertTemp } = useUnits();

  // Debounce: počkáme 350 ms po poslednom stlačení, až potom hľadáme.
  // Bez toho by sme volali API pri každom písmene. setTimeout v efekte je
  // bežný pattern; cleanup zruší predošlý timer pri ďalšom stlačení.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text.trim()), 350);
    return () => clearTimeout(id);
  }, [text]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["geocode", debounced],
    queryFn: () => searchCities(debounced),
    enabled: debounced.length >= 2, // hľadáme až od 2 znakov
  });

  async function handleSelect(city: CityResult) {
    const location = { latitude: city.latitude, longitude: city.longitude, city: city.name };

    // Uložíme vybrané mesto a invalidujeme dotaz, aby ho obrazovka Počasie znova načítala.
    await saveSelectedLocation(location);
    await queryClient.invalidateQueries({ queryKey: ["selectedLocation"] });

    try {
      // fetchQuery = stiahne počasie a ZÁROVEŇ ho uloží do cache pod kľúč ["weather", mesto].
      // Vďaka tomu ho má obrazovka Počasie hneď (bez druhého fetchu) a my máme info do notifikácie.
      const weather = await queryClient.fetchQuery({
        queryKey: ["weather", location.city],
        queryFn: () => fetchWeather(location.latitude, location.longitude, location.city),
      });
      const temp = `${convertTemp(weather.temperature)}°${unit}`;
      // Local notifikácia v lište telefónu (fire-and-forget, nech neblokuje navigáciu).
      void showWeatherNotification(
        `Mesto nastavené: ${weather.city}`,
        `Aktuálne ${temp} · ${weather.description}`,
      );
    } catch {
      // ak sa počasie nepodarí stiahnuť, notifikáciu nepošleme
    }

    router.navigate("/"); // prepneme späť na Počasie
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="gap-4 p-6">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-white">Hľadať mesto</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Napíš názov mesta…"
          placeholderTextColor="#9CA3AF"
          autoFocus
          className="rounded-xl bg-neutral-100 px-4 py-3 text-base text-neutral-900 dark:bg-neutral-900 dark:text-white"
        />

        {isFetching && <ActivityIndicator />}

        <FlatList
          data={results ?? []}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-neutral-200 dark:bg-neutral-800" />
          )}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelect(item)} className="py-3 active:opacity-60">
              <Text className="text-base text-neutral-900 dark:text-white">{item.name}</Text>
              <Text className="text-sm text-neutral-500">
                {[item.admin1, item.country].filter(Boolean).join(", ")}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            debounced.length >= 2 && !isFetching ? (
              <Text className="text-neutral-500">Žiadne výsledky</Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
