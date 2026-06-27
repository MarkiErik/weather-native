import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { AppState, type AppStateStatus, Platform, useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { AppearanceProvider } from "@/contexts/appearance";
import { UnitsProvider } from "@/contexts/units";
import { requestNotificationPermission } from "@/services/notifications";

// QueryClient vytvoríme RAZ mimo komponentu, aby sa pri re-renderoch
// neresetovala cache (inak by si stratil uložené dáta pri každom renderi).
const queryClient = new QueryClient();

// React Native has no browser "window focus" event, so `refetchOnWindowFocus`
// does nothing on its own. Bridge AppState -> focusManager: when the app returns
// to the foreground we mark the queries as focused, which refetches stale data.
function onAppStateChange(status: AppStateStatus) {
  // On web React Query already handles focus; only wire this on native.
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Povolenie na notifikácie vyžiadame raz pri štarte (nie uprostred výberu mesta).
  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  // Refetch data whenever the app comes back to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UnitsProvider>
        <AppearanceProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AppTabs />
          </ThemeProvider>
        </AppearanceProvider>
      </UnitsProvider>
    </QueryClientProvider>
  );
}
