"use client"

import ThemeToggle from "@/components/shared/ThemeSwitch";
import React from "react";
import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {useAuthStore} from "@/store/useAuthStore";
import {useTranslation} from "next-i18next";

const AdminTopbar = () => {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || fallbackLng;

    const {t: ad} = useTranslation("admin");

    const user = useAuthStore((state) => state.user)
    if (!user) return null;
    return (
        <div className={"flex flex-row w-full p-4 items-center"}>
            <div className={"hidden md:flex flex-col flex-1 text-foreground"}>
                <p className={"text-2xl font-semibold"}>
                    {ad("topbar.welcome")} {user.profile.displayName ?? user.email}
                </p>
                <p className={"hidden lg:block text-base"}>{ad("topbar.subtitle")}</p>
            </div>
            <ThemeToggle />
            <LanguageSwitcher locale={locale}/>
        </div>
    )
}

export default AdminTopbar;