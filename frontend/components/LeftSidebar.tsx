import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import OHome from "@/components/shared/icons/OHome";
import OLyne from "@/components/shared/icons/OLyne";
import Camera from "@/components/shared/icons/Camera";
import OStory from "@/components/shared/icons/OStory";
import OPerson from "@/components/shared/icons/OPerson";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import React from "react";
import {useAuthStore} from "@/store/useAuthStore";
import {usePathname} from "next/navigation";
import UserMenu from "@/components/user/UserMenu";
import {useCreateMomentDialogStore} from "@/store/moment/useCreateMomentDialogStore";

const LeftSidebar = () => {
    const user = useAuthStore((state) => state.user);
    const pathname = usePathname();

    const normalizedPath = "/" + pathname.split("/").slice(2).join("/");

    const isOwnProfileRoute = () => {
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length < 2) return false;

        const firstAfterLocale = pathSegments[1];

        if (firstAfterLocale !== "profile") return false;

        const secondAfterProfile = pathSegments[2];

        const validTabs = ["connections", "stories"];

        if (!secondAfterProfile) return true;
        return validTabs.includes(secondAfterProfile);


    };

    const linkClasses = (href: string) => {
        if (href === ROUTES.PROFILE.ME.ROOT) {
            return `w-16 flex items-center justify-center h-12 rounded-xl hover:bg-background-300 ${
                isOwnProfileRoute()
                    ? "text-primary"
                    : "text-foreground-200 hover:text-foreground"
            }`;
        }

        return `w-16 flex items-center justify-center h-12 rounded-xl hover:bg-background-300 ${
            normalizedPath.startsWith(href)
                ? "text-primary"
                : "text-foreground-200 hover:text-foreground"
        }`;
    };


    const { openDialog } = useCreateMomentDialogStore();

    if (!user) return null;
    return (
        <div className={"w-full h-full flex flex-col"}>
            <div className={"flex h-full flex-col w-20 items-center gap-3 justify-center"}>
                <Link href={ROUTES.HOME} className={linkClasses(ROUTES.HOME)}>
                    <OHome className="size-8" />
                </Link>
                <Link
                    href={ROUTES.CONNECTIONS.ROOT}
                    className={linkClasses(ROUTES.CONNECTIONS.ROOT)}
                >
                    <OLyne className="size-7" />
                </Link>
                <button
                    className={"w-12 h-12 mt-2 mb-2 text-foreground-200 rounded-xl bg-background-m hover:text-foreground flex items-center justify-center transform rotate-45"}
                    onClick={() => openDialog()}
                >
                    <Camera className={"size-8 -rotate-45"}/>
                </button>
                <Link
                    href={ROUTES.STORY.ROOT}
                    className={linkClasses(ROUTES.STORY.ROOT)}
                >
                    <OStory className="size-7" />
                </Link>
                <Link
                    href={ROUTES.PROFILE.ME.ROOT}
                    className={linkClasses(ROUTES.PROFILE.ME.ROOT)}
                >
                    <OPerson className="size-8" />
                </Link>
            </div>
            <div className={"flex w-full justify-center mb-6"}>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className={"w-16 flex items-center justify-center h-12 rounded-xl text-foreground-200 hover:text-primary"}
                        >
                            <MenuTriangle className={"size-8"} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className={"bg-background-300 !p-2 rounded-2xl"} align={"end"}>
                        <UserMenu/>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default LeftSidebar;