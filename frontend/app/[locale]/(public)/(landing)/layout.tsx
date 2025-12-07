import React from "react";
import {initServerI18n} from "@/lib/i18n/i18nServer";
import get from "lodash.get";
import LandingTopbar from "@/components/landing/LandingTopbar";
import CoverLeft from "@/components/landing/graphics/CoverLeft";

export default async function LandingLayout({
                                                children,
                                                params,
                                            }: {
    children: React.ReactNode;
    params: { locale: string } | Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resources = await initServerI18n(locale, ["common", "auth"]);
    const c = (key: string) => get(resources["common"], key) || key;
    const a = (key: string) => get(resources["auth"], key) || key;

    return (
        <div
            className={"flex relative flex-col items-center min-h-screen bg-background"}
        >
            <div className={"absolute inset-0 h-64 z-0 hidden md:block"}>
                <CoverLeft bgColor={"rgb(var(--foreground-100))"} fgColor={"rgb(var(--background-100))"} className={"h-64 w-auto"}/>
            </div>
            <LandingTopbar appName={c("app_name")} locale={locale} buttonTitle={a("sign_in.button.sign_in")}/>
            <div className={"relative z-20 mt-44 flex flex-col justify-center"}>
                {children}
            </div>
        </div>
    )
}
