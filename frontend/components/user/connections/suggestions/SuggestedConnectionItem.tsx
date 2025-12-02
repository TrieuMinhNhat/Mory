import Image from "next/image";
import React from "react";
import {useTranslation} from "next-i18next";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {UserPreviewWithMutualConnections} from "@/types/user";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import {ConnectionType} from "@/types/connections";

interface SuggestedConnectionItemPreviewProps {
    item: UserPreviewWithMutualConnections
}
const SuggestedConnectionItem = ({item}: SuggestedConnectionItemPreviewProps) => {
    const {t: u} = useTranslation("user");

    const { openDialog } = useSendConnectionRequestDialogStore();

    return (
        <div
            key={item.user.id}
            className="bg-background-100 h-fit hover:bg-background-200 has-[button:hover]:bg-background-100 hover:cursor-pointer rounded-xl flex flex-row gap-2 items-center justify-center shrink-0 p-2"
        >
            <div className={"w-16 h-16 relative rounded-full shrink-0"}>
                <Image
                    src={item.user.avatarUrl ?? "/assets/images/avatar.png"}
                    alt={"avatar"}
                    fill
                    sizes={"64px"}
                    className="rounded-full object-cover"
                />
            </div>
            <div className={"flex flex-col w-full"}>
                <div className="flex flex-row w-full h-4 items-center gap-2">
                    <h2 className="flex-1 truncate font-medium text-left">
                        {item.user.displayName}
                    </h2>
                </div>
                <div className="flex flex-row h-6 w-full items-center">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                        {item.mutualConnections.length > 0 &&
                            item.mutualConnections.slice(0, 3).map((m) => (
                                <Avatar key={m.id} className="size-4">
                                    <AvatarImage
                                        src={m.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt={m.displayName}
                                    />
                                    <AvatarFallback>
                                        <Image
                                            src="/assets/images/avatar.png"
                                            alt="fallback avatar"
                                            fill
                                            sizes="100%"
                                            className="object-cover rounded-full"
                                        />
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                    </div>
                    <p className={`text-sm text-foreground-200
                        ${item.mutualConnections.length > 0 && "ml-1"}
                    `}>
                        {item.mutualConnections.length > 0 ? `${item.mutualConnections.length} ${u("connections.home.mutual")}` : `${u("connections.home.no_mutual")}`}
                    </p>
                </div>
                <div className={`flex flex-row w-full gap-2`}>
                    <button
                        onClick={() => openDialog(item.user, true, undefined, ConnectionType.FRIEND)}
                        className={"button-filled w-full bg-primary !text-fg-light-100 rounded-full h-8"}
                    >
                        {u("connections.button.send_request")}

                    </button>
                    <button
                        className={"button-filled w-full bg-background-300 rounded-full h-8"}
                    >
                        {u("connections.button.dismiss")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuggestedConnectionItem;