"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/ThemeProvider";

const OPTIONS = [
    { key: "light", icon: <Sun className="w-5 h-5" /> },
    { key: "dark", icon: <Moon className="w-5 h-5" /> },
    { key: "system", icon: <Monitor className="w-5 h-5" /> },
] as const;

export default function LandingThemeSwitch() {
    const { theme, setTheme } = useTheme();

    const index = OPTIONS.findIndex((o) => o.key === theme);

    return (
        <div
            className="
        relative
        flex
        items-center
        h-12
        w-full
        rounded-xl
        border
        bg-background-100
        overflow-hidden
      "
        >
            {/* Highlight */}
            <motion.div
                layoutId="landingThemeHighlight"
                className="
          absolute
          top-1
          bottom-1
          rounded-lg
          bg-background-200
          border
          border-background-m
        "
                style={{
                    left: `calc((100% / 3) * ${index})`,
                    width: "calc(100% / 3)",
                    zIndex: 0,
                }}
                transition={{ type: "spring", stiffness: 650, damping: 60 }}
            />

            {OPTIONS.map((opt) => {
                const active = theme === opt.key;

                return (
                    <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`
              relative
              z-10
              flex-1
              flex
              items-center
              justify-center
              h-full
              rounded-xl
              transition-colors
              duration-200
              ${
                            active
                                ? "text-foreground"
                                : "text-foreground-200 hover:bg-background-200 hover:text-foreground"
                        }
            `}
                    >
                        {opt.icon}
                    </button>
                );
            })}
        </div>
    );
}
