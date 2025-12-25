"use client"

import { create } from "zustand"
import { Story } from "@/types/moment"

interface LeaveStoryDialogState {
    open: boolean
    selectedStory: Story | null
    openDialog: (story: Story, action?: (() => void) | null) => void
    closeDialog: () => void,
    action: (() => void) | null
}


export const useLeaveStoryDialogStore = create<LeaveStoryDialogState>((set) => ({
    open: false,
    selectedStory: null,
    action: null,
    openDialog: (story, action = null) =>
        set({ open: true, selectedStory: story, action: action }),
    closeDialog: () => set({ open: false, selectedStory: null }),

}))
