import Image from "next/image";
import React, {useCallback} from "react";
import {useTranslation} from "next-i18next";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getOtherUserFromConnection, Connection} from "@/types/connections";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface ConnectionListItemPreviewProps {
    connection: Connection
}
const BlockedConnectionListItem = ({connection}: ConnectionListItemPreviewProps) => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const {
        processingUserId,
        unblockUser
    } = useUserConnectionsStore(
        (state) => ({
            processingUserId: state.processingUserIds,
            unblockUser: state.unblockUser,
        }),
        shallow
    )

    const otherUser = getOtherUserFromConnection(connection);

    const handleUnblockUser = useCallback(async () => {
        const result = await unblockUser(otherUser.id);
        if (result.success) {
            toast.success(ts("user.connections.unblock.success", {name: otherUser?.displayName}));
        } else {
            toast.error(ts("user.connections.unblock.error", {name: otherUser?.displayName}));
        }
    }, [otherUser?.displayName, otherUser.id, ts, unblockUser])

    return (
        <div
            key={connection.id}
            tabIndex={0}
            role={"button"}
            className="bg-background-100 h-fit hover:bg-background-200 rounded-xl has-[button:hover]:bg-background-100 hover:cursor-pointer flex flex-row gap-2 items-center justify-center shrink-0 p-2"
        >
            <div className={"w-16 h-16 relative rounded-full shrink-0"}>
                <Image
                    src={otherUser.avatarUrl ?? "/assets/images/avatar.png"}
                    alt={"avatar"}
                    fill
                    sizes={"64px"}
                    className="rounded-full object-cover"
                />
            </div>
            <div className={"flex flex-col gap-1 w-full"}>
                <div className="flex flex-row w-full h-4 items-center gap-2">
                    <h2 className="flex-1 truncate font-medium text-left">
                        {otherUser.displayName}
                    </h2>
                </div>
                <div className="flex flex-row h-6 w-full items-center">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                        {connection.mutualConnections.length > 0 &&
                            connection.mutualConnections.slice(0, 3).map((m) => (
                                <Avatar key={m.id} className="size-4">
                                    <AvatarImage
                                        src={m.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt={m.displayName}
                                    />
                                    <AvatarFallback>
                                        {m.displayName ? m.displayName.charAt(0).toUpperCase() : "?"}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                    </div>
                    <p className={`text-sm text-foreground-200
                        ${connection.mutualConnections.length > 0 && "ml-1"}
                    `}>
                        {!connection.mutualConnections || connection.mutualConnections.length === 0
                            ? u("connections.home.no_mutual")
                            : u("connections.home.mutual", { count: connection.mutualConnections.length })}
                    </p>
                </div>
            </div>
            <button
                className={"w-[200px] h-9 button-filled bg-background-300 rounded-full"}
                onClick={handleUnblockUser}
                disabled={processingUserId.has(otherUser.id)}
            >
                <ContentWithLoader isLoading={processingUserId.has(otherUser.id)}>
                    {u("connections.button.unblock")}
                </ContentWithLoader>
            </button>
        </div>
    )
}

export default BlockedConnectionListItem;