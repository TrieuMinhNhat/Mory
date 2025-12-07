"use client"

import React from "react";
import Link from "next/link";
import {useTranslation} from "next-i18next";

interface Props {
    nameKey: string;
    route: string
    isActive: boolean;
    icon: React.ElementType;

}

const AdminLeftSidebarNavItem = ({nameKey, route, isActive, icon: Icon}: Props) => {
    const {t: ad} = useTranslation("admin");
    const className = `flex flex-row flex-1 gap-3 p-3 rounded-md 
                        ${isActive ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}`;
    return (
        <Link href={route} className={className}>
            <Icon className={"size-6"} />
            <p className={"flex-1 text-left text-base font-medium"}>{ad(nameKey)}</p>
        </Link>
    )
}

export default AdminLeftSidebarNavItem;