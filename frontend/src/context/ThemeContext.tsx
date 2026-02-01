import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type AccentTone = "cyan" | "emerald" | "violet";

type ThemeContextValue = {
  mode: ThemeMode;
  accent: AccentTone;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentTone) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "iot_portal_theme";
const ACCENT_STORAGE_KEY = "iot_portal_accent";

const prefersDark = () => (typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<AccentTone>("cyan");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let storedMode: ThemeMode | null = null;
    let storedAccent: AccentTone | null = null;
    try {
      storedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentTone | null;
    } catch {
      storedMode = null;
      storedAccent = null;
    }

    setModeState(storedMode ?? (prefersDark() ? "dark" : "light"));
    setAccentState(storedAccent ?? "cyan");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [mode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-accent", accent);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    } catch {
      /* noop */
    }
  }, [accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      accent,
      setMode: setModeState,
      setAccent: setAccentState
    }),
    [mode, accent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
