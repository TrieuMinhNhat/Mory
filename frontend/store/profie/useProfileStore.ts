import {ApiResult} from "@/types/auth";
import {UpdateUserAvatarProps, UserProfile, UserProfileApiResponse} from "@/types/user";
import {createStore} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {fetchProfile, updateUserAvatar, updateUserInformation} from "@/lib/services/userProfile.service";
import {authStore} from "@/store/useAuthStore";
import {CompleteProfileFormValues, UpdateUserInformationFormValue} from "@/lib/validations/profile.validation";
import {completeProfile} from "@/lib/services/auth.service";
import { fetchMomentsByUserId } from "@/lib/services/moments.service";
import {Moment} from "@/types/moment";

interface ProfileState {
    // --- Complete profile ---
    isCompleteProfile: boolean;
    completeProfile: (data: CompleteProfileFormValues) => Promise<ApiResult>;

    // --- Update user info ---
    isUpdatingUserInfo: boolean;
    updateUserInfo: (requestBody: UpdateUserInformationFormValue) => Promise<ApiResult>;

    // --- Update user avatar ---
    isUpdatingUserAvatar: boolean;
    updateUserAvatar: (requestBody: UpdateUserAvatarProps) => Promise<ApiResult>;

    // --- Connection count ---
    isFetchingProfile: boolean;
    connectionCount: number | null;
    showCreatePassword: boolean;
    profileHasFetchedOnce: boolean;
    fetchProfile: () => Promise<ApiResult>;

    // --- User moments ---
    userMoments: Moment[];
    userMomentsHasNext: boolean;
    userMomentsCursorCreatedAt?: string;
    userMomentsCursorId?: string;
    userMomentsHasFetchedOnce: boolean;
    isFetchingUserMoments: boolean;
    fetchUserMoments: (
        userId: string,
        size?: number,
        order?: "ASC" | "DESC"
    ) => Promise<ApiResult>;
    addMoment: (moment: Moment) => void;
    updateMoment: (momentId: string, moment: Partial<Moment>) => void;
    removeMoment: (momentId: string) => void;
}

const profileStore = createStore<ProfileState>()((set, get) => ({
    // --- Complete profile ---
    isCompleteProfile: false,
    completeProfile: async (data): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isCompleteProfile", async () => {
            const response = await completeProfile(data);
            if (response.success) {
                const profile: UserProfile = response.data;
                const { user, setUser } = authStore.getState();
                if (user) {
                    setUser({ ...user, profile: profile });
                }
            }
            return { success: response.success, message: response.message };
        }, "Failed to complete information");
    },

    // --- Update user info ---
    isUpdatingUserInfo: false,
    updateUserInfo: async (requestBody) => {
        return runWithLoadingFlag(set, "isUpdatingUserInfo", async () => {
            const response = await updateUserInformation(requestBody);
            if (response.success) {
                const profile: UserProfileApiResponse = response.data;
                const { user, setUser } = authStore.getState();
                if (user) {
                    const updatedProfile = {
                        ...user.profile,
                        ...(profile.displayName ? { displayName: profile.displayName } : {}),
                        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
                    };

                    setUser({ ...user, profile: updatedProfile });
                }
            }
            return { success: response.success, message: response.message };
        }, "Failed to update information");
    },

    // --- Update user avatar ---
    isUpdatingUserAvatar: false,
    updateUserAvatar: async (requestBody) => {
        return runWithLoadingFlag(set, "isUpdatingUserAvatar", async () => {
            const response = await updateUserAvatar(requestBody);
            if (response.success) {
                const profile: UserProfileApiResponse = response.data;
                const { user, setUser } = authStore.getState();
                if (user) {
                    const updatedProfile = {
                        ...user.profile,
                        ...(profile.displayName ? { displayName: profile.displayName } : {}),
                        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
                    };

                    setUser({ ...user, profile: updatedProfile });
                }
            }
            return { success: response.success, message: response.message };
        }, "Failed to update avatar");
    },

    // --- Connection count ---
    isFetchingProfile: false,
    connectionCount: null,
    showCreatePassword: false,
    profileHasFetchedOnce: false,
    fetchProfile: async (): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isFetchingProfile", async () => {
            const { user } = authStore.getState();
            if (!user) {
                return { success: false, message: "User not authenticated" } as ApiResult;
            }
            const response = await fetchProfile(user.id);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            if (response.success) {
                set((state) => {
                    return {
                        connectionCount: response.data.connectionCount,
                        showCreatePassword: !response.data.hasEmailPasswordProvider,
                        profileHasFetchedOnce: state.profileHasFetchedOnce || true
                    }
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch connectionCount");
    },

    // --- User moments ---
    userMoments: [],
    userMomentsHasNext: false,
    userMomentsCursorCreatedAt: undefined,
    userMomentsCursorId: undefined,
    isFetchingUserMoments: false,
    userMomentsHasFetchedOnce: false,
    fetchUserMoments: async (userId: string, size = 20, order: "ASC" | "DESC" = "DESC") => {
        const { userMomentsCursorCreatedAt, userMomentsCursorId } = get();
        return runWithLoadingFlag(set, "isFetchingUserMoments", async () => {
            const response = await fetchMomentsByUserId(userId, {
                cursorCreatedAt: userMomentsCursorCreatedAt,
                cursorId: userMomentsCursorId,
                size,
                order,
            });

            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.userMoments.map((m) => m.id));
                    const newItems = response.data.moments.filter(
                        (m: Moment) => !existingIds.has(m.id)
                    );
                    console.log(response.data.moments)
                    return {
                        userMoments: [...state.userMoments, ...newItems],
                        userMomentsHasNext: response.data.hasNext,
                        userMomentsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        userMomentsCursorId: response.data.nextCursorId,
                        userMomentsHasFetchedOnce: state.userMomentsHasFetchedOnce || true
                    };
                });
            }

            return { success: response.success, message: response.message, data: response.data};
        }, "Failed to fetch user moments");
    },
    addMoment: (moment: Moment) => {
        set((state) => {
            const exists = state.userMoments.some(m => m.id === moment.id);
            if (exists) return {};
            return { userMoments: [moment, ...state.userMoments] };
        });
    },

    updateMoment: (momentId: string, partialMoment: Partial<Moment>) => {
        set((state) => ({
            userMoments: state.userMoments.map(m =>
                m.id === momentId ? { ...m, ...partialMoment } : m
            )
        }));
    },

    removeMoment: (momentId: string) => {
        set((state) => ({
            userMoments: state.userMoments.filter(m => m.id !== momentId)
        }));
    },
}));

export default profileStore;


const runWithLoadingFlag = async (
    set: (state: Partial<ProfileState>) => void,
    loadingKey: keyof ProfileState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<ProfileState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<ProfileState>);
    }
};

export const useProfileStore = <T>(
    selector: (state: ProfileState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(profileStore, selector, equals);