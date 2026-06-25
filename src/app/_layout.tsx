import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { AppearanceProvider } from "@/contexts/appearance";
import { UnitsProvider } from "@/contexts/units";
import { requestNotificationPermission } from "@/services/notifications";

// QueryClient vytvoríme RAZ mimo komponentu, aby sa pri re-renderoch
// neresetovala cache (inak by si stratil uložené dáta pri každom renderi).
const queryClient = new QueryClient();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Povolenie na notifikácie vyžiadame raz pri štarte (nie uprostred výberu mesta).
  useEffect(() => {
    void requestNotificationPermission();
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
