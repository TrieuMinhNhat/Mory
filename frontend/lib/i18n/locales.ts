export const SUPPORTED_LOCALES = ["en", "vi"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];