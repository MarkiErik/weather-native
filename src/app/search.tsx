import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppearance } from "@/contexts/appearance";
import { useUnits } from "@/contexts/units";
import { searchCities, type CityResult } from "@/services/geocoding";
import type { DeviceLocation } from "@/services/location";
import { showWeatherNotification } from "@/services/notifications";
import { saveSelectedLocation } from "@/services/storage";
import { fetchWeather } from "@/services/weather";

export default function SearchScreen() {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { unit, convertTemp } = useUnits();
  const scheme = useColorScheme();
  const { setIsDark } = useAppearance();

  // Vlastné svetlé/tmavé pozadie — tab lišta podľa systémovej témy (nie počasia).
  useFocusEffect(
    useCallback(() => {
      setIsDark(scheme === "dark");
    }, [scheme, setIsDark]),
  );

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

  // Stiahne počasie pre vybrané mesto a pošle notifikáciu. Volá sa fire-and-forget
  // z handleSelect (na pozadí), takže neblokuje prechod na obrazovku Počasie.
  async function notifyWeather(location: DeviceLocation) {
    try {
      // Rovnaký kľúč ako obrazovka Počasie → TanStack zlúči do jedného requestu (žiadny dvojitý fetch).
      const weather = await queryClient.fetchQuery({
        queryKey: ["weather", location.latitude, location.longitude],
        queryFn: () => fetchWeather(location.latitude, location.longitude, location.city),
      });
      const temp = `${convertTemp(weather.temperature)}°${unit}`;
      await showWeatherNotification(
        `Mesto nastavené: ${weather.city}`,
        `Aktuálne ${temp} · ${weather.description}`,
      );
    } catch {
      // počasie sa nepodarilo stiahnuť — bez notifikácie
    }
  }

  // Clear the field and keep the cursor in it.
  function handleClear() {
    setText("");
    setDebounced("");
    inputRef.current?.focus();
  }

  async function handleSelect(city: CityResult) {
    const location = { latitude: city.latitude, longitude: city.longitude, city: city.name };

    // Reset the search so it's empty next time the screen opens.
    setText("");
    setDebounced("");
    Keyboard.dismiss();

    // Rýchle lokálne kroky (uloženie + invalidácia), potom OKAMŽITÁ navigácia.
    await saveSelectedLocation(location);
    await queryClient.invalidateQueries({ queryKey: ["selectedLocation"] });
    router.navigate("/");

    // Notifikáciu + prefill necháme bežať na pozadí — neblokujú prechod.
    void notifyWeather(location);
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      {/* Tap outside the input/list dismisses the keyboard — but NOT on web, where the
          click bubbles up from the input and would instantly blur it (focus loss). */}
      <Pressable
        className="flex-1 gap-4 p-6"
        onPress={() => {
          if (Platform.OS !== "web") Keyboard.dismiss();
        }}>
        <Text className="text-3xl font-bold text-neutral-900 dark:text-white">Hľadať mesto</Text>

        <View className="relative justify-center">
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Napíš názov mesta…"
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="search"
            className="rounded-xl bg-neutral-100 px-4 py-3 pr-11 text-base text-neutral-900 dark:bg-neutral-900 dark:text-white"
          />
          {text.length > 0 && (
            <Pressable
              onPress={handleClear}
              accessibilityRole="button"
              accessibilityLabel="Vymazať"
              hitSlop={8}
              className="absolute bottom-0 right-1 top-0 justify-center px-2">
              <Text className="text-lg text-neutral-400">✕</Text>
            </Pressable>
          )}
        </View>

        {isFetching && <ActivityIndicator />}

        <FlatList
          data={results ?? []}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
      </Pressable>
    </SafeAreaView>
  );
}
