import { createInstance } from "i18next";
import { promises as fs } from "fs";
import path from "path";
import {getOptions, namespaces} from "@/lib/i18n/config";

export const initServerI18n = async (
    lng: string,
    ns: string[] = namespaces
): Promise<Record<string, Record<string, string>>> => {
    const i18n = createInstance();

    const resources: Record<string, Record<string, string>> = {};
    for (const n of ns) {
        resources[n] = await loadTranslation(lng, n);
    }

    await i18n.init({
        ...getOptions(lng),
        lng,
        resources: { [lng]: resources }
    });

    return resources;
};

const loadTranslation = async (lng: string, ns: string) => {
    const filePath = path.resolve(process.cwd(), `./public/locales/${lng}/${ns}.json`);
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
};
