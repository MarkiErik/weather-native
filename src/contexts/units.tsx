import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  const [hydrated, setHydrated] = useState(false);

  // Pri štarte načítame uloženú voľbu a označíme, že sme „hydratovaní".
  useEffect(() => {
    AsyncStorage.getItem(UNIT_KEY).then((value) => {
      if (value === "C" || value === "F") {
        setUnitState(value);
      }
      setHydrated(true);
    });
  }, []);

  const setUnit = useCallback((next: TempUnit) => {
    setUnitState(next);
    AsyncStorage.setItem(UNIT_KEY, next); // uloženie voľby
  }, []);

  const convertTemp = useCallback(
    (celsius: number) => (unit === "F" ? Math.round((celsius * 9) / 5 + 32) : celsius),
    [unit],
  );

  // useMemo, aby sa hodnota kontextu (a tým aj konzumenti) nerenderovala zbytočne.
  const value = useMemo(() => ({ unit, setUnit, convertTemp }), [unit, setUnit, convertTemp]);

  // Kým nenačítame uloženú jednotku, obsah nerenderujeme — zabráni to bliknutiu
  // teploty v °C predtým, než sa načíta uložené °F.
  if (!hydrated) {
    return null;
  }

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) {
    throw new Error("useUnits musí byť použité vnútri <UnitsProvider>");
  }
  return ctx;
}
