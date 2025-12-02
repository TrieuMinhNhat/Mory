import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {ConnectionStatus, ConnectionType} from "@/types/connections";

interface KeysetParams {
    cursorCreatedAt?: string;
    cursorId?: string;
    size?: number;
    type?: string;
    status?: ConnectionStatus;
}

export const fetchReceivedRequest = async ({
                                               cursorCreatedAt,
                                               cursorId,
                                               size = 10,
                                               type,
                                           }: KeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONNECTIONS.FETCH_RECEIVED_REQUESTS, {
        params: { cursorCreatedAt, cursorId, size, type },
    });
    return response.data;
};

export const fetchSentRequest = async ({
                                           cursorCreatedAt,
                                           cursorId,
                                           size = 10,
                                           type,
                                       }: KeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONNECTIONS.FETCH_SENT_REQUESTS, {
        params: { cursorCreatedAt, cursorId, size, type },
    });
    return response.data;
};

export const fetchSuggestedConnections = async ({
                                                    cursorCreatedAt,
                                                    cursorId,
                                                    size = 10,
                                                }: KeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONNECTIONS.FETCH_SUGGESTED_CONNECTIONS, {
        params: { cursorCreatedAt, cursorId, size },
    });
    return response.data;
};

export const fetchUserConnections = async (
    id: string,
    { cursorCreatedAt, cursorId, size = 10, type, status }: KeysetParams
) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONNECTIONS.FETCH_USER_CONNECTIONS(id), {
        params: { cursorCreatedAt, cursorId, size , type, status},
    });
    return response.data;
};

export const fetchConnections = async (
    userIds: string[]
) => {
    const requestBody = {
        userIds: userIds,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.CONNECTIONS.FETCH_CONNECTIONS,
        requestBody
    )
    return response.data;
}

export const fetchUserInviteLink = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.CONNECTIONS.FETCH_USER_INVITE_LINK);
    return response.data;
}

interface FetchUserProfileByInviteTokenParams {
    code: string;
    userId: string;
}

export const fetchUserProfileByInviteToken = async ({ code, userId }: FetchUserProfileByInviteTokenParams) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.CONNECTIONS.FETCH_USER_PROFILE_BY_INVITE_TOKEN,
        {
            params: { code, userId },
        }
    );

    return response.data;
};

interface SendConnectRequestBody {
    recipientId: string;
    code?: string;
    message?: string;
}

export const sendConnectRequest = async ({recipientId, code, message}:SendConnectRequestBody) => {
    const requestBody = {
        recipientId: recipientId,
        code: code,
        message: message,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.CONNECTIONS.REQUEST.SEND_CONNECT_REQUEST,
        requestBody
    );
    return response.data;
}

export const acceptConnectRequest = async (requestId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.REQUEST.ACCEPT_CONNECT_REQUEST(requestId));
    return response.data;
}

export interface SendChangeConnectionTypeRequestBody {
    recipientId: string;
    newType: ConnectionType;
    message: string;
}

export const sendChangeConnectionTypeRequest = async (data: SendChangeConnectionTypeRequestBody) => {
    const requestBody = {
        recipientId: data.recipientId,
        newType: data.newType,
        message: data.message,
    }
    const response = await axiosInstance.patch(
        API_ENDPOINTS.USER.CONNECTIONS.REQUEST.SEND_CHANGE_TYPE_REQUEST,
        requestBody
    );
    return response.data;
}

export const acceptChangeConnectionTypeRequest = async (requestId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.REQUEST.ACCEPT_CHANGE_TYPE_REQUEST(requestId));
    return response.data;
}

export interface DowngradeConnectionTypeRequest {
    recipientId: string;
    newType: ConnectionType;
}

export const downgradeConnectionType = async (data: DowngradeConnectionTypeRequest) => {
    const requestBody = {
        recipientId: data.recipientId,
        newType: data.newType
    }
    const response = await axiosInstance.patch(
        API_ENDPOINTS.USER.CONNECTIONS.DOWNGRADE_CONNECTION,
        requestBody
    );
    return response.data;
}

export const rejectRequest = async (requestId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.REQUEST.REJECT_REQUEST(requestId));
    return response.data;
}

export const cancelRequest = async (requestId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.REQUEST.CANCEL_REQUEST(requestId));
    return response.data;
}

export const blockUserConnection = async (targetUserId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.BLOCK_USER(targetUserId));
    return response.data;
}

export const unblockUserConnection = async (targetUserId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.UNBLOCK_USER(targetUserId));
    return response.data;
}

export const removeConnection = async (targetUserId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.CONNECTIONS.REMOVE_CONNECTION(targetUserId));
    return response.data;
}