"use client"

import Link from "next/link";
import OChat from "@/components/shared/icons/OChat";
import BellFull from "@/components/shared/icons/BellFull";
import {ROUTES} from "@/constants/routes";
import Image from "next/image";
import React from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import UserMenu from "@/components/user/UserMenu";
import {usePathname, useRouter} from "next/navigation";

const Topbar = () => {
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
        <div className={"flex flex-row w-full h-16 justify-between bg-background-100 pl-2 pr-2 md:pl-6 md:pr-6 items-center"}>
            <Link href={ROUTES.HOME}>
                <Image
                    src={"/assets/logo.svg"}
                    alt={"app logo"}
                    width={24}
                    height={24}
                    priority
                    className={"rounded-md w-8 h-8 flex-shrink-0 mr-2"}
                />
            </Link>

            <div className={"flex flex-row items-center gap-4"}>
                <button
                    className={linkClass(ROUTES.CHAT.ROOT)}
                    onClick={() => router.push(ROUTES.CHAT.ROOT)}
                >
                    <OChat className={"size-6"}/>
                </button>
                <button className={linkClass(ROUTES.NOTIFICATIONS)}>
                    <BellFull className={"size-6"}/>
                </button>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className={"rounded-full bg-transparent size-8 flex md:hidden justify-center text-foreground hover:bg-background-300 items-center"}>
                            <MenuTriangle className={"size-6"} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-background-300 !p-2 rounded-2xl" align={"end"}>
                        <UserMenu/>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default Topbar;