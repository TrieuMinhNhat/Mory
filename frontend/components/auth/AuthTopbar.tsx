import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import Image from "next/image";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import ThemeAndLanguageActionMenu from "@/components/shared/ThemeAndLanguageActionMenu";
import React from "react";

const AuthTopbar = () => {
    return (
        <div className={"fixed top-0 z-20 flex flex-row justify-between items-center px-[16px] md:px-[50px] h-16 w-full"}>
            <Link href={ROUTES.LANDING}>
                <Image
                    src={"/assets/logo.svg"}
                    alt={"app logo"}
                    width={24}
                    height={24}
                    className={"rounded-md w-10 h-10 flex-shrink-0 mr-2"}
                />
            </Link>
            <Popover>
                <PopoverTrigger asChild>
                    <button className={"text-foreground p-2 hover:bg-background-300 rounded-full"}>
                        <MenuTriangle className={"size-6"} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="bg-background-300 !p-2 rounded-2xl" align={"end"}>
                    <ThemeAndLanguageActionMenu/>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default AuthTopbar;