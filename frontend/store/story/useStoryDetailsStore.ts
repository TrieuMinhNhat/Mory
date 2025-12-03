import {Moment, Story, StoryPreview} from "@/types/moment"
import {create} from "zustand";
import {ConnectionStatus, ConnectionType, ConnectionTypeStatus} from "@/types/connections";
import {fetchConnections} from "@/lib/services/connections.service";
import {UserPreview} from "@/types/user";
import {ApiResult} from "@/types/auth";
import {fetchMomentsByStoryId} from "@/lib/services/moments.service";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {fetchStory} from "@/lib/services/stories.service";

interface StoryDetailsState {
    setStory: (story: Story | StoryPreview) => void,
    updateStory: (update: Partial<Story>) => void,
    story: Story | null,
    error: string | null,
    isFetchingStory: boolean,
    fetchStory: (storyId: string) => Promise<ApiResult>,

    moments: Moment[],
    isFetchingMoments: boolean,
    fetchStoryMoments: (storyId: string, params?: {size?: number;  order?: "ASC" | "DESC";}) => Promise<ApiResult>,
    momentsHasNext: boolean,
    momentsHasFetchedOnce: boolean,
    momentsCursorCreatedAt?: string,
    momentsCursorId?: string,

    connectionStatusMap: Map<string, ConnectionTypeStatus>;
    isFetchingConnections: boolean;
    fetchConnections: (userIds: string[]) => Promise<void>;
    connectionsHasFetchedOnce: boolean;

    // --- Utils ---
    updateConnectionStatus: (userId: string, update: Partial<ConnectionTypeStatus>) => void,
    removeConnectionStatus: (userId: string) => void,
    appendMoment: (moment: Moment) => void,
    updateMoment: (id: string, update: Partial<Moment>) => void,
    removeMoment: (id: string) => void,
    reset: () => void;
}

const storyDetailsStore = create<StoryDetailsState>((set, get) => ({
    story: null,
    error: null,
    setStory: async (story) => {
        const currentStory = get().story;
        if (currentStory?.id !== story.id && "members" in story) {
            get().reset();
            set({ story });
            if (story.members.length > 0) 
                void get().fetchConnections(story.members.map((m) => m.id))

        } else if (currentStory?.id !== story.id && !("members" in story)) {
            get().reset();
            const result = await get().fetchStory(story.id);
            const fetchedStory = result.data as Story
            if (fetchedStory.members.length > 0)
                void get().fetchConnections(fetchedStory.members.map((m) => m.id))
        }
    },
    isFetchingStory: false,
    
    fetchStory: async (storyId) => {
        try {
            set({isFetchingStory: true})
            const response = await fetchStory(storyId);

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set({story: response.data})
            }
            return {success: response.success, message: response.message, data: response.data}
        } catch {
            set({error: "Failed to fetch story"})
            return {success: false, message: "Failed to fetch story"}
        } finally {
            set({isFetchingStory: false})
        }
    },
    
    updateStory: (update) =>
        set((state) => ({
            story: state.story ? { ...state.story, ...update } : null,
        })),

    moments: [],
    isFetchingMoments: false,
    fetchStoryMoments: async (
        storyId,
        {
            size = 10,
            order = "DESC"
        } : {
            size?: number;
            order?: "ASC" | "DESC"
        } = {}
    ) => {
        set({isFetchingMoments: true})
        const {momentsCursorCreatedAt, momentsCursorId}= get()
        try {
            const response = await fetchMomentsByStoryId(storyId, {
                cursorCreatedAt: momentsCursorCreatedAt,
                cursorId: momentsCursorId,
                size,
                order
            });
            await new Promise((r) => setTimeout(r, 1000));
            if (response.success) {
                const newMoments: Moment[] = response.data.moments ?? []
                const existingIds = new Set(get().moments.map(m => m.id));
                const uniqueNewMoments = newMoments.filter(m => !existingIds.has(m.id));

                const updatedMoments = order === "DESC"
                    ? [...get().moments, ...uniqueNewMoments]
                    : [...uniqueNewMoments, ...get().moments];

                set((state) => {
                    return {
                        moments: updatedMoments,
                        momentsCursorCreatedAt: response.data.nextCursorCreatedAt ?? undefined,
                        momentsCursorId: response.data.nextCursorId ?? undefined,
                        momentsHasNext: response.data.hasNext ?? false,
                        momentsHasFetchedOnce: state.momentsHasFetchedOnce || true,
                    }
                });
            }
            return { success: response.success, message: response.message, data: response.data };
        } catch {
            return { success: false, message: "Failed to fetch story moments" };
        } finally {
            set({ isFetchingMoments: false });
        }
    },
    momentsHasFetchedOnce: false,
    momentsHasNext: true,
    momentsCursorCreatedAt: undefined,
    momentsCursorId: undefined,

    connectionStatusMap: new Map(),
    isFetchingConnections: false,
    connectionsHasFetchedOnce: false,
    fetchConnections: async (userIds: string[]) => {
        if (!userIds.length) return;
        set({ isFetchingConnections: true });
        try {
            const response = await fetchConnections(userIds);
            if (response.success) {
                const connections = response.data.connections;

                set((state) => {
                    const newMap = new Map(state.connectionStatusMap);
                    connections.forEach(
                        ({
                             userId,
                             connectionType,
                             status,
                             mutualConnections
                        }: {
                            userId: string,
                            connectionType: ConnectionType,
                            status: ConnectionStatus,
                            mutualConnections: UserPreview[]
                        }) => {
                        newMap.set(userId, { connectionType, status, mutualConnections });
                    });
                    return {
                        connectionStatusMap: newMap,
                        connectionsHasFetchedOnce: state.connectionsHasFetchedOnce || true
                    };
                });
            }
        } catch {

        } finally {
            set({ isFetchingConnections: false });
        }
    },

    // --- Utils ---
    updateConnectionStatus: (
        userId: string,
        update: Partial<ConnectionTypeStatus>
    ) => {
        set((state) => {
            const newMap = new Map(state.connectionStatusMap);

            const existing = newMap.get(userId);

            if (existing) {
                newMap.set(userId, { ...existing, ...update });
            } else {
                newMap.set(userId, {
                    connectionType: update.connectionType,
                    status: update.status,
                    mutualConnections: update.mutualConnections ?? [],
                });
            }

            return { connectionStatusMap: newMap };
        });
    },
    removeConnectionStatus: (userId: string) => {
        set((state) => {
            const newMap = new Map(state.connectionStatusMap);

            if (!newMap.has(userId)) return {};

            newMap.delete(userId);

            return { connectionStatusMap: newMap };
        });
    },
    updateMoment: (id, update) => {
        set((state) => ({
            moments: state.moments.map((m) =>
                m.id === id ? { ...m, ...update } : m
            ),
        }));
    },
    removeMoment: (id) => {
        set((state) => ({
            moments: state.moments.filter((m) => m.id !== id),
        }));
    },
    appendMoment: (newMoment: Moment) => {
        set((state) => {
            const exists = state.moments.some(m => m.id === newMoment.id);
            if (exists) {
                return {};
            }
            return {
                moments: [newMoment, ...state.moments]
            };
        });
    },
    reset: () => {
        set({
            story: null,
            isFetchingConnections: false,
            connectionStatusMap: new Map(),
            connectionsHasFetchedOnce: false,
            moments: [],
            isFetchingMoments: false,
            momentsHasFetchedOnce: false,
            momentsHasNext: true,
            momentsCursorCreatedAt: undefined,
            momentsCursorId: undefined,
        });
    }
}))

export default storyDetailsStore;

export const useStoryDetailsStore = <T>(
    selector: (state: StoryDetailsState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(storyDetailsStore, selector, equals);