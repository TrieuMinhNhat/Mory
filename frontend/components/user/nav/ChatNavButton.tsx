"use client"

import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import OChat from "@/components/shared/icons/OChat";
import React, {useMemo} from "react";
import {useConversationsStore} from "@/store/conversation/useConversationStore";
import {useAuthStore} from "@/store/useAuthStore";

const ChatNavButton = () => {
    const pathname = usePathname();
    const normalizedPath = "/" + pathname.split("/").slice(2).join("/");
    const linkClass = (href: string) => {
        return `rounded-full bg-transparent p-1 hover:bg-background-300 ${
            normalizedPath.startsWith(href)
                ? "text-primary"
                : "text-foreground-200 hover:text-foreground"
        }`;
    }
    const router = useRouter();

    const conversations = useConversationsStore((state) => state.conversations);
    const user = useAuthStore((state) => state.user);

    const totalUnreadCount = useMemo(() => {
        return conversations.reduce((total, conversation) => {
            const member = conversation.members?.find(m => m.user.id === user?.id);
            return total + (member?.unreadCount || 0);
        }, 0);
    }, [conversations, user?.id]);
    return (
        <button
            className={"relative"}
            onClick={() => router.push(ROUTES.CHAT.ROOT)}
        >
            <div
                className={linkClass(ROUTES.CHAT.ROOT)}
            >
                <OChat className={"size-6"}/>
            </div>
            {totalUnreadCount > 0 && (
                <div className={"absolute top-0 right-0 bg-error flex items-center justify-center rounded-full size-5 text-xs text-fg-light-100"}>
                    {totalUnreadCount < 10 ? (
                        <p>
                            {totalUnreadCount}
                        </p>
                    ) : (
                        <p>
                            +{9}
                        </p>
                    )}
                </div>
            )}
        </button>
    )
}

export default ChatNavButton;