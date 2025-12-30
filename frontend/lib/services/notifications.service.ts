import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";

interface NotificationKeysetParams {
    cursorCreatedAt?: string;
    cursorId?: string;
    size?: number;
}

export const fetchNotifications = async ({
                                             cursorCreatedAt,
                                             size,
                                             cursorId
}: NotificationKeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.NOTIFICATIONS.FETCH_NOTIFICATIONS,
        {
            params: { cursorCreatedAt, cursorId, size },
        })
    return response.data;
}