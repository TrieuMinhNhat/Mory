"use client"

import { create } from "zustand"
import { Story } from "@/types/moment"
 

interface StoryDrawerState {
    open: boolean
    selectedStory: Story | null
    openDrawer: (story: Story, action?: (() => void) | null) => void
    closeDrawer: () => void,
    action: (() => void) | null
}

export const useStoryDrawerStore = create<StoryDrawerState>((set) => ({
    open: false,
    selectedStory: null,

    action: null,
    openDrawer: (story, action = null) =>
        set({ open: true, selectedStory: story, action: action }),
    closeDrawer: () => set({ open: false, selectedStory: null }),
}))
