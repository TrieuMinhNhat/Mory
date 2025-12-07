"use client"

import {MomentReaction} from "@/types/moment";
import {create} from "zustand/index";
import {fetchMomentReactions} from "@/lib/services/moments.service";

interface MomentReactionsDrawerState {
    open: boolean;
    currentMomentId: string | null;
    reactions: MomentReaction[];
    isFetchingReactions: boolean;
    openDrawer: (params: { momentId?: string; reactions?: MomentReaction[] }) => Promise<void>;
    closeDrawer: () => void;
}

export const useMomentReactionsDrawerStore = create<MomentReactionsDrawerState>((set, get) => ({
    open: false,
    currentMomentId: null,
    reactions: [],
    isFetchingReactions: false,

    openDrawer: async ({ momentId, reactions }) => {
        if (reactions) {
            set({
                open: true,
                reactions: reactions,
                isFetchingReactions: false,
                currentMomentId: momentId || null,
            });
            return;
        }
        if (!momentId) return;
        const { currentMomentId } = get();

        if (currentMomentId === momentId) {
            set({ open: true });
            return;
        }

        try {
            set({
                open: true,
                currentMomentId: momentId,
                isFetchingReactions: true,
                reactions: [],
            });

            const response = await fetchMomentReactions(momentId);
            await new Promise((r) => setTimeout(r, 1000));
            if (response.success) {
                set({
                    reactions: response.data.reactions,
                });
            }
        } catch (error) {
            console.error("Failed to fetch moment reactions:", error);
        } finally {
            set({ isFetchingReactions: false });
        }
    },

    closeDrawer: () => set({ open: false }),
}))