export const fallbackLng = "en";
export const languages = ["en", "vi"];
export const defaultNS = "common";
export const namespaces = ["common", "auth", "toast", "admin", "user"]

export const getOptions = (lng = fallbackLng, ns = namespaces) => ({
    debug: false,
    supportedLngs: languages,
    fallbackLng,
    lng,
    ns,
    defaultNS,
    interpolation: { escapeValue: false },
});