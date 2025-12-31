import { createInstance } from "i18next";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import { namespaces, type Namespace } from "@/lib/i18n/settings";
import type { Locale } from "@/lib/i18n/locales";
import { getOptions } from "@/lib/i18n/options";

export const initServerI18n = cache(
    async (
        lng: Locale,
        ns: readonly Namespace[] = namespaces
    ): Promise<Record<string, Record<string, string>>> => {
        const i18n = createInstance();

        const resources: Record<string, Record<string, string>> = {};
        for (const n of ns) {
            resources[n] = await loadTranslation(lng, n);
        }

        await i18n.init({
            ...getOptions(lng, ns),
            lng,
            resources: { [lng]: resources },
        });

        return resources;
    }
);

const loadTranslation = async (lng: string, ns: string) => {
    const filePath = path.resolve(
        process.cwd(),
        `./public/locales/${lng}/${ns}.json`
    );
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
};
