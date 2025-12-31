import type { Locale } from "./locales";

export const fallbackLng: Locale = "en";

export const defaultNS = "common";

export const namespaces = [
    "common",
    "auth",
    "toast",
    "admin",
    "user",
] as const;

export type Namespace = typeof namespaces[number];
