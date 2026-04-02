import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "dark" | "light";

interface ThemeContextValue {
    mode: ThemeMode;
    isDark: boolean;
    isLight: boolean;
    toggleTheme: () => void;
    setDark: () => void;
    setLight: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem("duvion-theme") as ThemeMode) || "light";
        }
        return "light";
    });

    useEffect(() => {
        localStorage.setItem("duvion-theme", mode);
        const root = window.document.documentElement;
        if (mode === "light") {
            root.classList.add("light");
            root.classList.remove("dark");
        } else {
            root.classList.add("dark");
            root.classList.remove("light");
        }
    }, [mode]);

    const value: ThemeContextValue = {
        mode,
        isDark: mode === "dark",
        isLight: mode === "light",
        toggleTheme: () => setMode((m) => (m === "dark" ? "light" : "dark")),
        setDark: () => setMode("dark"),
        setLight: () => setMode("light"),
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
