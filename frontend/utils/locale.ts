import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";
import { fallbackLng } from "@/lib/i18n/settings";

export function useLocaleFromRoute(pathname?: string): Locale {
    if (!pathname) return fallbackLng;

    const firstSegment = pathname.split("/")[1];

    if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
        return firstSegment as Locale;
    }

    return fallbackLng;
}