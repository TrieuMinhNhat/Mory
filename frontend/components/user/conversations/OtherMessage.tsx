"use client"

import Image from "next/image";
import {formatSmartDateTime} from "@/utils/time";
import Reply from "@/components/user/conversations/icons/Reply";
import {EllipsisVertical, Smile} from "lucide-react";
import React from "react";
import {ChatMessage, ConversationType, RepliedMessage, RepliedMoment} from "@/types/conversations";
import {UserPreview} from "@/types/user";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {isOnlyEmoji} from "@/utils/chat";
import ReadersRow from "@/components/user/conversations/ReadersRow";

interface Props {
    message: ChatMessage;
    conversationType: ConversationType;
    sender: UserPreview;
    repliedMoment?: RepliedMoment;
    repliedMomentOwner?: UserPreview;
    showAvatar: boolean;
    showSenderName: boolean;
    messagesLength: number;
    index: number;
    lastReadMessageIndex: number;
    readers: UserPreview[];
    repliedMessage?: RepliedMessage;
    repliedMessageOwner?: UserPreview;
    handleReply: (message: ChatMessage) => void;
    handleSearchRepliedMessage: (id: string) => void;
}

const OtherMessage = ({
                          message,
                          conversationType,
                          sender,
                          repliedMoment,
                          repliedMomentOwner,
                          showAvatar,
                          showSenderName,
                          messagesLength,
                          index,
                          lastReadMessageIndex,
                          readers,
                          repliedMessage,
                          repliedMessageOwner,
                          handleReply,
                          handleSearchRepliedMessage
}: Props) => {
    const {t: u} = useTranslation("user")
    const user = useAuthStore((state) => state.user);

    const onlyEmoji = isOnlyEmoji(message.text);

    const getReplyInfo = () => {
        if (!repliedMessageOwner || !user) return "";
        if (sender.id === user.id && repliedMessageOwner.id === user.id) {
            return u("chat.message.replied.self_to_self");
        }
        if (sender.id === user.id && repliedMessageOwner.id !== user.id) {
            return u("chat.message.replied.self_to_other", {name: repliedMessageOwner.displayName});
        }
        if (sender.id !== user.id && repliedMessageOwner.id === user.id) {
            return u("chat.message.replied.other_to_self", {name: sender.displayName});
        }
        return u("chat.message.replied.other_to_other", {from: sender.displayName, to: repliedMessageOwner.displayName});
    }

    const getLeftMessageClass = () => {
        if (showAvatar && !showSenderName) {
            return "rounded-b-3xl rounded-tr-3xl rounded-tl-lg"
        } else if (!showAvatar && showSenderName) {
            return "rounded-t-3xl rounded-br-3xl rounded-bl-lg"
        } else if (showAvatar && showSenderName) {
            return "rounded-3xl"
        }
        return "rounded-r-3xl rounded-l-lg"
    }

    return (
        <div
            key={message.id}
            className={"flex flex-col gap-0.5 w-full"}
        >
            {(repliedMoment) && (
                <div className={"w-full max-w-[500px] md:max-w-[60%] aspect-square self-start relative"}>
                    <Image
                        src={repliedMoment.mediaUrl ?? "/assets/images/avatar.png"}
                        alt={repliedMoment.caption ?? ""}
                        fill
                        className={"rounded-3xl object-cover"}
                    />
                    {repliedMomentOwner && (
                        <div className={"absolute left-0 top-0 p-1"}>
                            <div className={"p-1 bg-bg-dark-100/70 rounded-full flex flex-row items-center"}>
                                <div
                                    className={"w-fit h-fit rounded-full"}
                                >
                                    <Image
                                        src={repliedMomentOwner.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt={repliedMomentOwner.displayName}
                                        sizes={"32px"}
                                        width={32}
                                        height={32}
                                        className={"object-cover rounded-full"}
                                    />
                                </div>
                                <p
                                    className={"px-1.5 text-fg-light-100 font-medium truncate whitespace-nowrap overflow-hidden"}
                                >
                                    {repliedMomentOwner.id === user?.id ? u("home.you") : repliedMomentOwner.displayName}
                                </p>

                                <p className={"font-medium text-fg-light-200 pr-1 shrink-0"}>
                                    {formatSmartDateTime(repliedMoment.createdAt)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div
                key={message.id}
                className={`group flex flex-col self-start gap-1 w-full ${(showAvatar && index !== messagesLength - 1) && "mb-3"}`}
            >
                <div
                    className={"flex flex-row gap-1 max-w-[80%] items-end self-start"}
                >
                    <div className={"size-8 shrink-0 relative rounded-full"}>
                        {showAvatar &&
                            <Image
                                src={sender.avatarUrl || "/assets/images/avatar.png"}
                                alt={sender.displayName ?? "unknow"}
                                sizes={"16px"}
                                fill
                                className="rounded-full object-cover"
                            />
                        }
                    </div>
                    <div className={"flex flex-col gap-0.5"}>
                        {(showSenderName && conversationType !== ConversationType.PRIVATE) && (
                            <div className={"text-sm px-2"}>
                                <p>{sender.displayName}</p>
                            </div>
                        )}
                        <div className={"flex flex-col relative"}>
                            {repliedMessage && (
                                <div className={"flex flex-col gap-0.5 pt-0.5 -mb-4 self-start"}>
                                    <div className={"overflow-hidden pl-2 self-center items-center gap-0.5 flex flex-row"}>
                                        <Reply className={"size-4"}/>
                                        <p className={"truncate text-sm text-foreground-200"}>
                                            {getReplyInfo()}
                                        </p>
                                    </div>
                                    <button
                                        className={`w-fit self-start pb-5 ${onlyEmoji ? "text-3xl" : "px-3 py-1.5 bg-background-m "} rounded-r-3xl rounded-tl-3xl`}
                                        onClick={() => handleSearchRepliedMessage(repliedMessage?.id)}
                                    >
                                        <p>{repliedMessage.text}</p>
                                    </button>
                                </div>

                            )}
                            <div className={"flex flex-row items-center relative"}>
                                <div id={`message-${message.id}`} className={`rounded-3xl relative ${onlyEmoji ? "text-3xl" : "px-3 py-1.5 bg-foreground text-background"} ${getLeftMessageClass()}`}>
                                    <p>{message.text}</p>
                                </div>
                                <div
                                    className="hidden md:flex md:flex-row opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full h-full items-center px-0.5 z-10"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                        }}
                                        className={"rounded-full hover:bg-background-200 size-7 p-1 text-foreground-200"}
                                    >
                                        <Smile className={"size-5 stroke-2"}/>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReply(message)
                                        }}
                                        className={"rounded-full hover:bg-background-200 ml-0.5 size-7 p-1 text-foreground-200"}

                                    >
                                        <Reply className={"size-5"}/>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                        }}
                                        className={"rounded-full hover:bg-background-200 size-7 p-1 text-foreground-200"}

                                    >
                                        <EllipsisVertical className={"size-5"}/>
                                    </button>

                                </div>
                            </div>

                        </div>

                    </div>

                </div>
                <ReadersRow
                    readers={readers}
                    index={index}
                    messagesLength={messagesLength}
                    lastReadMessageIndex={lastReadMessageIndex}
                />
            </div>
        </div>
    )
}

export default OtherMessage;