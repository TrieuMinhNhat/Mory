import { fallbackLng, defaultNS, namespaces, Namespace } from "./settings";
import { SUPPORTED_LOCALES, Locale } from "./locales";

export const getOptions = (
    lng: Locale = fallbackLng,
    ns: readonly Namespace[] = namespaces
) => ({
    debug: process.env.NODE_ENV === "development",

    supportedLngs: SUPPORTED_LOCALES,
    fallbackLng,
    lng,

    ns,
    defaultNS,

    interpolation: {
        escapeValue: false,
    },
});
