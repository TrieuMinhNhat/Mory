"use client"

import React from "react";
import Image from "next/image";
import {useAuthStore} from "@/store/useAuthStore";
import {Conversation, ConversationType} from "@/types/conversations";
import { UserPreview } from "@/types/user";


interface Props {
    conversation: Conversation;
}

const ConversationAvatars = ({conversation}: Props) => {
    const user = useAuthStore((state) => state.user);
    if (!user) return;
    const otherUser = getOtherUserFromPrivateConversation(conversation, user.id);

    return (
        <>
            {(conversation.type === ConversationType.PRIVATE || conversation.members.length === 1) ? (
                <div
                    className={"relative shrink-0 rounded-full w-12 h-12"}
                >
                    <Image
                        src={otherUser?.avatarUrl ?? "/assets/images/avatar.png"}
                        alt={otherUser?.displayName ?? "unknow"}
                        fill
                        sizes={"48px"}
                        className="rounded-full object-cover"
                    />
                </div>
            ) : (
                <div className={"w-12 h-12 shrink-0 relative"}>
                    {conversation.members.length === 2 && (
                        <>
                            <div className={"w-8 h-8 absolute bottom-0 left-0 z-10 rounded-full"}>
                                <div className={"w-8 h-8 relative"}>
                                    <Image
                                        src={conversation.members[0].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[1].user.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"32px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {conversation.members.length === 3 && (
                        <>
                            <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={conversation.members[0].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[1].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[2].user.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {conversation.members.length === 4 && (
                        <>
                            <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={conversation.members[0].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[1].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[2].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[3].user.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {conversation.members.length > 4 && (
                        <>
                            <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={conversation.members[0].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[1].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[2].user.avatarUrl ?? "/assets/images/avatar.png"}
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
                                        src={conversation.members[3].user.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 bg-bg-dark-100 rounded-full flex items-center justify-center z-10 bg-opacity-70"}>
                                    <p className={"text-fg-light-100 text-sm font-medium"}>+{conversation.members.length - 3}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export const getOtherUserFromPrivateConversation = (
    conversation: Conversation,
    currentUserId: string
): UserPreview | undefined => {
    if (!conversation || !conversation.members) return undefined;

    if (conversation.members.length === 2) {
        return conversation.members.find(m => m.user.id !== currentUserId)?.user;
    }

    return undefined;
};

export default ConversationAvatars;