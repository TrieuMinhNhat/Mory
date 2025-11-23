"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");

    const applyTheme = (t: Theme) => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const finalTheme = t === "system" ? (prefersDark ? "dark" : "light") : t;

        document.documentElement.classList.toggle("dark", finalTheme === "dark");

        if (t === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", t);
    };

    useEffect(() => {
        const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
        setTheme(stored);
        applyTheme(stored);

        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => {
            if (stored === "system") applyTheme("system");
        };
        mql.addEventListener("change", listener);
        return () => mql.removeEventListener("change", listener);
    }, []);

    const handleSetTheme = (t: Theme) => {
        setTheme(t);
        applyTheme(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
