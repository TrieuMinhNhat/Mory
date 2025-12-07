import {StatRow, AdminUser, UsersStat} from "@/types/adminUser";
import {ApiResult} from "@/types/auth";
import {createStore} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {
    blockUser,
    BlockUserParams,
    fetchUsers,
    FetchUsersParams,
    fetchUserStats, fetchUserStatsDaily,
    FetchUserStatsDailyParams,
    unblockUser
} from "@/lib/services/adminUser.service";

interface AdminUserState {
    users: AdminUser[];
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    isLoading: boolean;
    userStatsDaily: StatRow[];
    isFetchingUserStatsDaily: boolean;
    userStatsSummary: UsersStat | null;
    fetchUsers: (params: FetchUsersParams) => Promise<ApiResult>;
    fetchUserStatsSummary: () => Promise<ApiResult>;
    blockUser: (params: BlockUserParams) => Promise<ApiResult>;
    unblockUser: ({userId}: {userId: string}) => Promise<ApiResult>;
    fetchUserStatsDaily: (params: FetchUserStatsDailyParams) => Promise<ApiResult>;
}


const adminUserStore = createStore<AdminUserState>()((set) => ({
    users: [],
    isLoading: false,
    totalPages: 1,
    currentPage: 0,
    hasNext: false,
    userStatsSummary: null,
    userStatsDaily: [],
    isFetchingUserStatsDaily: false,
    fetchUsers: async (params: FetchUsersParams): Promise<ApiResult> => {
        return runWithGlobalLoading(set, async () => {
            const response = await fetchUsers(params);
            if (response.success) {
                const users = response.data.users;
                set({
                    users: users,
                    currentPage: response.data.currentPage,
                    totalPages: response.data.totalPages,
                    hasNext: response.data.hasNext
                });
            }

            return {success: response.success, message: response.message}
        }, "Failed to get users");
    },
    fetchUserStatsSummary: async (): Promise<ApiResult> => {
        return runWithGlobalLoading(set, async () => {
            const response = await fetchUserStats();
            if (response.success) {
                set({userStatsSummary: response.data});
            }
            return {success: response.success, message: response.message}
        }, "Failed to get users Stats");
    },
    blockUser: async (params: BlockUserParams): Promise<ApiResult> => {
        return runWithGlobalLoading(set, async () => {
            const response = await blockUser(params);
            if (response.success) {
                set(state => ({
                    users: state.users.map(user =>
                        user.id === params.userId
                            ? {...user, isBlocked: true}
                            : user
                    )
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to block user")
    },
    unblockUser: async ({userId}: {userId: string}): Promise<ApiResult> => {
        return runWithGlobalLoading(set, async () => {
            const response = await unblockUser({userId});
            if (response.success) {
                set(state => ({
                    users: state.users.map(user =>
                        user.id === userId
                            ? {...user, isBlocked: false}
                            : user
                    )
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to unblock user")
    },
    fetchUserStatsDaily: async (params: FetchUserStatsDailyParams): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isFetchingUserStatsDaily", async () => {
            const response = await fetchUserStatsDaily(params);
            if (response.success) {
                const statRows = response.data;
                set({userStatsDaily: statRows});
            }
            return {success: response.success, message: response.message}
        }, "Failed to get usersStatsDaily");
    }
}))

const runWithGlobalLoading = async (
    set: (state: Partial<AdminUserState>) => void,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
): Promise<ApiResult> => {
    set({isLoading: true});
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        return { success: false, message: fallbackMessage};
    } finally {
        set({isLoading: false});
    }
}

const runWithLoadingFlag = async (
    set: (state: Partial<AdminUserState>) => void,
    loadingKey: keyof AdminUserState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<AdminUserState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<AdminUserState>);
    }
};

export const useAdminUserStore = <T>(
    selector: (state: AdminUserState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(adminUserStore, selector, equals);