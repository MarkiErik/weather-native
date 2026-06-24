import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WeatherCard } from "@/components/weather-card";
import { getWeatherTheme } from "@/constants/weather-theme";
import { getDeviceLocation } from "@/services/location";
import { getLastLocation, getSelectedLocation, saveLastLocation } from "@/services/storage";
import { fetchWeather } from "@/services/weather";

// Posledný fallback, ak nemáme GPS ani uloženú polohu
const BRATISLAVA = { latitude: 48.15, longitude: 17.11, city: "Bratislava" };

export default function WeatherScreen() {
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
    queryKey: ["weather", coords?.city],
    queryFn: () => fetchWeather(coords!.latitude, coords!.longitude, coords!.city),
    enabled: !!coords,
  });

  // Pred načítaním dát použijeme neutrálny denný gradient.
  const theme = weather ? getWeatherTheme(weather.code, weather.isDay) : getWeatherTheme(0, true);

  return (
    <LinearGradient colors={theme.colors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
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
            <WeatherCard
              icon={theme.icon}
              city={weather.city}
              temperature={weather.temperature}
              description={weather.description}
              high={weather.high}
              low={weather.low}
            />
          ) : (
            <ActivityIndicator size="large" color="white" />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
