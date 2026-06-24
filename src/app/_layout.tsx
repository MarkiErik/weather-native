import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { UnitsProvider } from "@/contexts/units";

// QueryClient vytvoríme RAZ mimo komponentu, aby sa pri re-renderoch
// neresetovala cache (inak by si stratil uložené dáta pri každom renderi).
const queryClient = new QueryClient();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <UnitsProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <AppTabs />
        </ThemeProvider>
      </UnitsProvider>
    </QueryClientProvider>
  );
}
