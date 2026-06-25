import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { WeatherCard } from "@/components/weather-card";
import { getWeatherTheme } from "@/constants/weather-theme";
import { useAppearance } from "@/contexts/appearance";
import { useUnits } from "@/contexts/units";
import { getDeviceLocation } from "@/services/location";
import {
  clearSelectedLocation,
  getLastLocation,
  getSelectedLocation,
  saveLastLocation,
} from "@/services/storage";
import { fetchWeather } from "@/services/weather";

// Posledný fallback, ak nemáme GPS ani uloženú polohu
const BRATISLAVA = { latitude: 48.15, longitude: 17.11, city: "Bratislava" };

export default function WeatherScreen() {
  const { unit, convertTemp } = useUnits();
  const { setIsDark } = useAppearance();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // „Použiť moju polohu" — zruší vybrané mesto, obrazovka sa vráti na GPS.
  const handleUseMyLocation = useCallback(async () => {
    await clearSelectedLocation();
    await queryClient.invalidateQueries({ queryKey: ["selectedLocation"] });
  }, [queryClient]);

  // Responzívny breakpoint: široká obrazovka (web/tablet) vs telefón.
  // useWindowDimensions reaguje na resize/rotáciu (na rozdiel od statického Dimensions.get).
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  // Mesto vybrané cez vyhľadávanie (má najvyššiu prioritu, ak je nastavené)
  const selectedLocationQuery = useQuery({
    queryKey: ["selectedLocation"],
    queryFn: getSelectedLocation,
  });

  // Uložená posledná poloha z AsyncStorage (rýchle, lokálne čítanie)
  const storedLocationQuery = useQuery({
    queryKey: ["lastLocation"],
    queryFn: getLastLocation,
  });

  // Reálna GPS poloha (vyžiada povolenie). retry:false — pri zamietnutí neskúšame dookola.
  const locationQuery = useQuery({
    queryKey: ["location"],
    queryFn: getDeviceLocation,
    retry: false,
  });

  // Po úspešnom GPS si polohu uložíme na nabudúce.
  useEffect(() => {
    if (locationQuery.data) {
      saveLastLocation(locationQuery.data);
    }
  }, [locationQuery.data]);

  // Priorita súradníc: vybrané mesto → reálne GPS → posledná uložená → Bratislava (až keď GPS zlyhá).
  const coords =
    selectedLocationQuery.data ??
    locationQuery.data ??
    storedLocationQuery.data ??
    (locationQuery.isError ? BRATISLAVA : undefined);

  const {
    data: weather,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    // Kľúčujeme na SÚRADNICE, nie len názov mesta — dve mestá s rovnakým názvom
    // (napr. Košice SK/CZ) by inak zdieľali tú istú cache.
    queryKey: ["weather", coords?.latitude, coords?.longitude],
    queryFn: () => fetchWeather(coords!.latitude, coords!.longitude, coords!.city),
    enabled: !!coords,
  });

  // Pred načítaním dát použijeme neutrálny denný gradient.
  const theme = weather ? getWeatherTheme(weather.code, weather.isDay) : getWeatherTheme(0, true);

  // Oznámime tab lište, či je pozadie tmavé — ale LEN keď je táto obrazovka
  // aktívna (useFocusEffect). Inak by sme prepisovali hodnotu nastavenú
  // obrazovkami Nastavenia/Hľadať a ikony by na nich boli nečitateľné.
  useFocusEffect(
    useCallback(() => {
      setIsDark(theme.isDark);
    }, [theme.isDark, setIsDark]),
  );

  return (
    <LinearGradient colors={theme.colors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {/* Keď je nastavené mesto z vyhľadávania, ponúkni návrat na GPS polohu. */}
        {selectedLocationQuery.data && (
          <Pressable
            onPress={() => void handleUseMyLocation()}
            accessibilityLabel="Použiť moju polohu"
            // top podľa safe-area insetu, nech 📍 nesedí pod stavovým riadkom (batéria/wifi)
            style={{ top: insets.top + 8 }}
            className="absolute right-5 z-10 h-11 w-11 items-center justify-center rounded-full bg-white/20 active:opacity-60">
            <Text className="text-xl">📍</Text>
          </Pressable>
        )}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="white"
            />
          }>
          {error ? (
            <View className="px-8">
              <Text className="text-center text-lg text-white">Chyba: {error.message}</Text>
            </View>
          ) : weather ? (
            // Na širokej obrazovke obsah zabalíme do frosted karty s max-šírkou,
            // nech nepláva v prázdne. Na telefóne necháme len vycentrovaný obsah.
            <View
              className={
                isWide
                  ? "w-full max-w-md items-center rounded-3xl bg-white/10 px-12 py-14"
                  : "items-center"
              }>
              <WeatherCard
                icon={theme.icon}
                city={weather.city}
                temperature={convertTemp(weather.temperature)}
                unit={unit}
                description={weather.description}
                high={convertTemp(weather.high)}
                low={convertTemp(weather.low)}
              />
            </View>
          ) : (
            <ActivityIndicator size="large" color="white" />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
