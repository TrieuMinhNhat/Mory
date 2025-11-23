"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { motion } from "framer-motion";

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();

    const options = [
        { key: "light", icon: <Sun className="w-5 h-5" /> },
        { key: "dark", icon: <Moon className="w-5 h-5" /> },
        { key: "system", icon: <Monitor className="w-5 h-5"/> },
    ] as const;

    const index = options.findIndex((opt) => opt.key === theme);

    return (
        <div className="relative flex items-center bg-background-100 border h-12 rounded-xl overflow-hidden w-full">
            <motion.div
                layoutId="themeHighlight"
                className="absolute top-0 bottom-0 bg-background-200 rounded-xl border border-background-m"
                style={{
                    left: `calc((100% / 3) * ${index})`,
                    width: "calc(100% / 3)",
                    zIndex: 0,
                }}
                transition={{ type: "spring", stiffness: 650, damping: 60 }}
            />

            {options.map((opt) => {
                const active = theme === opt.key;
                return (
                    <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`relative z-10 flex-1 flex justify-center items-center h-full rounded-xl transition-colors duration-200 ${
                            active ? "text-foreground" : "text-foreground-200 hover:bg-background-200 hover:text-foreground"
                        }`}
                    >
                        {opt.icon}
                    </button>
                );
            })}
        </div>
    );
}
