import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import OHome from "@/components/shared/icons/OHome";
import OLyne from "@/components/shared/icons/OLyne";
import Camera from "@/components/shared/icons/Camera";
import OStory from "@/components/shared/icons/OStory";
import OPerson from "@/components/shared/icons/OPerson";
import React from "react";
import {useAuthStore} from "@/store/useAuthStore";
import {usePathname} from "next/navigation";
import {useCreateMomentDialogStore} from "@/store/moment/useCreateMomentDialogStore";

const Bottombar = () => {
    const user = useAuthStore((state) => state.user);
    const pathname = usePathname();

    const normalizedPath = "/" + pathname.split("/").slice(2).join("/");

    const linkClasses = (href: string) =>
        `w-16 flex items-center justify-center h-12 rounded-xl hover:bg-background-300 ${
            normalizedPath.startsWith(href) ? "text-primary" : "text-foreground-200 hover:text-foreground"
        }`;

    const { openDialog } = useCreateMomentDialogStore();

    if (!user) return null;
    return (
        <div className={"flex items-center justify-center w-full"}>
            <div className={"flex h-16 flex-row w-full items-center gap-2 px-2 justify-between"}>
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
        </div>
    )
}

export default Bottombar;