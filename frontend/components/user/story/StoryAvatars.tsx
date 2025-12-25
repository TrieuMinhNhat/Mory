"use client"

import React from "react";
import {Story, StoryScope} from "@/types/moment";
import Image from "next/image";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useAuthStore} from "@/store/useAuthStore";
import {useTranslation} from "next-i18next";


interface Props {
    story: Story;
}


const TOOLTIP_MAX = 6


const StoryAvatars = ({story}: Props) => {
    const {t: u} = useTranslation("user")
    const user = useAuthStore((state) => state.user);
    return (
        <>
            {story.scope === StoryScope.GROUP && story.members.length > 1 &&  (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={"w-12 h-12 shrink-0 relative"}>
                            {story.members.length === 2 && (
                                <>
                                    <div className={"w-8 h-8 absolute bottom-0 left-0 z-10 rounded-full"}>
                                        <div className={"w-8 h-8 relative"}>
                                            <Image
                                                src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"32px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-8 h-8 absolute top-0 right-0 rounded-full"}>
                                        <div className={"w-8 h-8 relative"}>
                                            <Image
                                                src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"32px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {story.members.length === 3 && (
                                <>
                                    <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-7 h-7 absolute top-0 left-1/2 -translate-x-1/2 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {story.members.length === 4 && (
                                <>
                                    <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-7 h-7 absolute top-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[3].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>

                                </>
                            )}
                            {story.members.length > 4 && (
                                <>
                                    <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className={"w-7 h-7 absolute top-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 relative"}>
                                            <Image
                                                src={story.members[3].avatarUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                fill
                                                sizes={"28px"}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                        <div className={"w-7 h-7 bg-bg-dark-100 rounded-full flex items-center justify-center z-10 bg-opacity-70"}>
                                            <p className={"text-fg-light-100 text-sm font-medium"}>+{story.members.length - 3}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent
                        className={"bg-background-m"} align={"start"} side={"bottom"}
                        onPointerDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={"flex flex-col"}>
                            {story.members.slice(0, TOOLTIP_MAX).map((member) => (
                                <p
                                    key={member.id}
                                    className={"text-sm"}
                                >
                                    {user?.id === member.id ? u("home.you") : member.displayName}
                                </p>
                            ))}
                            {story.members.length > TOOLTIP_MAX && (
                                <p
                                    className={"text-sm"}
                                >
                                    ...
                                </p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            )}

            {(story.scope === StoryScope.PERSONAL || story.members.length === 1) && (
                <div
                    className={"relative shrink-0 rounded-full w-12 h-12"}
                >
                    <Image
                        src={story.creator.avatarUrl ?? "/assets/images/avatar.png"}
                        alt={story.creator.displayName}
                        fill
                        sizes={"48px"}
                        className="rounded-full object-cover"
                    />
                </div>
            )}
        </>
    )
}

export default StoryAvatars;