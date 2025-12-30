"use client";

import { usePathname, useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

export default function LandingLanguageSwitch({
                                                  locale,
                                              }: {
    locale: Locale;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const switchTo = (newLocale: Locale) => {
        if (!pathname || newLocale === locale) return;

        const segments = pathname.split("/");
        segments[1] = newLocale;
        router.push(segments.join("/"));
    };

    return (
        <div className="w-full">
            <div className="flex h-12 rounded-xl border border-background-m bg-background overflow-hidden">
                {SUPPORTED_LOCALES.map((lang) => {
                    const active = lang === locale;
                    return (
                        <button
                            key={lang}
                            onClick={() => switchTo(lang)}
                            className={`flex-1 text-sm font-medium transition
                ${active
                                ? "bg-background-200 text-foreground"
                                : "text-foreground-200 hover:bg-background-200 hover:text-foreground"}
              `}
                        >
                            {lang.toUpperCase()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
