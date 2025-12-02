"use client"

import React, {useCallback} from "react"
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle} from "@/components/ui/drawer"
import {useConnectionDrawerStore} from "@/store/connection/useConnectionDrawerStore"
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore"
import {toast} from "sonner"
import {useTranslation} from "next-i18next"
import {shallow} from "zustand/vanilla/shallow";
import {ConnectionLimit, ConnectionStatus, ConnectionType, getOtherUserFromConnection} from "@/types/connections";
import Image from "next/image";
import {getConnectionTypeIcon, getConnectionTypeLabel} from "@/utils/connection";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import {useConnectionLimitReachedDialogStore} from "@/store/connection/useConnectionLimitReachedDialogStore";

const ConnectionActionsDrawer = () => {
    const { t: u } = useTranslation("user")
    const { t: ts } = useTranslation("toast")

    const { open, selectedConnection, userPreview, closeDrawer } = useConnectionDrawerStore()

    const { openDialog: openSendConnectionRequestDialog } = useSendConnectionRequestDialogStore();
    const { openDialog: openConnectionLimitReachedDialog } = useConnectionLimitReachedDialogStore();
    const {
        processingUserIds,
        blockUser,
        removeConnection,
        downgradeConnectionType,
    } = useUserConnectionsStore(
        (state) => ({
            processingUserIds: state.processingUserIds,
            blockUser: state.blockUser,
            removeConnection: state.removeConnection,
            downgradeConnectionType: state.downgradeConnectionType,
        }),
        shallow
    )

    const otherUser = userPreview
        ? userPreview
        : (selectedConnection ? getOtherUserFromConnection(selectedConnection) : undefined);


    const handleBlockUser = useCallback(async () => {
        if (!otherUser) return;
        const result = await blockUser(otherUser.id);
        if (result.success) {
            toast.success(ts("user.connections.block.success", {name: otherUser?.displayName}));
        } else {
            toast.error(ts("user.connections.block.error", {name: otherUser?.displayName}));
        }
    }, [blockUser, otherUser, ts])

    const handleRemoveConnection = useCallback(async () => {
        if (!otherUser) return;
        const result = await removeConnection(otherUser.id);
        if (result.success) {
            toast.success(ts("user.connections.remove.success", {name: otherUser?.displayName}));
        } else {
            toast.error(ts("user.connections.remove.error", {name: otherUser?.displayName}));
        }
    }, [otherUser, removeConnection, ts])
    
    const handleDowngradeConnectionType = useCallback(async (newType: ConnectionType) => {
        if (!otherUser || !selectedConnection) return;
        const result = await downgradeConnectionType(
            otherUser.id,
            newType
        );
        const fromLabel = getConnectionTypeLabel(selectedConnection.connectionType, u);
        const toLabel = getConnectionTypeLabel(newType, u);

        if (result.success) {
            toast.success(ts("user.connections.downgrade.success", {
                name: otherUser.displayName,
                from: fromLabel,
                to: toLabel,
            }));
        } else {
            const limit = result.data as ConnectionLimit;
            if (limit.selfExceeded !== undefined && limit.selfExceeded !== null) {
                openConnectionLimitReachedDialog(
                    limit.selfExceeded,
                    newType,
                    limit.selfExceeded ? undefined : otherUser
                )
                closeDrawer();
                return;
            }
            toast.error(ts("user.connections.downgrade.error", {
                name: otherUser.displayName,
            }));
        }
    }, [closeDrawer, downgradeConnectionType, openConnectionLimitReachedDialog, otherUser, selectedConnection, ts, u])

    if (!otherUser) return;

    return (
        <Drawer open={open} onOpenChange={(o) => !o && closeDrawer()}>
            <DrawerContent onClick={(e) => e.stopPropagation()}>
                <div className="drawer-content flex flex-col p-4">
                    <DrawerTitle></DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                    <div className={"w-full flex flex-row items-center gap-1 mb-1 justify-center"}>
                        <div className={"w-10 h-10 relative flex items-center border-2 border-foreground-200 justify-center  rounded-full shrink-0"}>
                            <div className={"w-8 h-8 relative rounded-full"}>
                                <Image
                                    src={otherUser.avatarUrl ?? "/assets/images/avatar.png"}
                                    alt={"avatar"}
                                    fill
                                    sizes={"32px"}
                                    className="rounded-full object-cover"
                                />
                            </div>
                            {selectedConnection && getConnectionTypeElement(otherUser?.avatarUrl, selectedConnection.connectionType)}
                        </div>
                        <h2 className="w-fit truncate font-medium text-left">
                            {otherUser.displayName}
                        </h2>

                    </div>
                    <DrawerClose asChild>
                        <button
                            className="drawer-button"
                            disabled={processingUserIds.has(otherUser.id)}
                            onClick={handleBlockUser}
                        >
                            {u("connections.home.drawer.block")}
                        </button>
                    </DrawerClose>
                    {selectedConnection?.connectionType &&
                        Object.values(ConnectionType).includes(selectedConnection.connectionType) &&
                        selectedConnection.status === ConnectionStatus.CONNECTED && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(otherUser.id)}
                                onClick={handleRemoveConnection}
                            >
                                {u("connections.home.drawer.remove")}
                            </button>
                        </DrawerClose>
                    )}
                    {(!selectedConnection?.connectionType || !Object.values(ConnectionType).includes(selectedConnection.connectionType)) &&
                        selectedConnection?.mutualConnections &&
                        selectedConnection.mutualConnections.length > 0 && (
                            <DrawerClose asChild>
                                <button
                                    className="drawer-button"
                                    disabled={processingUserIds.has(otherUser.id)}
                                    onClick={() => openSendConnectionRequestDialog(otherUser, true, undefined, ConnectionType.FRIEND)}
                                >
                                    {u("connections.home.drawer.ask_to_be_friends")}
                                </button>
                            </DrawerClose>
                    )}
                    {(selectedConnection?.connectionType === ConnectionType.SPECIAL || selectedConnection?.connectionType === ConnectionType.CLOSE_FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(otherUser.id)}
                                onClick={() => handleDowngradeConnectionType(ConnectionType.FRIEND)}
                            >
                                {u("connections.home.drawer.back_to_friends")}
                            </button>
                        </DrawerClose>
                    )}
                    {(selectedConnection?.connectionType === ConnectionType.SPECIAL) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(otherUser.id)}
                                onClick={() => handleDowngradeConnectionType(ConnectionType.CLOSE_FRIEND)}
                            >
                                {u("connections.home.drawer.back_to_close_friends")}
                            </button>
                        </DrawerClose>
                    )}
                    {(selectedConnection?.connectionType === ConnectionType.FRIEND || selectedConnection?.connectionType === ConnectionType.CLOSE_FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(otherUser.id)}
                                onClick={() => openSendConnectionRequestDialog(otherUser, false, selectedConnection?.connectionType, ConnectionType.SPECIAL)}
                            >
                                {u("connections.home.drawer.ask_to_be_partners")}
                            </button>
                        </DrawerClose>
                    )}
                    {(selectedConnection?.connectionType === ConnectionType.FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(otherUser.id)}
                                onClick={() => openSendConnectionRequestDialog(otherUser,  false, ConnectionType.FRIEND, ConnectionType.CLOSE_FRIEND)}
                            >
                                {u("connections.home.drawer.ask_to_be_close_friends")}
                            </button>
                        </DrawerClose>
                    )}

                    <DrawerClose asChild>
                        <button className="drawer-button">{u("drawer.cancel")}</button>
                    </DrawerClose>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

const getConnectionTypeElement = (avatarUrl?: string, connectionType?: ConnectionType): React.ReactNode => {
    const Icon = connectionType ? getConnectionTypeIcon(connectionType) : undefined;
    switch (connectionType) {
        case ConnectionType.SPECIAL:
            return (
                <div className={"w-10 h-10 relative flex items-center border-2 border-primary justify-center  rounded-full shrink-0"}>
                    <div className={"w-8 h-8 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"32px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    {Icon && (
                        <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-primary w-fit"}>
                            <Icon className={"size-3 text-primary-foreground"} />
                        </div>
                    )}
                </div>

            );
        case ConnectionType.CLOSE_FRIEND:
            return (
                <div className={"w-10 h-10 relative flex items-center border-2 border-close justify-center  rounded-full shrink-0"}>
                    <div className={"w-8 h-8 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"32px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    {Icon && (
                        <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-close w-fit"}>
                            <Icon className={"size-3 text-close-foreground"} />
                        </div>
                    )}
                </div>
            );
        case ConnectionType.FRIEND:
            return (
                <div className={"w-10 h-10 relative flex items-center border-2 border-foreground-200 justify-center  rounded-full shrink-0"}>
                    <div className={"w-8 h-8 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"32px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    {Icon && (
                        <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-foreground-200 w-fit"}>
                            <Icon className={"size-3 text-background-200"} />
                        </div>
                    )}
                </div>
            );
    }
}

export default ConnectionActionsDrawer
