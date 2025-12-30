import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {MessageLoadDirection} from "@/types/conversations";

interface ConversationKeysetParams {
    cursorLastSentAt?: string;
    cursorId?: string;
    size?: number;
}

export const fetchConversations = async ({
                                             cursorLastSentAt,
                                             cursorId,
                                             size = 20,
                                         }: ConversationKeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONVERSATIONS.FETCH_CONVERSATIONS, {
        params: { cursorLastSentAt, cursorId, size },
    });
    return response.data;
}

export const fetchConversation = async (conversationId: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONVERSATIONS.FETCH_CONVERSATION(conversationId))
    return response.data;
}

interface MessageKeysetParams {
    cursorCreatedAt?: string;
    cursorId?: string;
    direction?: MessageLoadDirection;
    messageId?: string;
    size?: number;
}

export const fetchMessages = async (
    conversationId: string,
    {
        cursorCreatedAt,
        cursorId,
        direction,
        messageId,
        size
    }: MessageKeysetParams
) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONVERSATIONS.FETCH_MESSAGES(conversationId), {
        params: {
            cursorCreatedAt,
            cursorId,
            direction,
            messageId,
            size
        },
    })
    return response.data;
}