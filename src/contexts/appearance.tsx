import { createContext, useContext, useState, type ReactNode } from "react";

// Zdieľa "je aktuálne pozadie tmavé?" z obrazovky Počasie do tab lišty,
// aby si lišta vedela prefarbiť ikony (biele na tmavom, tmavé na svetlom).

type AppearanceContextValue = {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <AppearanceContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance musí byť použité vnútri <AppearanceProvider>");
  }
  return ctx;
}
