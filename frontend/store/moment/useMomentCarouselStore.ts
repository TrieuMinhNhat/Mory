"use client"

import { create } from "zustand"
import {Moment} from "@/types/moment"

interface MomentCarouselState {
    open: boolean
    moments: Moment[],
    storyId: string | undefined,
    title: string | undefined
    currentIndex: number | undefined
    hasNext: boolean
    onFetchMore?: () => Promise<void>

    updateMoment: (id: string, update: Partial<Moment>) => void,
    removeMoment: (id: string) => void,

    openCarousel: (params: {
        moments: Moment[],
        storyId?: string,
        title: string,
        currentIndex: number,
        hasNext: boolean
        onFetchMore?: () => Promise<void>
    }) => void
    closeCarousel: () => void
    appendMomentsAndUpdateHasNext: (newMoments: Moment[], hasNext: boolean) => void;
}

export const useMomentCarouselStore = create<MomentCarouselState>((set) => ({
    open: false,
    moments: [],
    storyId: undefined,
    title: undefined,
    currentIndex: undefined,
    hasNext: false,
    onFetchMore: undefined,

    openCarousel: ({ moments, storyId, title, currentIndex, hasNext, onFetchMore }) => {
        set({
            open: true,
            storyId: storyId,
            title: title,
            moments: moments,
            currentIndex: currentIndex,
            hasNext: hasNext,
            onFetchMore: onFetchMore,
        })

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
    closeCarousel: () => {
        set({
            open: false,
            moments: [],
            storyId: undefined,
            title: undefined,
            currentIndex: undefined,
            hasNext: false,
            onFetchMore: undefined,
        })
    },

    appendMomentsAndUpdateHasNext: (newMoments: Moment[], hasNext: boolean) =>
        set((state) => {
            const existingIds = new Set(state.moments.map((m) => m.id));
            const uniqueNewMoments = newMoments.filter((m) => !existingIds.has(m.id));
            return {
                moments: [...state.moments, ...uniqueNewMoments],
                hasNext,
            };
        }),
}))

