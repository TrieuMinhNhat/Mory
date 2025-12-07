import Image from "next/image";
import React from "react";
import {useTranslation} from "next-i18next";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getOtherUserFromConnection, Connection} from "@/types/connections";
import OMenuDotHorizontal from "@/components/shared/icons/OMenuDotHorizontal";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {useConnectionDrawerStore} from "@/store/connection/useConnectionDrawerStore";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {useAuthStore} from "@/store/useAuthStore";

interface Props {
    connection: Connection
}
const UserConnectionCard = ({connection}: Props) => {
    const {t: u} = useTranslation("user");
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const processingUserIds = useUserConnectionsStore((state) =>  state.processingUserIds)
    const otherUser = getOtherUserFromConnection(connection);
    const { openDrawer } = useConnectionDrawerStore();

    return (
        <div
            key={connection.id}
            tabIndex={0}
            onClick={() => {
                if (processingUserIds.has(otherUser.id)) return;
                if (otherUser.id === user?.id) {
                    router.push(ROUTES.PROFILE.ME.ROOT);
                    return;
                }
                router.push(ROUTES.PROFILE.ROOT(otherUser.id))
            }}
            role={"button"}
            className={`bg-background-100 w-full h-fit hover:bg-background-200 rounded-xl has-[button:hover]:bg-background-100 ${processingUserIds.has(otherUser.id) ? "hover:cursor-wait" : "hover:cursor-pointer"} flex flex-row gap-2 items-center justify-center shrink-0 p-2`}
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
                        {otherUser.id === user?.id ? u("home.you") : otherUser.displayName}
                    </h2>
                </div>
                {user?.id !== otherUser.id && (
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
                )}
            </div>
            {otherUser.id !== user?.id && (
                <button
                    className={"p-2 rounded-full bg-transparent shrink-0 hover:bg-background-300"}
                    disabled={processingUserIds.has(otherUser.id)}
                    onClick={(e) => {
                        e.stopPropagation()
                        openDrawer(connection)
                    }}
                >
                    <ContentWithLoader isLoading={processingUserIds.has(otherUser.id)} spinnerSize={4}>
                        <OMenuDotHorizontal className={"size-6"}/>
                    </ContentWithLoader>
                </button>
            )}
        </div>
    )
}

export default UserConnectionCard;