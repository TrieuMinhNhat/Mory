"use client"

import { create } from "zustand"
import { Story } from "@/types/moment"

interface CreateMomentDialogState {
    open: boolean
    selectedStory: Story | null
    openDialog: (story?: Story) => void
    closeDialog: () => void,
}

export const useCreateMomentDialogStore = create<CreateMomentDialogState>((set) => ({
    open: false,
    selectedStory: null,
    openDialog: (story) => set({ open: true, selectedStory: story}),
    closeDialog: () => set({ open: false, selectedStory: null }),
}))
