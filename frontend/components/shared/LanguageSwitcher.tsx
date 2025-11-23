"use client";

import { setCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

const languages = ["vi", "en"] as const;

export default function LanguageSwitcher({ locale }: { locale: string }) {
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const switchTo = (newLocale: string) => {
        if (newLocale === locale) return;

        const segments = pathname.split("/");
        segments[1] = newLocale;

        startTransition(() => {
            setCookie("NEXT_LOCALE", newLocale, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
            });
            window.location.href = segments.join("/");
        });
    };

    return (
        <div className="flex items-center h-12 bg-background-100 border rounded-xl overflow-hidden w-full">
            {languages.map((lang) => {
                const active = locale === lang;
                return (
                    <button
                        key={lang}
                        disabled={isPending}
                        onClick={() => switchTo(lang)}
                        className={`flex-1 flex items-center justify-center gap-1 text-sm font-medium h-full rounded-xl transition-colors duration-200
                                    ${active
                                        ? "bg-background-200 text-foreground border border-background-m"
                                        : "text-foreground-200 hover:text-foreground hover:bg-background-200"}`}
                    >
                        {lang.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
}
