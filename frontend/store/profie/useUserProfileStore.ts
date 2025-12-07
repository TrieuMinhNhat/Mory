import {ApiResult} from "@/types/auth";
import { UserDetails } from "@/types/user";
import {createStore} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {fetchUserProfile} from "@/lib/services/userProfile.service";
import { fetchMomentsByUserId } from "@/lib/services/moments.service";
import {Moment, Story, StoryType} from "@/types/moment";
import {Connection, ConnectionStatus, ConnectionType, getOtherUserFromConnection} from "@/types/connections";
import {fetchUserConnections} from "@/lib/services/connections.service";
import {fetchStoriesByUser} from "@/lib/services/stories.service";

interface UserProfileState {

    // --- UserDetails ---
    currentUserId: string | null;
    userDetails: UserDetails | null;
    error: boolean;
    isFetchingUserDetails: boolean;
    userDetailsHasFetchedOnce: boolean;
    fetchUserDetails: (userId: string) => Promise<ApiResult>;

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

    // --- User connections ---
    userConnections: Connection[],
    connectionTypeFilter: ConnectionType | undefined,
    userConnectionsHasNext: boolean,
    userConnectionsCursorCreatedAt?: string,
    userConnectionsCursorId?: string,
    isFetchingUserConnections: boolean,
    userConnectionsHasFetchedOnce: boolean,
    fetchUserConnections: (
        userId: string,
        params? : {
            size?: number,
            type?: ConnectionType,
            status?: ConnectionStatus,
        }) => Promise<ApiResult>;


    // --- User stories ---
    userStories: Story[];
    storyTypeFilter: StoryType | undefined;
    userStoriesHasNext: boolean;
    userStoriesCursorCreatedAt?: string;
    userStoriesCursorId?: string;
    isFetchingUserStories: boolean;
    userStoriesHasFetchedOnce: boolean;
    fetchUserStories: (
        userId: string,
        params?: {
            size?: number;
            type?: StoryType;
            order?: "ASC" | "DESC";
            reset?: boolean;
        }) => Promise<ApiResult>;
    
    // --- Utils ---
    resetStore: () => void;
    resetMoments: () => void;
    resetStories: () => void;
    updateUserDetailsConnection: (userId: string, partialConnection: Partial<Connection>) => void;
    updateUserConnection: (targetUserId: string, partialConnection: Partial<Connection>) => void;
}

const userProfileStore = createStore<UserProfileState>()((set, get) => {
    const userDetailsInitialState = {
        currentUserId: null,
        error: false,
        userDetails: null,
        isFetchingUserDetails: false,
        userDetailsHasFetchedOnce: false,
    }

    const userMomentsInitialState = {
        userMoments: [],
        userMomentsHasNext: true,
        userMomentsCursorCreatedAt: undefined,
        userMomentsCursorId: undefined,
        userMomentsHasFetchedOnce: false,
        isFetchingUserMoments: false,
    }

    const userConnectionsInitialState = {
        userConnections: [],
        connectionTypeFilter:  undefined,
        userConnectionsHasNext: true,
        userConnectionsCursorCreatedAt: undefined,
        userConnectionsCursorId: undefined,
        isFetchingUserConnections: false,
        userConnectionsHasFetchedOnce: false,
    }

    const userStoriesInitialState = {
        userStories: [],
        storyTypeFilter:  undefined,
        userStoriesHasNext: true,
        userStoriesCursorCreatedAt: undefined,
        userStoriesCursorId: undefined,
        isFetchingUserStories: false,
        userStoriesHasFetchedOnce: false,
    }
    return {
        // --- User Details ---
        ...userDetailsInitialState,
        fetchUserDetails: async (userId): Promise<ApiResult> => {
            if (userId !== get().currentUserId) get().resetStore()
            set({currentUserId: userId})
            return runWithLoadingFlag(set, "isFetchingUserDetails", async () => {
                const response = await fetchUserProfile(userId);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                if (response.success) {
                    set({
                        userDetails: response.data,
                        userDetailsHasFetchedOnce: true,
                    });
                } else {
                    set({
                        error: true
                    })
                }
                return { success: response.success, message: response.message };
            }, "Failed to fetch connectionCount");
        },

        // --- User moments ---
        ...userMomentsInitialState,
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

        // --- User connections ---
        ...userConnectionsInitialState,
        fetchUserConnections: async (
            userId,
            {
                size = 50,
                type,
                status = ConnectionStatus.CONNECTED
            } : {
                size?: number,
                type?: ConnectionType,
                status?: ConnectionStatus,
            } = {}
        ) => {
            const { userConnectionsCursorCreatedAt, userConnectionsCursorId } = get();

            set({connectionTypeFilter: type})


            return runWithLoadingFlag(set, "isFetchingUserConnections", async () => {
                const response = await fetchUserConnections(userId, {
                    cursorCreatedAt: userConnectionsCursorCreatedAt,
                    cursorId: userConnectionsCursorId,
                    size,
                    type,
                    status
                });

                await new Promise(resolve => setTimeout(resolve, 1500));

                if (response.success) {
                    set((state) => {
                        const existingIds = new Set(state.userConnections.map(c => c.id));
                        const newItems = (response.data.connections ?? []).filter((c: Connection) => !existingIds.has(c.id));
                        return {
                            userConnections: [...state.userConnections, ...newItems],
                            userConnectionsHasNext: response.data.hasNext,
                            userConnectionsCursorCreatedAt: response.data.nextCursorCreatedAt,
                            userConnectionsCursorId: response.data.nextCursorId,
                            userConnectionsHasFetchedOnce: state.userConnectionsHasFetchedOnce || true
                        };
                    });
                }
                return { success: response.success, message: response.message };
            }, "Failed to fetch user connections");
        },

        // --- User stories ---
        ...userStoriesInitialState,

        fetchUserStories: async (
            userId: string,
            {
                size = 20,
                type = undefined,
                order = "DESC",
                reset = false,
            }: {
                size?: number;
                type?: StoryType;
                order?: "ASC" | "DESC";
                reset?: boolean;
            } = {}
        ) => {
            if (reset) get().resetStories()
            const { userStoriesCursorCreatedAt, userStoriesCursorId } = get();
            set({storyTypeFilter: type})
            return runWithLoadingFlag(set, "isFetchingUserStories", async () => {
                const response = await fetchStoriesByUser(userId, {
                    cursorCreatedAt: userStoriesCursorCreatedAt,
                    cursorId: userStoriesCursorId,
                    size,
                    type,
                    order,
                });

                await new Promise((r) => setTimeout(r, 1000));

                if (response.success) {
                    set((state) => {
                        const existingIds = new Set(state.userStories.map((s) => s.id));
                        const newStories = response.data.stories.filter(
                            (s: Story) => !existingIds.has(s.id)
                        );

                        return {
                            userStories: [...state.userStories, ...newStories],
                            userStoriesHasNext: response.data.hasNext,
                            userStoriesCursorCreatedAt: response.data.nextCursorCreatedAt,
                            userStoriesCursorId: response.data.nextCursorId,
                            userStoriesHasFetchedOnce: state.userStoriesHasFetchedOnce || true
                        };
                    });
                }
                return { success: response.success, message: response.message };
            }, "Failed to fetch stories");
        },
        
        resetStore: () => {
            set({
                ...userDetailsInitialState,
                ...userMomentsInitialState,
                ...userConnectionsInitialState,
                ...userStoriesInitialState
            })
        },
        resetMoments: () => {
            set({
                ...userMomentsInitialState
            })
        },
        resetStories: () => {
            set({
                ...userStoriesInitialState
            })
        },
        updateUserDetailsConnection: (userId: string, partialConnection: Partial<Connection>) => {
            set((state) => {
                if (
                    state.currentUserId === userId && state.userDetails
                ) {
                    return {
                        userDetails: {
                            ...state.userDetails,
                            connection: {
                                ...state.userDetails.connection,
                                ...partialConnection,
                            },
                        },
                    };
                }
                return {};
            });
        },
        updateUserConnection: (targetUserId: string, partialConnection: Partial<Connection>) => {
            set((state) => ({
                userConnections: state.userConnections.map(c =>
                    getOtherUserFromConnection(c).id === targetUserId
                        ? { ...c, ...partialConnection }
                        : c
                )
            }));
        },
    }
});

export default userProfileStore;


const runWithLoadingFlag = async (
    set: (state: Partial<UserProfileState>) => void,
    loadingKey: keyof UserProfileState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<UserProfileState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<UserProfileState>);
    }
};

export const useUserProfileStore = <T>(
    selector: (state: UserProfileState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(userProfileStore, selector, equals);