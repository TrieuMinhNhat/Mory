import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import { RoleCode} from "@/types/adminUser";

export interface FetchUsersParams {
    page?: number;
    size?: number;
    keyword?: string;
    role?: RoleCode;
    active?: boolean;
    sortBy?: string;
    direction?: "acs" | "desc";
}

export const fetchUsers = async (params: FetchUsersParams = {}) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.FETCH_USERS,
        {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10,
                keyword: params.keyword ?? "",
                role: params.role,
                active: params.active,
                sortBy: params.sortBy ?? "createdAt",
                direction: params.direction ?? "desc",
            },
        }
    );
    return response.data;
};

export const fetchUserStats = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.FETCH_USERS_STATS);
    return response.data;
}
export interface BlockUserParams {
    userId: string;
    blockLevel: string;
}

export const blockUser = async (params: BlockUserParams) => {
    const requestBody = {
        blockLevel: params.blockLevel,
    }
    const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.BLOCK_USER(params.userId), requestBody);
    return response.data;
}

export const unblockUser = async ({userId}: {userId: string}) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId))
    return response.data;
}

export interface FetchUserStatsDailyParams {
    startDate: string;
    endDate: string;
}

export const fetchUserStatsDaily = async (params: FetchUserStatsDailyParams) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.FETCH_USERS_STATS_DAILY,
        {
            params: params
        }
    );
    return response.data;
}