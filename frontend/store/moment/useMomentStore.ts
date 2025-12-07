import {createStore, StoreApi} from "zustand/vanilla";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { ApiResult } from "@/types/auth";
import {
    createStandAloneMoment,
    createStoryMoment, deleteMoment, toggleReaction, updateMomentMilestone, updateMomentVisibility,
} from "@/lib/services/moments.service";
import { CreateStandAloneFormValue, CreateStoryMomentFormValue } from "@/lib/validations/moment.validation";
import { authStore } from "@/store/useAuthStore";
import { homeFeedsStore } from "@/store/useHomeFeedsStore";
import {Moment, ReactionType, Story, Visibility} from "@/types/moment";
import storiesStore from "@/store/story/useStoriesStore";
import storyDetailsStore from "@/store/story/useStoryDetailsStore";
import {useMomentCarouselStore} from "@/store/moment/useMomentCarouselStore";
import profileStore from "@/store/profie/useProfileStore";

interface MomentStoreState {
    isCreatingMoment: boolean;
    createStandaloneMoment: (data: CreateStandAloneFormValue) => Promise<ApiResult>;
    createStoryMoment: (storyId: string, data: CreateStoryMomentFormValue) => Promise<ApiResult>;

    processingMomentIds: Set<string>;
    updateMomentVisibility: (momentId: string, visibility: Visibility, storyId?: string) => Promise<ApiResult>;
    updateMomentMilestone: (momentId: string, milestone: boolean, storyId?: string) => Promise<ApiResult>;
    deleteMoment: (momentId: string, storyId?: string) => Promise<ApiResult>;
    toggleReaction: (momentId: string, reactionType: ReactionType, storyId?: string) => Promise<ApiResult>;
}

const momentStore = createStore<MomentStoreState>()((set) => ({
    isCreatingMoment: false,

    createStandaloneMoment: async (data): Promise<ApiResult> => {
        return runWithLoadingFlag(set, async () => {
            const { user } = authStore.getState();
            if (!user) return { success: false, message: "User not authenticated" };
            const response = await createStandAloneMoment(user.id, data);
            if (response.success && response.data) {
                const newMoment = response.data;
                await homeFeedsStore.getState().addMomentToHomeSlides(newMoment);
                profileStore.getState().addMoment(newMoment);
            }
            return { success: response.success, message: response.message };
        }, "Failed to create standalone moment");
    },

    createStoryMoment: async (storyId, data): Promise<ApiResult> => {
        return runWithLoadingFlag(set, async () => {
            const { user } = authStore.getState();
            if (!user) return { success: false, message: "User not authenticated" };
            const response = await createStoryMoment(storyId, user.id, data);
            if (response.success && response.data) {
                const newMoment = response.data as Moment;
                const storiesState = storiesStore.getState();
                const currentStoryDetails = storyDetailsStore.getState().story;

                 if (storyId === currentStoryDetails?.id) {
                     storyDetailsStore.getState().appendMoment(newMoment);
                 }

                const story = storiesState.stories.find(s => s.id === storyId) || storiesState.availableStories.find(s => s.id === storyId);
                if (story) {
                    const oldTotalMoments = story.totalMoments || 0;
                    storiesState.updateStoryInList(storyId, { totalMoments: oldTotalMoments + 1 });
                    if (story.id === currentStoryDetails?.id) {
                        storyDetailsStore.getState().updateStory({totalMoments: oldTotalMoments + 1});
                    }
                } else if (storyId === currentStoryDetails?.id) {
                    const oldTotalMoments = currentStoryDetails.totalMoments || 0;
                    storyDetailsStore.getState().updateStory({totalMoments: oldTotalMoments + 1});
                }

                const homeFeedsState = homeFeedsStore.getState();

                const slideIndex = homeFeedsState.slides.findIndex(
                    (slide) => slide.id === storyId
                );
                if (slideIndex !== -1) {
                    const oldSlide = homeFeedsState.slides[slideIndex];
                    const oldTotalMoments = (oldSlide.content as Story).totalMoments || 0;
                    homeFeedsState.updateStoryInHomeSlides(storyId, {totalMoments: oldTotalMoments + 1});
                }
                await homeFeedsStore.getState().addMomentToHomeSlides(newMoment);
                profileStore.getState().addMoment(newMoment);
            }
            return { success: response.success, message: response.message };
        }, "Failed to create story moment");
    },

    processingMomentIds: new Set<string>(),

    updateMomentVisibility: async (momentId, visibility) =>
        runWithLoadingSet(set, "processingMomentIds", async () => {
            const response = await updateMomentVisibility(momentId, visibility);
            if (response.success && response.data) {
                homeFeedsStore.getState().updateMomentInHomeSlides(momentId, {
                    visibility: response.data.visibility,
                });
                profileStore.getState().updateMoment(momentId, {visibility: response.data.visibility})
                storyDetailsStore.getState().updateMoment(momentId, {visibility: response.data.visibility})
                useMomentCarouselStore.getState().updateMoment(momentId, {visibility: response.data.visibility})
            }
            return { success: response.success, message: response.message };
        }, momentId, "Failed to update moment visibility"),

    updateMomentMilestone: async (momentId, milestone) =>
        runWithLoadingSet(set, "processingMomentIds", async () => {
            const response = await updateMomentMilestone(momentId, milestone);
            if (response.success && response.data) {
                homeFeedsStore.getState().updateMomentInHomeSlides(momentId, {
                    milestone: response.data.milestone,
                });
                profileStore.getState().updateMoment(momentId, {milestone: response.data.milestone})
                storyDetailsStore.getState().updateMoment(momentId, {milestone: response.data.milestone})
                useMomentCarouselStore.getState().updateMoment(momentId, {milestone: response.data.milestone})
            }
            return { success: response.success, message: response.message };
        }, momentId, "Failed to update moment milestone"),

    deleteMoment: async (momentId) =>
        runWithLoadingSet(set, "processingMomentIds", async () => {
            const response = await deleteMoment(momentId);
            if (response.success) {
                homeFeedsStore.getState().removeMomentFromHomeSlides(momentId);
                profileStore.getState().removeMoment(momentId)
                storyDetailsStore.getState().removeMoment(momentId);
                useMomentCarouselStore.getState().removeMoment(momentId);
            }
            return { success: response.success, message: response.message };
        }, momentId, "Failed to delete moment"),

    toggleReaction: async (momentId, reactionType) =>
        runWithLoadingSet(set, "processingMomentIds", async () => {
            console.log("toggle", reactionType)
            const response = await toggleReaction(momentId, reactionType);
            if (response.success) {
                homeFeedsStore.getState().updateMomentInHomeSlides(momentId, {
                    myReaction: response.data.userReaction,
                })
                profileStore.getState().updateMoment(momentId, {
                    myReaction: response.data.userReaction
                })
                storyDetailsStore.getState().updateMoment(momentId, {
                    myReaction: response.data.userReaction
                })
                useMomentCarouselStore.getState().updateMoment(momentId, {
                    myReaction: response.data.userReaction
                })
            }
            return { success: response.success, message: response.message, data: response.data.userReaction};
        }, momentId, "Failed to toggle reaction"),
}));

// --- Utility ---
const runWithLoadingFlag = async (
    set: (state: Partial<MomentStoreState>) => void,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ isCreatingMoment: true });
    try {
        return await fn();
    } catch (error: unknown) {
        console.error(error);
        return { success: false, message: fallbackMessage };
    } finally {
        set({ isCreatingMoment: false });
    }
};

const runWithLoadingSet = async <T extends object>(
    set: StoreApi<T>["setState"],
    key: keyof T,
    fn: () => Promise<ApiResult>,
    id: string,
    fallbackMessage: string
): Promise<ApiResult> => {
    // add id
    set((state: T) => {
        const newSet = new Set((state[key] as Set<string>) ?? []);
        newSet.add(id);
        return { [key]: newSet } as Partial<T>;
    });

    try {
        return await fn();
    } catch (error: unknown) {
        console.error(error);
        return { success: false, message: fallbackMessage };
    } finally {
        // remove id
        set((state: T) => {
            const newSet = new Set((state[key] as Set<string>) ?? []);
            newSet.delete(id);
            return { [key]: newSet } as Partial<T>;
        });
    }
};

export const useMomentStore = <T>(
    selector: (state: MomentStoreState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(momentStore, selector, equals);
