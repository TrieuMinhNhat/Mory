import {UserPreview} from "@/types/user";

export interface Conversation {
    id: string,
    type: ConversationType,
    status: ConversationStatus,
    title: string,
    lastMessage?: ChatMessage,
    lastMessageSentAt: string,
    members: ConversationMember[],
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    repliedMessage?: RepliedMessage;
    repliedMoment?: RepliedMoment;
    createdAt: string;
    lastModifiedAt: string;
}

export interface RepliedMessage {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string;
    lastModifiedAt: string;
}

export interface RepliedMoment {
    id: string;
    userId: string;
    mediaUrl: string;
    caption: string;
    createdAt: string;
}

export interface ConversationMember {
    user: UserPreview,
    role: ConversationMemberRole,
    lastReadMessageId: string,
    lastReadAt: string,
    unreadCount: number
}

export interface ChatMessageRequest {
    conversationId?: string,
    text: string,
    recipientId?: string,
    replyToMessageId?: string,
    replyToMomentId?: string,
}

export enum ConversationMemberRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export enum ConversationType {
    PRIVATE = "PRIVATE",
    GROUP = "GROUP",
}

export enum ConversationStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    INACTIVE = "INACTIVE",
}

export interface UnreadCountData {
    conversationId: string,
    userId: string,
    unreadCount: number
}

export interface LastReadState {
    conversationId: string,
    userId: string,
    lastReadMessageId: string,
    lastReadAt: string,
}

export enum MessageLoadDirection {
    OLDER = "OLDER",
    NEWER =  "NEWER",
}