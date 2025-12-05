"use client"

import React, {useCallback} from "react"
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle} from "@/components/ui/drawer"
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore"
import {toast} from "sonner"
import {useTranslation} from "next-i18next"
import {shallow} from "zustand/vanilla/shallow";
import {ConnectionType} from "@/types/connections";
import Image from "next/image";
import {getConnectionTypeIcon, getConnectionTypeLabel} from "@/utils/connection";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import {useStoryMemberActionStore} from "@/store/story/useStoryMemberActionStore";
import {useAuthStore} from "@/store/useAuthStore";
import {useStoriesStore} from "@/store/story/useStoriesStore";

const StoryMemberActionsDrawer = () => {
    const { t: u } = useTranslation("user")
    const { t: ts } = useTranslation("toast")

    const { open, selectedMember, selectedStory, connection, closeDrawer } = useStoryMemberActionStore();
    const user = useAuthStore((state) => state.user);

    const { openDialog } = useSendConnectionRequestDialogStore();

    const kickMember = useStoriesStore((state) => state.kickStoryMembers);
    

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

    const handleKickMember = useCallback(async () => {
        if (!selectedStory || !selectedMember || !user || selectedStory.creator.id !== user.id) return;
        const result = await kickMember(selectedStory.id, {memberIds: [selectedMember.id]});
        if (result.success) {
            toast.success(
                ts("user.story.kick_member.success", {
                    name: selectedStory.title,
                    memberName: selectedMember.displayName
                })
            )
        } else {
            toast.error(
                ts("user.story.kick_member.error", {
                    name: selectedStory.title,
                    memberName: selectedMember.displayName
                })
            );
        }
        
    }, [kickMember, selectedMember, selectedStory, ts, user])

    const handleBlockUser = useCallback(async () => {
        if (!selectedMember) return;
        const result = await blockUser(selectedMember.id);
        if (result.success) {
            toast.success(ts("user.connections.block.success", {name: selectedMember?.displayName}));
        } else {
            toast.error(ts("user.connections.block.error", {name: selectedMember?.displayName}));
        }
    }, [blockUser, selectedMember, ts])

    const handleRemoveConnection = useCallback(async () => {
        if (!selectedMember) return;
        const result = await removeConnection(selectedMember.id);
        if (result.success) {
            toast.success(ts("user.connections.remove.success", {name: selectedMember?.displayName}));
        } else {
            toast.error(ts("user.connections.remove.error", {name: selectedMember?.displayName}));
        }
    }, [selectedMember, removeConnection, ts])

    const handleDowngradeConnectionType = useCallback(async (newType: ConnectionType) => {
        if (!selectedMember || !connection || !connection.connectionType) return;
        const result = await downgradeConnectionType(
            selectedMember.id,
            newType
        );
        const fromLabel = getConnectionTypeLabel(connection.connectionType, u);
        const toLabel = getConnectionTypeLabel(newType, u);

        if (result.success) {
            toast.success(ts("user.connections.downgrade.success", {
                name: selectedMember.displayName,
                from: fromLabel,
                to: toLabel,
            }));
        } else {
            toast.error(ts("user.connections.downgrade.error", {
                name: selectedMember.displayName,
            }));
        }
    }, [downgradeConnectionType, selectedMember, connection, ts, u])

    if (!selectedMember) return;

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
                                    src={selectedMember.avatarUrl ?? "/assets/images/avatar.png"}
                                    alt={"avatar"}
                                    fill
                                    sizes={"32px"}
                                    className="rounded-full object-cover"
                                />
                            </div>
                            {connection && connection.connectionType && getConnectionTypeElement(selectedMember.avatarUrl, connection.connectionType)}
                        </div>
                        <h2 className="w-fit truncate font-medium text-left">
                            {selectedMember.displayName}
                        </h2>
                    </div>

                    {selectedStory?.creator.id === user?.id && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(selectedMember.id)}
                                onClick={() => handleKickMember()}
                            >
                                {u("story.drawer.kick")}
                            </button>
                        </DrawerClose>
                    )}
                    {connection?.connectionType && (
                        <>
                            <DrawerClose asChild>
                                <button
                                    className="drawer-button"
                                    disabled={processingUserIds.has(selectedMember.id)}
                                    onClick={handleBlockUser}
                                >
                                    {u("connections.home.drawer.block")}
                                </button>
                            </DrawerClose>
                            <DrawerClose asChild>
                                <button
                                    className="drawer-button"
                                    disabled={processingUserIds.has(selectedMember.id)}
                                    onClick={handleRemoveConnection}
                                >
                                    {u("connections.home.drawer.remove")}
                                </button>
                            </DrawerClose>
                        </>
                    )}
                    {(connection?.connectionType === ConnectionType.SPECIAL || connection?.connectionType === ConnectionType.CLOSE_FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(selectedMember.id)}
                                onClick={() => handleDowngradeConnectionType(ConnectionType.FRIEND)}
                            >
                                {u("connections.home.drawer.back_to_friends")}
                            </button>
                        </DrawerClose>
                    )}
                    {(connection?.connectionType === ConnectionType.SPECIAL) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(selectedMember.id)}
                                onClick={() => handleDowngradeConnectionType(ConnectionType.CLOSE_FRIEND)}
                            >
                                {u("connections.home.drawer.back_to_close_friends")}
                            </button>
                        </DrawerClose>
                    )}
                    {(connection?.connectionType === ConnectionType.FRIEND || connection?.connectionType === ConnectionType.CLOSE_FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(selectedMember.id)}
                                onClick={() => openDialog(selectedMember, false, connection?.connectionType, ConnectionType.SPECIAL)}
                            >
                                {u("connections.home.drawer.ask_to_be_partners")}
                            </button>
                        </DrawerClose>
                    )}
                    {(connection?.connectionType === ConnectionType.FRIEND) && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                disabled={processingUserIds.has(selectedMember.id)}
                                onClick={() => openDialog(selectedMember,  false, ConnectionType.FRIEND, ConnectionType.CLOSE_FRIEND)}
                            >
                                {u("connections.home.drawer.ask_to_be_close_friends")}
                            </button>
                        </DrawerClose>
                    )}
                    {connection &&
                        (!connection.connectionType || !Object.values(ConnectionType).includes(connection.connectionType)) &&
                        connection?.mutualConnections?.length > 0 && (
                            <DrawerClose asChild>
                                <button
                                    className="drawer-button"
                                    disabled={processingUserIds.has(selectedMember.id)}
                                    onClick={() => openDialog(selectedMember, true, undefined, ConnectionType.FRIEND)}
                                >
                                    {u("connections.home.drawer.ask_to_be_friends")}
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

const getConnectionTypeElement = (avatarUrl: string, connectionType: ConnectionType): React.ReactNode => {
    const Icon = getConnectionTypeIcon(connectionType);
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
                    <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-primary w-fit"}>
                        <Icon className={"size-3 text-primary-foreground"} />
                    </div>
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
                    <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-close w-fit"}>
                        <Icon className={"size-3 text-close-foreground"} />
                    </div>
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
                    <div className={"absolute bottom-0 right-0 p-0.5 rounded-full bg-foreground-200 w-fit"}>
                        <Icon className={"size-3 text-background-200"} />
                    </div>
                </div>
            );
    }
}

export default StoryMemberActionsDrawer;
