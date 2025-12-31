type Locale = "vi" | "en";

interface AlternatesOptions {
    pathname: string;
    locales?: Locale[];
    currentLocale: Locale;
}

export function buildAlternates({
                                    pathname,
                                    currentLocale,
                                    locales = ["vi", "en"],
                                }: AlternatesOptions) {
    return {
        canonical: `/${currentLocale}${pathname}`,
        languages: Object.fromEntries(
            locales.map((locale) => [
                locale,
                `/${locale}${pathname}`,
            ])
        ),
    };
}
