"use client"

import React from "react"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useTranslation } from "next-i18next"
import {useMomentReactionsDrawerStore} from "@/store/moment/useMomentReactionsDrawerStore";
import Image from "next/image";
import EmptyList from "@/components/shared/EmptyList";
import {getReactionEmoji} from "@/utils/moment";
import {Skeleton} from "@/components/ui/skeleton";
const MomentReactionsDrawer = () => {
    const { t: u } = useTranslation("user");
    const {
        open,
        reactions,
        closeDrawer,
        isFetchingReactions
    } = useMomentReactionsDrawerStore();

    return (
        <Drawer open={open} onOpenChange={(o) => !o && closeDrawer()}>
            <DrawerContent onClick={(e) => e.stopPropagation()} className={"!z-[120]"}>
                <div className={"drawer-content !max-h-[80vh] !overflow-y-auto custom-scrollbar"}>
                    <DrawerTitle className={"text-center text-base font-medium"}>
                        {isFetchingReactions ? (
                            <Skeleton className={"h-6 w-32 rounded-full mx-auto"}/>
                        ) : (
                            <>
                                {reactions?.length !== 0 && u("home.actions.activity")}
                            </>
                        )}

                    </DrawerTitle>
                    <DrawerDescription />
                    {isFetchingReactions ? (
                        <>
                            {Array(4).fill(null).map((_, i) => (
                                <div
                                    key={i}
                                    className={"w-full p-2 flex flex-row justify-between items-center"}
                                >
                                    <div className={"flex flex-row items-center gap-2"}>
                                        <Skeleton className={"w-10 h-10 relative rounded-full"}/>
                                        <Skeleton className={"w-32 h-6 rounded-full"}/>
                                    </div>
                                    <Skeleton className="w-8 h-8 rounded-xl"/>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {reactions?.length === 0 ? (
                                <>
                                    <EmptyList message={u("home.actions.none")}/>
                                </>
                            ) : (
                                <>
                                    {reactions?.map((reaction) => (
                                        <div
                                            key={reaction.user.id}
                                            className={"w-full p-2 flex flex-row justify-between items-center"}
                                        >
                                            <div className={"flex flex-row items-center gap-2"}>
                                                <div
                                                    key={reaction.user.id}
                                                    className={"w-10 h-10 relative rounded-full"}
                                                >
                                                    <Image
                                                        src={reaction.user.avatarUrl ?? "/assets/images/avatar.png"}
                                                        alt={reaction.user.displayName}
                                                        fill
                                                        sizes={"32px"}
                                                        className={"rounded-full"}
                                                    />
                                                </div>
                                                <p className={"text-base font-medium"}>
                                                    {reaction.user.displayName}
                                                </p>
                                            </div>
                                            <Image
                                                src={getReactionEmoji(reaction.reactionType)}
                                                alt={reaction.reactionType}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 transition-transform duration-200"
                                            />
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default MomentReactionsDrawer;
