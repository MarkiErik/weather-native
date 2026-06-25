import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DeviceLocation } from "./location";

// Kľúče, pod ktorými ukladáme. Konštanty = žiadne preklepy v reťazcoch.
const LAST_LOCATION_KEY = "weather-app:last-location"; // posledná GPS poloha
const SELECTED_LOCATION_KEY = "weather-app:selected-location"; // mesto vybrané vyhľadávaním

/**
 * AsyncStorage ukladá len reťazce, takže objekt musíme serializovať cez JSON.
 */
export async function saveLastLocation(location: DeviceLocation): Promise<void> {
  await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}

/**
 * Načíta poslednú uloženú polohu, alebo null ak ešte žiadna nie je.
 */
export async function getLastLocation(): Promise<DeviceLocation | null> {
  const raw = await AsyncStorage.getItem(LAST_LOCATION_KEY);
  return raw ? (JSON.parse(raw) as DeviceLocation) : null;
}

/**
 * Mesto vybrané cez vyhľadávanie. Má prednosť pred GPS na obrazovke Počasie.
 */
export async function saveSelectedLocation(location: DeviceLocation): Promise<void> {
  await AsyncStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));
}

export async function getSelectedLocation(): Promise<DeviceLocation | null> {
  const raw = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);
  return raw ? (JSON.parse(raw) as DeviceLocation) : null;
}

/**
 * Zruší vybrané mesto → obrazovka Počasie sa vráti na GPS polohu.
 */
export async function clearSelectedLocation(): Promise<void> {
  await AsyncStorage.removeItem(SELECTED_LOCATION_KEY);
}
