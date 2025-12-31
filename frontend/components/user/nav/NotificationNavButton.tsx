"use client"

import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import React from "react";
import BellFull from "@/components/shared/icons/BellFull";

const NotificationNavButton = () => {
    const pathname = usePathname();
    const normalizedPath = "/" + pathname.split("/").slice(2).join("/");
    const linkClass = (href: string) => {
        return `rounded-full bg-transparent p-1 hover:bg-background-300 ${
            normalizedPath.startsWith(href)
                ? "text-primary"
                : "text-foreground-200 hover:text-foreground"
        }`;
    }
    const router = useRouter();

    return (
        <button
            className={"relative"}
            onClick={() => router.push(ROUTES.NOTIFICATIONS)}
        >
            <div
                className={linkClass(ROUTES.NOTIFICATIONS)}
            >
                <BellFull className={"size-6"}/>
            </div>
        </button>
    )
}

export default NotificationNavButton;