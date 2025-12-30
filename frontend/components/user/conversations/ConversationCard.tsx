import React from "react";
import ConversationAvatars, {
    getOtherUserFromPrivateConversation
} from "@/components/user/conversations/ConversationAvatars";
import {Conversation, ConversationType} from "@/types/conversations";
import {useAuthStore} from "@/store/useAuthStore";
import {useTranslation} from "next-i18next";
import {usePathname, useRouter} from "next/navigation";
import {useCurrentConversationStore} from "@/store/conversation/useCurrentConversationStore";
import {ROUTES} from "@/constants/routes";
import {formatSmartDateTime} from "@/utils/time";
import {useLocaleFromRoute} from "@/utils/locale";

interface ConversationCardProps {
    conversation: Conversation;
}

const ConversationCard = ({conversation}: ConversationCardProps) => {
    const {t: u} = useTranslation("user");
    const router = useRouter();

    const pathname = usePathname();

    const locale = useLocaleFromRoute(pathname);

    const user = useAuthStore((state) => state.user);
    const setCurrentConversation = useCurrentConversationStore((state) => state.setCurrentConversation);

    if (!user) return;
    const otherUser = getOtherUserFromPrivateConversation(conversation, user.id)
    const myMember = conversation.members.find(member => member.user.id === user.id);

    const previewText = () => {
        if (myMember?.unreadCount && myMember.unreadCount > 1 )
            return `${myMember?.unreadCount} ` + u("chat.message.new_messages")

        if (!conversation.lastMessage) return;
        if (conversation.lastMessage.senderId === user.id )
            return `${u("home.you")}: ${conversation.lastMessage.text}`

        if (conversation.type === ConversationType.GROUP) {
            const sender = conversation.members.find(member => member.user.id === user.id)?.user;
            if (sender) return `${sender.displayName}: ${conversation.lastMessage.text}`
        }
        return conversation.lastMessage.text;
    }
    return (
        <button
            onClick={() => {
                setCurrentConversation(conversation);
                router.push(ROUTES.CHAT.CONVERSATION(conversation.id))
            }}
            className={`w-full p-2 flex rounded-xl hover:bg-background-200 flex-row items-center gap-2`}
        >
            <ConversationAvatars conversation={conversation}/>
            <div
                className={"w-full h-full flex flex-col justify-center items-center overflow-hidden"}
            >
                <div className="flex flex-row w-full items-center gap-2">
                    <h2 className="flex-1 truncate font-medium text-left">
                        {conversation.type === ConversationType.PRIVATE
                            ? otherUser?.displayName
                            : conversation.title
                        }
                    </h2>
                    <p className={"text-sm text-foreground-200"}>
                        {conversation.lastMessageSentAt && (formatSmartDateTime(conversation.lastMessageSentAt, locale))}
                    </p>
                </div>
                <div className="flex flex-row w-full items-center gap-2">
                    <p className={`flex-1 truncate text-left ${(myMember?.unreadCount && myMember.unreadCount > 0) ? "text-foreground font-medium" : "text-foreground-200"}`}>
                        {previewText()}
                    </p>
                    {(myMember?.unreadCount && myMember.unreadCount > 0) ? (
                        <div className={"size-2.5 rounded-full bg-primary"}/>
                    ) : (
                        <></>
                    )}
                    <div />
                </div>
            </div>
        </button>
    )
}




export default ConversationCard;

