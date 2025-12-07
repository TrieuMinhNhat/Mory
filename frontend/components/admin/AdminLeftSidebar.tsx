"use client"

import {adminSidebarLinks} from "@/constants";
import AdminLeftSidebarNavItem from "@/components/admin/AdminLeftSidebarNavItem";
import {usePathname} from "next/navigation";
import MoryLogo from "@/components/logo/MoryLogo";
import React from "react";
import {useTranslation} from "next-i18next";
import AdminAvatar from "@/components/admin/AdminAvatar";

const AdminLeftSidebar = () => {
    const {t: c} = useTranslation("common");
    const pathname = usePathname()
    return (
        <div className={"flex flex-col h-full"}>
            {/* Logo */}
            <div className={"flex flex-row gap-1 items-center justify-center px-4 pt-4 pb-2"}>
                <MoryLogo className={"size-[45px] flex-shrink-0 mr-1 text-primary"}/>
                <h1 className={"text-3xl font-semibold text-primary"} >{c("app_name")}</h1>
            </div>

            <div className={"border-t border-primary border-dashed my-2 mx-2"} />

            {/* Scrollable nav links */}
            <div className="flex-1 overflow-y-auto mt-4 px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {adminSidebarLinks.map((link, index) => {
                        const isActive =
                            (pathname.endsWith(link.route) && link.route.length > 1) ||
                            pathname === link.route;
                        return (
                            <AdminLeftSidebarNavItem
                                key={index}
                                nameKey={link.key}
                                route={link.route}
                                isActive={isActive}
                                icon={link.icon}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Avatar bottom */}
            <div className="shrink-0 mb-2 p-2">
                <AdminAvatar />
            </div>
        </div>

    )
}

export default AdminLeftSidebar;