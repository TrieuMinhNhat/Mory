import Image from "next/image";
import React from "react";
import OMenuDotHorizontal from "@/components/shared/icons/OMenuDotHorizontal";
import {UserPreview} from "@/types/user";
import {ConnectionType, ConnectionTypeStatus} from "@/types/connections";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import Person from "@/components/user/icons/Person";
import Star from "@/components/user/icons/Star";
import Heart from "@/components/user/icons/Heart";
import {useStoryMemberActionStore} from "@/store/story/useStoryMemberActionStore";
import {Story} from "@/types/moment";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Crown from "@/components/shared/icons/Crown";
import {ROUTES} from "@/constants/routes";
import {useRouter} from "next/navigation";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";

interface StoryMemberItemProps {
    member: UserPreview,
    connection: ConnectionTypeStatus | undefined,
    story: Story
}
const StoryMemberItem = ({member, connection, story}: StoryMemberItemProps) => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const processingUserIds = useUserConnectionsStore((state) =>  state.processingUserIds)
    const processingMemberIds = useStoriesStore((state) => state.processingMemberIds)
    const { openDrawer } = useStoryMemberActionStore();

    return (
        <div
            key={member.id}
            tabIndex={0}
            onClick={() => {
                if (processingMemberIds.has(member.id) || processingUserIds.has(member.id)) return;
                if (member.id === user?.id) {
                    router.push(ROUTES.PROFILE.ME.ROOT);
                    return;
                }
                router.push(ROUTES.PROFILE.ROOT(member.id))
            }}
            role={"button"}
            className={`bg-background-100 h-fit hover:bg-background-200 rounded-xl has-[button:hover]:bg-background-100 ${(processingMemberIds.has(member.id) || processingUserIds.has(member.id)) ? "hover:cursor-wait" : "hover:cursor-pointer"} flex flex-row gap-2 items-center justify-center shrink-0 p-2`}
        >
            {getAvatarByConnectionType(connection?.connectionType, member.avatarUrl, member.id === story.creator.id)}
            <div className={"flex flex-col gap-1 w-full"}>
                <div className="flex flex-row w-full h-4 items-center gap-2">
                    <h2 className="flex-1 truncate font-medium text-left">
                        {member.id === user?.id ? u("home.you") : member.displayName}
                    </h2>
                </div>
                {user?.id !== member.id && (
                    <div className="flex flex-row h-6 w-full items-center">
                        <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                            {connection && connection.mutualConnections.length > 0 &&
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
                            ${connection && connection.mutualConnections.length > 0 && "ml-1"}
                        `}>
                            {!connection || connection.mutualConnections.length === 0
                                ? u("connections.home.no_mutual")
                                : u("connections.home.mutual", { count: connection.mutualConnections.length })}
                        </p>
                    </div>
                )}
            </div>
            {member.id !== user?.id && (
                <button
                    className={"p-2 rounded-full bg-transparent shrink-0 hover:bg-background-300"}
                    disabled={processingMemberIds.has(member.id)}
                    onClick={(e) => {
                        e.stopPropagation()
                        openDrawer(member, story, connection);
                    }}
                >
                    <ContentWithLoader isLoading={processingMemberIds.has(member.id)} spinnerSize={4}>
                        <OMenuDotHorizontal className={"size-6"}/>
                    </ContentWithLoader>
                </button>
            )}

        </div>
    )
}

export function getAvatarByConnectionType(connectionType?: ConnectionType, avatarUrl?: string, isCreator?: boolean): React.ReactNode {
    switch (connectionType) {
        case ConnectionType.FRIEND:
            return (
                <div className={"w-16 h-16 relative flex items-center border-2 border-foreground-200 justify-center  rounded-full shrink-0"}>
                    <div className={"w-14 h-14 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"56px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className={"absolute bottom-0 right-0 bg-foreground-200 rounded-full p-[1px]"}>
                        <Person className={"size-5 text-background-200"}/>
                    </div>
                    {isCreator && (
                        <div className={"absolute top-0 left-0 bg-orange-400 rounded-full p-0.5"}>
                            <Crown className={"size-4 text-fg-light-100"}/>
                        </div>
                    )}
                </div>
            )
        case ConnectionType.CLOSE_FRIEND:
            return (
                <div className={"w-16 h-16 relative flex items-center border-2 border-close justify-center  rounded-full shrink-0"}>
                    <div className={"w-14 h-14 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"56px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className={"absolute bottom-0 right-0 bg-close rounded-full p-[1px]"}>
                        <Star className={"size-5 text-fg-light-100"}/>
                    </div>
                    {isCreator && (
                        <div className={"absolute top-0 left-0 bg-orange-400 rounded-full p-0.5"}>
                            <Crown className={"size-4 text-fg-light-100"}/>
                        </div>
                    )}
                </div>
            )
        case ConnectionType.SPECIAL:
            return (
                <div className={"w-16 h-16 relative flex items-center border-2 border-primary justify-center  rounded-full shrink-0"}>
                    <div className={"w-14 h-14 relative rounded-full"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"avatar"}
                            fill
                            sizes={"56px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className={"absolute bottom-0 right-0 bg-primary rounded-full p-[1px]"}>
                        <Heart className={"size-5 text-primary-foreground"}/>
                    </div>
                    {isCreator && (
                        <div className={"absolute top-0 left-0 bg-orange-400 rounded-full p-0.5"}>
                            <Crown className={"size-4 text-fg-light-100"}/>
                        </div>
                    )}


                </div>
            )
        default:
            return (
                <div className={"w-16 h-16 relative flex items-center justify-center rounded-full shrink-0"}>
                    <Image
                        src={avatarUrl ?? "/assets/images/avatar.png"}
                        alt={"avatar"}
                        fill
                        sizes={"64px"}
                        className="rounded-full object-cover"
                    />
                    {isCreator && (
                        <div className={"absolute top-0 left-0 bg-orange-400 rounded-full p-0.5"}>
                            <Crown className={"size-4 text-fg-light-100"}/>
                        </div>
                    )}
                </div>
            )
    }
}

export default StoryMemberItem;