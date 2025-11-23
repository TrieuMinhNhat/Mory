"use client";

import i18n from "@/lib/i18n/i18nClient";
import { I18nextProvider } from "react-i18next";
import React, {useEffect, useState} from "react";

export function I18nProvider({
                                 children,
                                 locale,
                                 resources,
                             }: {
    children: React.ReactNode;
    locale: string;
    resources: Record<string, Record<string, string | Record<string, string>>>;
}) {
    const [ready, setReady] = useState(i18n.isInitialized);


    useEffect(() => {
        if (!i18n.isInitialized) {
            i18n
                .init({
                    lng: locale,
                    fallbackLng: "en",
                    resources: { [locale]: resources },
                    interpolation: {
                        defaultVariables: {
                            appName: "Mory"
                        },
                        escapeValue: false
                    },
                })
                .then(() => setReady(true))
                .catch(console.error);
        } else {
            Object.entries(resources).forEach(([ns, data]) => {
                i18n.addResourceBundle(locale, ns, data, true, true);
            });
            i18n.changeLanguage(locale).catch(console.error);
            setReady(true);
        }
    }, [locale, resources]);

    if (!ready) return null;

    // if (!i18n.isInitialized) {
    //     i18n.init({
    //         lng: locale,
    //         fallbackLng: "en",
    //         resources: { [locale]: resources },
    //         interpolation: { escapeValue: false }
    //     }).then(() => {
    //         setReady(true);
    //     }).catch(console.error);
    // } else {
    //     Object.entries(resources).forEach(([ns, data]) => {
    //         const exists = i18n.hasResourceBundle(locale, ns);
    //         i18n.addResourceBundle(locale, ns, data, true, !exists);
    //     });
    //
    // }
    //
    // useEffect(() => {
    //     if (i18n.isInitialized && i18n.language !== locale) {
    //         i18n.changeLanguage(locale).catch(console.error);
    //     }
    // }, [locale]);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
