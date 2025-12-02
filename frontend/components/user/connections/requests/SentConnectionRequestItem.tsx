import Image from "next/image";
import React, {useCallback} from "react";
import {useTranslation} from "next-i18next";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ConnectionRequest, ConnectionType} from "@/types/connections";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {getAvatarByConnectionType} from "@/components/user/connections/home/ConnectionListItem";
import {getConnectionTypeIcon} from "@/utils/connection";
import {ChevronsRight} from "lucide-react";

interface ConnectionRequestItemPreviewProps {
    request: ConnectionRequest
}
const SentConnectionRequestItem = ({request}: ConnectionRequestItemPreviewProps) => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");
    const {
        processingRequestIds,
        cancelRequest
    } = useUserConnectionsStore(
        (state) => ({
            processingRequestIds: state.processingRequestIds,
            cancelRequest: state.cancelRequest,
        }),
        shallow
    )

    const handleCancelRequest = useCallback(async () => {
        const result = await cancelRequest(request.id);
        if (result.success) {
            toast.success(ts("user.connections.request.cancel.success", {name: request.recipient?.displayName}));
        } else {
            toast.error(ts("user.connections.request.cancel.error"));
        }
    }, [cancelRequest, request.id, request.recipient?.displayName, ts])
    
    return (
        <div
            key={request.id}
            className="bg-background-100 h-fit w-full hover:bg-background-200 has-[button:hover]:bg-background-100 hover:cursor-pointer rounded-xl flex flex-row gap-2 justify-center shrink-0 p-2"
        >
            {request.oldConnectionType ? (
                getAvatarByConnectionType(request.oldConnectionType, request.recipient.avatarUrl)
            ) : (
                <div className={"w-16 h-16 relative rounded-full shrink-0"}>
                    <Image
                        src={request.recipient.avatarUrl ?? "/assets/images/avatar.png"}
                        alt={"avatar"}
                        fill
                        sizes={"64px"}
                        className="rounded-full object-cover"
                    />
                </div>
            )}

            <div className={"flex flex-col w-full"}>
                <div className="flex flex-row w-full h-4 items-center gap-2">
                    <h2 className="truncate font-medium text-left">
                        {request.recipient.displayName}
                    </h2>
                    <div className={"flex flex-row gap-0.5 items-center flex-1"}>
                        {request.oldConnectionType && (
                            <>
                                {request.oldConnectionType && getConnectionTypeElement(request.oldConnectionType)}
                                <ChevronsRight className={"size-4"}/>
                                {request.newConnectionType && getConnectionTypeElement(request.newConnectionType)}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-row h-6 w-full items-center">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                        {request.mutualConnections.length > 0 &&
                            request.mutualConnections.slice(0, 3).map((m) => (
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
                        ${request.mutualConnections.length > 0 && "ml-1"}
                    `}>
                        {!request.mutualConnections || request.mutualConnections.length === 0
                            ? u("connections.home.no_mutual")
                            : u("connections.home.mutual", { count: request.mutualConnections.length })}
                    </p>
                </div>
                {request.message && (
                    <div className={"w-full px-2 py-1 border border-background-m mt-1 rounded-xl"}>
                        <p className={"text-sm"}>
                            {request.message}
                        </p>
                    </div>
                )}
            </div>
            <button
                className={"w-[200px] my-auto h-9 button-filled bg-background-300 rounded-full"}
                onClick={()  => handleCancelRequest()}
                disabled={processingRequestIds.has(request.id)}
            >
                <ContentWithLoader isLoading={processingRequestIds.has(request.id)}>
                    {u("connections.button.cancel")}
                </ContentWithLoader>
            </button>
        </div>
    )
}

const getConnectionTypeElement = (connectionType: ConnectionType): React.ReactNode => {
    const Icon = getConnectionTypeIcon(connectionType);
    switch (connectionType) {
        case ConnectionType.FRIEND:
            return (
                <div className={"p-0.5 rounded-full bg-foreground-200 w-fit"}>
                    <Icon className={"size-3 text-background-200"} />
                </div>
            )
        case ConnectionType.CLOSE_FRIEND:
            return (
                <div className={"p-0.5 rounded-full bg-close w-fit"}>
                    <Icon className={"size-3 text-fg-light-100"} />
                </div>
            )
        case ConnectionType.SPECIAL:
            return (
                <div className={"p-0.5 rounded-full bg-primary w-fit"}>
                    <Icon className={"size-3 text-primary-foreground"} />
                </div>
            )
    }
}

export default SentConnectionRequestItem;