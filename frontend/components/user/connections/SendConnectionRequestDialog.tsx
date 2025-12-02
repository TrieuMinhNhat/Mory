"use client"

import {useTranslation} from "next-i18next";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, ChevronsRight, X} from "lucide-react";
import React, {useCallback, useState} from "react";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import Image from "next/image";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import {ConnectionLimit, ConnectionType, RequestAlreadyPending} from "@/types/connections";
import {getConnectionTypeIcon} from "@/utils/connection";
import {useConnectionLimitReachedDialogStore} from "@/store/connection/useConnectionLimitReachedDialogStore";

const SendConnectionRequestsDialog = () => {
    const {t: u} = useTranslation("user");
    const { t: ts } = useTranslation("toast")

    const {
        open,
        selectedUser,
        oldType,
        newType,
        connect,
        closeDialog
    } = useSendConnectionRequestDialogStore();

    const { openDialog: openConnectionLimitReachedDialog } = useConnectionLimitReachedDialogStore();

    const [message, setMessage] = useState("");
    const MAX_LENGTH = 100;

    const {
        processingUserIds,
        sendRequest,
        sendChangeTypeRequest,
    } = useUserConnectionsStore(
        (state) => ({
            processingUserIds: state.processingUserIds,
            sendRequest: state.sendRequest,
            sendChangeTypeRequest: state.sendChangeTypeRequest
        }),
        shallow
    )
    
    const handleClose = useCallback(() => {
        setMessage("");
        closeDialog();
    }, [closeDialog]);

    const handleSendConnectionRequest = useCallback(async () => {
        if (!selectedUser) return;
        if (connect) {
            const result = await sendRequest(selectedUser.id,undefined,  message);
            if (result.success) {
                toast.success(ts("user.connections.send_connect.success", {name: selectedUser.displayName}));
                handleClose();
            } else {
                if (result.data) {
                    const limit = result.data as ConnectionLimit;
                    if (limit.selfExceeded !== undefined && limit.selfExceeded !== null) {
                        openConnectionLimitReachedDialog(
                            limit.selfExceeded,
                            ConnectionType.FRIEND
                        )
                        closeDialog();
                        return;
                    }
                    const pending = result.data as RequestAlreadyPending;
                    if (pending.hasPendingRequest !== undefined && pending.hasPendingRequest !== null) {
                        toast.error(ts("user.connections.requests.already_pending", {
                            name: selectedUser.displayName
                        }))
                    }
                    closeDialog();
                    return;
                }
                toast.error(ts("user.connections.send_connect.error", {name: selectedUser.displayName}));
            }
        } else {
            if (!newType) return;
            const result = await sendChangeTypeRequest(selectedUser.id, newType, message);
            if (result.success) {
                toast.success(ts("user.connections.send_change_type.success", {name: selectedUser.displayName}));
                handleClose();
            } else {
                if (result.data) {
                    const limit = result.data as ConnectionLimit;
                    if (limit.selfExceeded !== undefined && limit.selfExceeded !== null) {
                        openConnectionLimitReachedDialog(
                            limit.selfExceeded,
                            newType
                        )
                        closeDialog();
                        return;
                    }
                    const pending = result.data as RequestAlreadyPending;
                    if (pending.hasPendingRequest !== undefined && pending.hasPendingRequest !== null) {
                        toast.error(ts("user.connections.request.already_pending", {
                            name: selectedUser.displayName
                        }))
                    }
                    closeDialog();
                    return;
                }
                toast.error(ts("user.connections.send_change_type.error", {name: selectedUser.displayName}));
            }
        }
    }, [closeDialog, connect, handleClose, message, newType, openConnectionLimitReachedDialog, selectedUser, sendChangeTypeRequest, sendRequest, ts])


    if (!selectedUser) return;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full md:max-w-lg h-full md:h-fit px-0 flex flex-col md:rounded-xl">
                <div className={"flex flex-col w-full h-fit"}>
                    <div className={"w-full flex flex-row items-center"}>
                        <DialogClose asChild>
                            <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                                <ChevronLeft className={"size-7"}/>
                            </button>
                        </DialogClose>
                        <DialogTitle className={"text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                                <X className={"size-6"}/>
                            </button>
                        </DialogClose>
                        <DialogDescription></DialogDescription>
                    </div>
                </div>
                <div className={"flex flex-col p-2 items-center"}>
                    <div
                        className={"w-24 h-24 border-2 border-primary p-0.5 rounded-full"}
                    >
                        <div className={"w-[88px] h-[88px] rounded-full relative"}>
                            <Image
                                src={selectedUser.avatarUrl ?? "/assets/images/avatar.png"}
                                alt={"profile photo"}
                                fill
                                priority
                                sizes={"88px"}
                                className={"object-contain rounded-full"}
                            />
                        </div>
                    </div>
                    <h2 className={"text-2xl mt-1 font-semibold text-foreground"}>
                        {selectedUser.displayName}
                    </h2>
                    {!connect && (
                        <div className={"flex flex-row gap-0.5 mt-2 items-center"}>
                            {oldType && getConnectionTypeElement(oldType)}
                            <ChevronsRight className={"size-6"}/>
                            {newType && getConnectionTypeElement(newType)}
                        </div>
                    )}
                </div>
                <div className={"w-full flex flex-col p-2 items-center gap-2"}>
                    <div className="w-full relative">
                    <textarea
                        className={"bg-transparent resize-none border border-background-m rounded-2xl focus:!ring-foreground-200 w-full min-h-16 px-3 py-2 text-base custom-scrollbar overflow-y-auto"}
                        placeholder={"Message"}
                        maxLength={MAX_LENGTH}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                            }
                        }}
                    />
                        <span className="absolute bottom-2 right-2 text-xs text-foreground-400">
                        {message.length}/{MAX_LENGTH}
                    </span>
                    </div>
                    <button
                        className={"button-filled bg-primary text-primary-foreground h-12 w-full rounded-full"}
                        onClick={handleSendConnectionRequest}
                        disabled={processingUserIds.has(selectedUser.id)}
                    >
                        <ContentWithLoader isLoading={processingUserIds.has(selectedUser.id)}>
                            {u("connections.button.send_request")}
                        </ContentWithLoader>
                    </button>
                    <button
                        className={"auth-form-button-outline h-12 w-full rounded-full"}
                        onClick={handleClose}
                        disabled={processingUserIds.has(selectedUser.id)}
                    >
                        <ContentWithLoader isLoading={processingUserIds.has(selectedUser.id)}>
                            {u("connections.button.cancel")}
                        </ContentWithLoader>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const getConnectionTypeElement = (connectionType: ConnectionType): React.ReactNode => {
    const Icon = getConnectionTypeIcon(connectionType);
    switch (connectionType) {
        case ConnectionType.FRIEND:
            return (
                <div className={"p-0.5 rounded-full bg-foreground-200 w-fit"}>
                    <Icon className={"size-5 text-background-200"} />
                </div>
            )
        case ConnectionType.CLOSE_FRIEND:
            return (
                <div className={"p-0.5 rounded-full bg-close w-fit"}>
                    <Icon className={"size-5 text-fg-light-100"} />
                </div>
            )
        case ConnectionType.SPECIAL:
            return (
                <div className={"p-0.5 rounded-full bg-primary w-fit"}>
                    <Icon className={"size-5 text-primary-foreground"} />
                </div>
            )
    }
}

export default SendConnectionRequestsDialog;