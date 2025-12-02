"use client"

import {useTranslation} from "next-i18next";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {X} from "lucide-react";
import React, {useMemo} from "react";
import Image from "next/image";
import {useConnectionLimitReachedDialogStore} from "@/store/connection/useConnectionLimitReachedDialogStore";
import {getConnectionTypeLabel} from "@/utils/connection";
import {useAuthStore} from "@/store/useAuthStore";
import {ConnectionType} from "@/types/connections";
import GoPremiumButton from "@/components/shared/GoPremiumButton";

const ConnectionLimitReachedDialog = () => {
    const {t: u} = useTranslation("user");
    const user = useAuthStore((state) => state.user);

    const {
        open,
        selfExceeded,
        connectionType,
        userPreview,
        closeDialog
    } = useConnectionLimitReachedDialogStore();
    
    const type = useMemo(() => {
        return connectionType ? getConnectionTypeLabel(connectionType, u) : undefined;
    }, [connectionType, u]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full md:max-w-lg h-fit px-0 gap-0 flex flex-col rounded-xl">
                <div className={"flex flex-col w-full h-fit"}>
                    <div className={"w-full flex flex-row items-center"}>
                        <DialogTitle className={"text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className={"p-1 rounded-full hover:bg-background-200"}>
                                <X className={"size-6"}/>
                            </button>
                        </DialogClose>
                        <DialogDescription></DialogDescription>
                    </div>
                </div>
                <div className={"flex flex-col p-2 gap-3 items-center"}>
                    <div
                        className={"w-24 h-24 ring-4 ring-primary p-0.5 rounded-full"}
                    >
                        <div className={"w-[92px] h-[92px] rounded-full relative"}>
                            <Image
                                src={(selfExceeded ? user?.profile.avatarUrl : userPreview?.avatarUrl) ?? "/assets/images/avatar.png"}
                                alt={"profile photo"}
                                fill
                                priority
                                sizes={"88px"}
                                className={"object-contain rounded-full"}
                            />
                        </div>
                    </div>
                    {userPreview && !selfExceeded && (
                        <p className={"text-center text-base"}>
                            {connectionType === ConnectionType.FRIEND
                                ? u("connections.limit.connect.other")
                                : u("connections.limit.change.other", {
                                    name: userPreview.displayName,
                                    type: type
                                })
                            }
                        </p>
                    )}
                    {user && selfExceeded && (
                        <>
                            <p className={"text-center text-base"}>
                                {connectionType === ConnectionType.FRIEND
                                    ? u("connections.limit.connect.me")
                                    : u("connections.limit.change.me", {
                                        name: user.profile.displayName,
                                        type: type
                                    })

                                }
                            </p>
                            <GoPremiumButton/>
                        </>
                    )}
                </div>
                <div className={"w-full p-2"}>
                    <button
                        className={"w-full rounded-full bg-primary hover:bg-primary/80 text-primary-foreground h-10"}
                        onClick={() => closeDialog()}
                    >
                        {u("connections.button.close")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectionLimitReachedDialog;