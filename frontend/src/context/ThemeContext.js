import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const ThemeContext = createContext(undefined);
const THEME_STORAGE_KEY = "iot_portal_theme";
const ACCENT_STORAGE_KEY = "iot_portal_accent";
const prefersDark = () => (typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true);
export const ThemeProvider = ({ children }) => {
    const [mode, setModeState] = useState("dark");
    const [accent, setAccentState] = useState("cyan");
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        let storedMode = null;
        let storedAccent = null;
        try {
            storedMode = localStorage.getItem(THEME_STORAGE_KEY);
            storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
        }
        catch {
            storedMode = null;
            storedAccent = null;
        }
        setModeState(storedMode ?? (prefersDark() ? "dark" : "light"));
        setAccentState(storedAccent ?? "cyan");
    }, []);
    useEffect(() => {
        if (typeof document === "undefined")
            return;
        const root = document.documentElement;
        root.classList.toggle("dark", mode === "dark");
        try {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
        catch {
            /* noop */
        }
    }, [mode]);
    useEffect(() => {
        if (typeof document === "undefined")
            return;
        const root = document.documentElement;
        root.setAttribute("data-accent", accent);
        try {
            localStorage.setItem(ACCENT_STORAGE_KEY, accent);
        }
        catch {
            /* noop */
        }
    }, [accent]);
    const value = useMemo(() => ({
        mode,
        accent,
        setMode: setModeState,
        setAccent: setAccentState
    }), [mode, accent]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
};
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
};
