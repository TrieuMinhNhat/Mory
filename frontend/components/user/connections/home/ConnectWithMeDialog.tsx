"use client"

import React from "react";
import {useTranslation} from "next-i18next";
import OCopy from "@/components/shared/icons/OCopy";
import QrCodeGenerator from "@/components/shared/QrCodeGenerator";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {ChevronLeft, X} from "lucide-react";
import {useAuthStore} from "@/store/useAuthStore";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";
import EmptyList from "@/components/shared/EmptyList";

const ConnectWithMeDialog = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const user = useAuthStore((state) => state.user);

    const {
        inviteLink,
        isFetchingInviteLink,
        error,
        open,
        closeDialog
    } = useConnectWithMeDialogStore();

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className={"w-full h-full md:h-fit md:max-w-[600px] bg-background md:rounded-xl"}>
                <DialogHeader className={"w-full items-center"}>
                    <DialogClose asChild>
                        <button className={"block md:hidden rounded-full p-1 hover:bg-background-200"}>
                            <ChevronLeft className={"size-7"}/>
                        </button>
                    </DialogClose>
                    <DialogTitle className={"text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        {u("connections.home.connect_with_me_label")}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className={"w-full flex flex-col gap-4 items-center"}>
                    {isFetchingInviteLink ? (
                        <>
                            <Skeleton className={"w-full h-12 rounded-full"}/>
                            <Skeleton className=" w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px] rounded-lg"/>
                        </>
                        
                    ) : (
                        <>
                            <div className="relative w-full bg-background-200 py-1 px-2 rounded-full">
                                <input
                                    type="text"
                                    disabled={true}
                                    value={inviteLink}
                                    className="w-full h-10 pl-3 pr-10 border-none focus:outline-none text-foreground-200 focus:ring-0 bg-transparent"
                                />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground p-2 hover:bg-background-300 rounded-full"
                                    onClick={() => {
                                        if (!inviteLink) return;
                                        void navigator.clipboard.writeText(inviteLink);
                                        toast.success(ts("copied_to_clipboard"));
                                    }}
                                >
                                    <OCopy className={"size-5"}/>
                                </button>
                            </div>
                            {error ? (
                                <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px] bg-background-m rounded-lg flex items-center justify-center">
                                    <EmptyList message={""}/>
                                </div>
                            ): (
                                <QrCodeGenerator url={inviteLink} avatarUrl={user?.profile.avatarUrl}/>
                            )}
                        </>
                        
                    )}
                    
                </div>
                <DialogFooter>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default ConnectWithMeDialog;