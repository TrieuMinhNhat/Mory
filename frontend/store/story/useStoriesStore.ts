import {createStore, StoreApi} from "zustand/vanilla";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { ApiResult } from "@/types/auth";
import {
    addStoryMembers,
    createAlbumStory,
    CreateAlbumStoryRequestBody, createBeforeAfterStory,
    CreateBeforeAfterStoryRequestBody, createChallengeStory, CreateChallengeStoryRequestBody, createJourneyStory,
    CreateJourneyStoryRequestBody, deleteStory, dissolveStory,
    fetchAvailableStories,
    fetchStoriesByUser,
    kickStoryMembers,
    KickStoryMembersRequestBody, leaveStory, updateStory,
    UpdateStoryRequestBody
} from "@/lib/services/stories.service";
import { authStore } from "@/store/useAuthStore";
import {Story, StoryType} from "@/types/moment";
import {LeaveStoryAction} from "@/types/story";
import storyDetailsStore from "@/store/story/useStoryDetailsStore";
import {homeFeedsStore} from "@/store/useHomeFeedsStore";
import {ConnectionTypeStatus} from "@/types/connections";
import {UserPreview} from "@/types/user";

interface StoriesState {
    // --- Stories list ---
    stories: Story[];
    typeFilter: StoryType | undefined;
    storiesHasNext: boolean;
    storiesCursorCreatedAt?: string;
    storiesCursorId?: string;
    isFetchingStories: boolean;
    storiesHasFetchedOnce: boolean;
    fetchStories: (userId?: string, params?: { size?: number; type?: StoryType; order?: "ASC" | "DESC"; reset: boolean }) => Promise<ApiResult>;

    // --- Available Story
    availableStories: Story[];
    availableStoriesHasNext: boolean;
    availableStoriesCursorCreatedAt?: string;
    availableStoriesCursorId?: string;
    isFetchingAvailableStories: boolean;
    availableStoriesHasFetchedOnce: boolean;
    fetchAvailableStories: (params?: { size?: number; type?: StoryType; order?: "ASC" | "DESC" }) => Promise<ApiResult>;

    // --- Create Story
    isCreatingStory: boolean;

    createJourneyStory: (data: CreateJourneyStoryRequestBody) => Promise<ApiResult>;
    createBeforeAfterStory: (data: CreateBeforeAfterStoryRequestBody) => Promise<ApiResult>;
    createChallengeStory: (data: CreateChallengeStoryRequestBody) => Promise<ApiResult>;
    createAlbumStory: (data: CreateAlbumStoryRequestBody) => Promise<ApiResult>;

    processingStoryIds: Set<string>;

    dissolveStory: (storyId: string) => Promise<ApiResult>;
    deleteStory: (storyId: string) => Promise<ApiResult>;
    leaveStory: (storyId: string, leaveStoryAction: LeaveStoryAction) => Promise<ApiResult>;
    addStoryMembers: (storyId: string, data: Map<string, ConnectionTypeStatus>) => Promise<ApiResult>;

    processingMemberIds: Set<string>;
    kickStoryMembers: (storyId: string, data: KickStoryMembersRequestBody) => Promise<ApiResult>;
    updateStory: (storyId: string, data: UpdateStoryRequestBody) => Promise<ApiResult>;

    // --- Utils ---
    updateStoryInList: (storyId: string, data: Partial<Story>) => void;
    resetStories: () => void;
    resetAvailableStories: () => void;
}

const storiesStore = createStore<StoriesState>()((set, get) => ({
    // --- Stories ---
    stories: [],
    typeFilter: undefined,
    storiesHasNext: false,
    storiesCursorCreatedAt: undefined,
    storiesCursorId: undefined,
    storiesHasFetchedOnce: false,
    isFetchingStories: false,

    fetchStories: async (
        userId?: string,
        {
            size = 20,
            type = undefined,
            order = "DESC",
            reset = false,
        }: {
            size?: number;
            type?: StoryType;
            order?: "ASC" | "DESC";
            reset: boolean;
        } = {reset: false}
    ) => {
        if (reset) get().resetStories();

        const { storiesCursorCreatedAt, storiesCursorId } = get();

        set({typeFilter: type})

        const { user } = authStore.getState();

        const targetUserId = userId || user?.id;
        if (!targetUserId) return { success: false, message: "User not authenticated" };

        return runWithLoadingFlag(set, "isFetchingStories", async () => {
            const response = await fetchStoriesByUser(targetUserId, {
                cursorCreatedAt: storiesCursorCreatedAt,
                cursorId: storiesCursorId,
                size,
                type,
                order,
            });

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.stories.map((s) => s.id));
                    const newStories = response.data.stories.filter(
                        (s: Story) => !existingIds.has(s.id)
                    );

                    return {
                        stories: [...state.stories, ...newStories],
                        storiesHasNext: response.data.hasNext,
                        storiesCursorCreatedAt: response.data.nextCursorCreatedAt,
                        storiesCursorId: response.data.nextCursorId,
                        storiesHasFetchedOnce: state.storiesHasFetchedOnce || true
                    };
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch stories");
    },

    // --- Available Stories ---
    availableStories: [],
    availableStoriesHasNext: false,
    availableStoriesCursorCreatedAt: undefined,
    availableStoriesCursorId: undefined,
    availableStoriesHasFetchedOnce: false,
    isFetchingAvailableStories: false,

    fetchAvailableStories: async (
        { size = 20, type, order = "DESC" } = {}
    ) => {
        const { availableStoriesCursorCreatedAt, availableStoriesCursorId } = get();

        return runWithLoadingFlag(set, "isFetchingAvailableStories", async () => {
            const response = await fetchAvailableStories({
                cursorCreatedAt: availableStoriesCursorCreatedAt,
                cursorId: availableStoriesCursorId,
                size,
                type,
                order,
            });

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.availableStories.map((s) => s.id));
                    const newStories = response.data.stories.filter(
                        (s: Story) => !existingIds.has(s.id)
                    );

                    return {
                        availableStories: [...state.availableStories, ...newStories],
                        availableStoriesHasNext: response.data.hasNext,
                        availableStoriesCursorCreatedAt: response.data.nextCursorCreatedAt,
                        availableStoriesCursorId: response.data.nextCursorId,
                        availableStoriesHasFetchedOnce: true,
                    };
                });
            }

            return { success: response.success, message: response.message };
        }, "Failed to fetch available stories");
    },

    // --- Create Story ---
    isCreatingStory: false,

    createJourneyStory: async (data) => {
        return runWithLoadingFlag(
            (partial) => set({ ...partial, isCreatingStory: partial.isCreatingStory }),
            "isCreatingStory",
            async () => {
                const response = await createJourneyStory(data);

                await new Promise((r) => setTimeout(r, 1000));

                if (response.success && response.data) {
                    set((state) => addStoryIfNotExist(state, response.data as Story));
                }
                return { success: response.success, message: response.message };
            },
            "Failed to create story"
        );
    },

    createBeforeAfterStory: async (data) => {
        return runWithLoadingFlag(
            (partial) => set({ ...partial, isCreatingStory: partial.isCreatingStory }),
            "isCreatingStory",
            async () => {
                const response = await createBeforeAfterStory(data);

                await new Promise((r) => setTimeout(r, 1000));

                if (response.success && response.data) {
                    set((state) => addStoryIfNotExist(state, response.data as Story));
                }
                return { success: response.success, message: response.message };
            },
            "Failed to create story"
        );
    },

    createChallengeStory: async (data) => {
        return runWithLoadingFlag(
            (partial) => set({ ...partial, isCreatingStory: partial.isCreatingStory }),
            "isCreatingStory",
            async () => {
                const response = await createChallengeStory(data);

                await new Promise((r) => setTimeout(r, 1000));

                if (response.success && response.data) {
                    set((state) => addStoryIfNotExist(state, response.data as Story));
                }
                return { success: response.success, message: response.message };
            },
            "Failed to create story"
        );
    },

    createAlbumStory: async (data) => {
        return runWithLoadingFlag(
            (partial) => set({ ...partial, isCreatingStory: partial.isCreatingStory }),
            "isCreatingStory",
            async () => {
                const response = await createAlbumStory(data);

                await new Promise((r) => setTimeout(r, 1000));

                if (response.success && response.data) {
                    set((state) => addStoryIfNotExist(state, response.data as Story));
                }
                return { success: response.success, message: response.message };
            },
            "Failed to create story"
        );
    },

    // --- Processing IDs ---
    processingStoryIds: new Set<string>(),

    // --- Story actions ---
    dissolveStory: async (storyId: string) => {
        return runWithLoadingSet(set, "processingStoryIds", async () => {
            const response = await dissolveStory(storyId);

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success) {
                set((state) => ({
                    stories: state.stories.filter((s) => s.id !== storyId),
                    availableStories: state.availableStories.filter((s) => s.id !== storyId),
                }));
                homeFeedsStore.getState().removeStoryFromHomeSlides(storyId);
            }
            return { success: response.success, message: response.message };
        }, storyId, "Failed to dissolve story");
    },

    deleteStory: async (storyId: string) => {
        return runWithLoadingSet(set, "processingStoryIds", async () => {
            const response = await deleteStory(storyId);

            await new Promise((r) => setTimeout(r, 3000));

            if (response.success) {
                set((state) => ({
                    stories: state.stories.filter((s) => s.id !== storyId),
                    availableStories: state.availableStories.filter((s) => s.id !== storyId),
                }));
                homeFeedsStore.getState().removeStoryFromHomeSlides(storyId);
            }
            return { success: response.success, message: response.message };
        }, storyId, "Failed to delete story");
    },

    leaveStory: async (storyId: string, leaveStoryAction) => {
        return runWithLoadingSet(set, "processingStoryIds", async () => {
            const response = await leaveStory(storyId, leaveStoryAction);

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success) {
                set((state) => ({
                    stories: state.stories.filter((s) => s.id !== storyId),
                    availableStories: state.availableStories.filter((s) => s.id !== storyId),
                }));
                homeFeedsStore.getState().removeStoryFromHomeSlides(storyId);
            }
            return { success: response.success, message: response.message };
        }, storyId, "Failed to leave story");
    },

    addStoryMembers: async (storyId: string, data: Map<string, ConnectionTypeStatus>) => {
        return runWithLoadingSet(set, "processingStoryIds", async () => {
            const memberIds = Array.from(data.keys());
            const response = await addStoryMembers(storyId, {newMemberIds: memberIds});

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success && response.data) {
                const members = response.data.members as UserPreview[];
                get().updateStoryInList(storyId, {members: members})
                homeFeedsStore.getState().updateStoryInHomeSlides(storyId, {members: members})
                storyDetailsStore.getState().updateStory({members: members})
                members.map((m) => m.id).forEach((id) => {
                    const conn = data.get(id);
                    if (conn) storyDetailsStore.getState().updateConnectionStatus(id, conn)
                })
            }
            return { success: response.success, message: response.message};
        }, storyId, "Failed to add members");
    },

    processingMemberIds: new Set<string>(),

    kickStoryMembers: async (storyId: string, data: KickStoryMembersRequestBody) => {

        set((state) => {
            const newStoryIds = new Set(state.processingStoryIds);
            newStoryIds.add(storyId);

            const newMemberIds = new Set(state.processingMemberIds);
            data.memberIds.forEach(id => newMemberIds.add(id));

            return {
                processingStoryIds: newStoryIds,
                processingMemberIds: newMemberIds,
            };
        });

        try {
            const response = await kickStoryMembers(storyId, data);

            await new Promise((r) => setTimeout(r, 2000));

            if (response.success && response.data) {
                get().updateStoryInList(storyId, {members: response.data.members})
                homeFeedsStore.getState().updateStoryInHomeSlides(storyId, {members: response.data.members})
                storyDetailsStore.getState().updateStory({members: response.data.members})
            }

            return { success: response.success, message: response.message};
        } finally {

            set((state) => {
                const newStoryIds = new Set(state.processingStoryIds);
                newStoryIds.delete(storyId);

                const newMemberIds = new Set(state.processingMemberIds);
                data.memberIds.forEach(id => newMemberIds.delete(id));

                return {
                    processingStoryIds: newStoryIds,
                    processingMemberIds: newMemberIds,
                };
            });
        }
    },

    updateStory: async (storyId: string, data: UpdateStoryRequestBody) => {
        return runWithLoadingSet(set, "processingStoryIds", async () => {
            const response = await updateStory(storyId, data);

            await new Promise((r) => setTimeout(r, 1000));

            if (response.success && response.data) {
                get().updateStoryInList(storyId, {...response.data})

                homeFeedsStore.getState().updateStoryInHomeSlides(storyId, {...response.data})

                const currentStory = storyDetailsStore.getState().story;
                if (currentStory?.id === storyId) {
                    storyDetailsStore.getState().updateStory(response.data);
                }
            }
            return { success: response.success, message: response.message };
        }, storyId, "Failed to update story");
    },

    // --- Utils ---
    updateStoryInList: (storyId: string, data: Partial<Story>) => {
        set((state) => ({
            stories: state.stories.map((s) =>
                s.id === storyId ? { ...s, ...data } : s
            ),
            availableStories: state.availableStories.map((s) =>
                s.id === storyId ? { ...s, ...data } : s
            ),
        }));
    },
    resetStories: () => set({
        stories: [],
        isFetchingStories: false,
        storiesHasNext: false,
        storiesHasFetchedOnce: false,
        storiesCursorCreatedAt: undefined,
        storiesCursorId: undefined,
    }),
    resetAvailableStories: () => set({
        availableStories: [],
        isFetchingAvailableStories: false,
        availableStoriesHasNext: false,
        availableStoriesHasFetchedOnce: false,
        availableStoriesCursorCreatedAt: undefined,
        availableStoriesCursorId: undefined,
    }),
}));

export default storiesStore;

const addStoryIfNotExist = (state: StoriesState, story: Story) => {
    const exists =
        state.stories.some((s) => s.id === story.id) ||
        state.availableStories.some((s) => s.id === story.id);
    if (!exists) {
        return {
            stories: [story, ...state.stories],
            availableStories: [story, ...state.availableStories],
        };
    }
    return {};
};

const runWithLoadingSet = async <T extends object>(
    set: StoreApi<T>["setState"],
    key: keyof T,
    fn: () => Promise<ApiResult>,
    id: string,
    fallbackMessage: string
): Promise<ApiResult> => {
    // Add ID vào Set
    set((state: T) => {
        const newSet = new Set((state[key] as Set<string>) ?? []);
        newSet.add(id);
        return { [key]: newSet } as Partial<T>;
    });

    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) console.error(error.message);
        return { success: false, message: fallbackMessage };
    } finally {
        // Xóa ID khỏi Set
        set((state: T) => {
            const newSet = new Set((state[key] as Set<string>) ?? []);
            newSet.delete(id);
            return { [key]: newSet } as Partial<T>;
        });
    }
};

const runWithLoadingFlag = async (
    set: (state: Partial<StoriesState>) => void,
    loadingKey: keyof StoriesState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<StoriesState>);
    try {
        return await fn();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<StoriesState>);
    }
};

export const useStoriesStore = <T>(
    selector: (state: StoriesState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(storiesStore, selector, equals);
