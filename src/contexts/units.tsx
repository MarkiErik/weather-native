import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Globálny stav: v akej jednotke zobrazujeme teplotu.
// Context = zdieľanie stavu naprieč appkou bez prevliekania cez props.

type TempUnit = "C" | "F";
const UNIT_KEY = "weather-app:temp-unit";

type UnitsContextValue = {
  unit: TempUnit;
  setUnit: (unit: TempUnit) => void;
  /** Prepočíta teplotu z °C na zvolenú jednotku (zaokrúhlené). */
  convertTemp: (celsius: number) => number;
};

const UnitsContext = createContext<UnitsContextValue | null>(null);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<TempUnit>("C");

  // Pri štarte načítame uloženú voľbu.
  useEffect(() => {
    AsyncStorage.getItem(UNIT_KEY).then((value) => {
      if (value === "C" || value === "F") {
        setUnitState(value);
      }
    });
  }, []);

  function setUnit(next: TempUnit) {
    setUnitState(next);
    AsyncStorage.setItem(UNIT_KEY, next); // uloženie voľby
  }

  function convertTemp(celsius: number) {
    return unit === "F" ? Math.round((celsius * 9) / 5 + 32) : celsius;
  }

  return (
    <UnitsContext.Provider value={{ unit, setUnit, convertTemp }}>{children}</UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) {
    throw new Error("useUnits musí byť použité vnútri <UnitsProvider>");
  }
  return ctx;
}
