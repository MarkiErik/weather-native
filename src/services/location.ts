import * as Location from "expo-location";

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

/**
 * Zistí polohu zariadenia:
 * 1. vyžiada povolenie (zobrazí systémový dialóg),
 * 2. získa GPS súradnice,
 * 3. preloží súradnice na názov mesta (reverse geocoding).
 *
 * Ak používateľ povolenie zamietne, vyhodí chybu — obrazovka to ošetrí fallbackom.
 */
export async function getDeviceLocation(): Promise<DeviceLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Prístup k polohe bol zamietnutý");
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;

  // Reverse geocoding: súradnice -> adresa. Berieme prvý výsledok.
  const places = await Location.reverseGeocodeAsync({ latitude, longitude });
  const place = places[0];
  const city = place?.city ?? place?.region ?? "Moja poloha";

  return { latitude, longitude, city };
}
